'use client'
import { useEffect, useState } from 'react'
import { emulatorMode, getSession } from '../../firebase/firebase.config'
import { DEPARTMENTS, readableError } from '@/lib/employee'
import type { Employee, EmployeeData } from '@/lib/employee'
import {
  createEmployee,
  deleteEmployee,
  editEmployee,
  fetchEmployees,
} from '@/lib/employees'
import type { Session } from '@/lib/employees'
import EmployeeForm from './EmployeeForm'
import DeleteDialog from './DeleteDialog'

export default function EmployeeCatalog() {
  const [session, setSession] = useState<Session | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState<{ employee: Employee | null } | null>(null)
  const [deleting, setDeleting] = useState<Employee | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [status, setStatus] = useState('all')
  useEffect(() => {
    let active = true
    getSession()
      .then(async (current) => {
        const data = await fetchEmployees(current)
        if (active) {
          setSession(current)
          setEmployees(data)
        }
      })
      .catch((e) => {
        if (active) setError(readableError(e))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])
  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const current = await getSession()
      setEmployees(await fetchEmployees(current))
      setSession(current)
    } catch (e) {
      setError(readableError(e))
    } finally {
      setLoading(false)
    }
  }
  async function save(data: EmployeeData) {
    if (!session)
      throw new Error('Espera a que se establezca la conexión con Firebase.')
    setSaving(true)
    setNotice('')
    try {
      if (form?.employee) await editEmployee(session, form.employee.id, data)
      else await createEmployee(session, data)
      setNotice(
        form?.employee
          ? 'Cambios guardados en Firestore.'
          : 'Empleado agregado a Firestore.',
      )
      setForm(null)
      setSearch('')
      setDepartment('all')
      setStatus('all')
      await refresh()
    } catch (e) {
      throw new Error(readableError(e))
    } finally {
      setSaving(false)
    }
  }
  async function remove() {
    if (!session || !deleting) return
    setSaving(true)
    setDeleteError('')
    setNotice('')
    try {
      await deleteEmployee(session, deleting.id)
      setDeleting(null)
      setNotice('Empleado eliminado de Firestore.')
      await refresh()
    } catch (e) {
      setDeleteError(readableError(e))
    } finally {
      setSaving(false)
    }
  }
  const query = search.trim().toLocaleLowerCase('es')
  const filtered = employees.filter(
    (e) =>
      `${e.name} ${e.email} ${e.position}`
        .toLocaleLowerCase('es')
        .includes(query) &&
      (department === 'all' || e.department === department) &&
      (status === 'all' || e.status === status),
  )
  const busy = loading || saving
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="./">
          <span className="logo-mark">e</span>equipo
          <span className="brand-dot">.</span>
        </a>
        <p className="nav-caption">ESPACIO DE TRABAJO</p>
        <div className="nav-item">
          <span aria-hidden="true">▦</span> Empleados{' '}
          <span className="nav-count">{employees.length}</span>
        </div>
        <div className="sidebar-bottom">
          <span className="lab-chip">LAB 02</span>
          <p>Desarrollo de software</p>
          <small>Next.js + Firebase</small>
        </div>
      </aside>
      <div className="content">
        <header className="topbar">
          <span>
            DIRECTORIO <i>/</i> CATÁLOGO DE EMPLEADOS
          </span>
          <span
            className={`connection ${session && !error ? 'connected' : ''}`}
          >
            <i />
            {loading
              ? 'Conectando…'
              : error
                ? 'Revisar conexión'
                : emulatorMode
                  ? 'Firebase local'
                  : 'Firebase conectado'}
          </span>
        </header>
        <main>
          <div className="heading">
            <div>
              <p className="eyebrow">PERSONAS QUE HACEN EQUIPO</p>
              <h1>Tu equipo, en un solo lugar.</h1>
              <p className="intro">
                Consulta y organiza la información de tus colaboradores.
              </p>
            </div>
            <button
              className="primary"
              disabled={busy || !session}
              onClick={() => setForm({ employee: null })}
            >
              <span aria-hidden="true">＋</span> Nuevo empleado
            </button>
          </div>
          <section className="stats" aria-label="Resumen del catálogo">
            <article>
              <span>Empleados registrados</span>
              <strong>{employees.length.toString().padStart(2, '0')}</strong>
              <small>En tu catálogo</small>
            </article>
            <article>
              <span>Empleados activos</span>
              <strong>
                {employees
                  .filter((e) => e.status === 'active')
                  .length.toString()
                  .padStart(2, '0')}
                <i className="green-dot" />
              </strong>
              <small>Con estado activo</small>
            </article>
            <article>
              <span>Departamentos</span>
              <strong>
                {new Set(employees.map((e) => e.department)).size
                  .toString()
                  .padStart(2, '0')}
              </strong>
              <small>Representados en el equipo</small>
            </article>
          </section>
          <div className="notice" role="status">
            {notice}
          </div>
          {error && (
            <div className="error-banner" role="alert">
              <p>{error}</p>
              <button className="secondary" disabled={busy} onClick={refresh}>
                Reintentar conexión
              </button>
            </div>
          )}
          <section className="directory" aria-labelledby="directory-title">
            <div className="directory-header">
              <div>
                <h2 id="directory-title">
                  Directorio de empleados <span>{employees.length}</span>
                </h2>
                <p>Los datos se guardan en Cloud Firestore.</p>
              </div>
              <button
                className="secondary refresh"
                disabled={busy}
                onClick={refresh}
              >
                ↻ Actualizar
              </button>
            </div>
            <div className="filters">
              <label className="search">
                <span className="sr-only">Buscar empleado</span>
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder="Buscar nombre, correo o puesto…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <label>
                <span className="sr-only">Filtrar por departamento</span>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="all">Todos los departamentos</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Filtrar por estado</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </label>
            </div>
            {loading ? (
              <div className="empty" role="status">
                <span className="loading-dot" />
                <h3>Cargando tu equipo…</h3>
                <p>Consultando los registros de Firebase.</p>
              </div>
            ) : filtered.length ? (
              <div className="table-wrap">
                <table>
                  <caption className="sr-only">Catálogo de empleados</caption>
                  <thead>
                    <tr>
                      <th scope="col">Empleado</th>
                      <th scope="col">Puesto</th>
                      <th scope="col">Departamento</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <div className="person">
                            <span className="avatar" aria-hidden="true">
                              {e.name
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                            </span>
                            <div>
                              <strong>{e.name}</strong>
                              <span>{e.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{e.position}</td>
                        <td>
                          <span className="department-tag">{e.department}</span>
                        </td>
                        <td>
                          <span className={`status-tag ${e.status}`}>
                            <i />
                            {e.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              disabled={busy}
                              aria-label={`Editar ${e.name}`}
                              onClick={() => setForm({ employee: e })}
                            >
                              Editar
                            </button>
                            <button
                              disabled={busy}
                              className="danger-text"
                              aria-label={`Eliminar ${e.name}`}
                              onClick={() => {
                                setDeleting(e)
                                setDeleteError('')
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">
                <div className="empty-icon" aria-hidden="true">
                  ▤
                </div>
                <h3>
                  {error
                    ? 'No se pudo cargar el directorio'
                    : employees.length
                      ? 'No hay coincidencias'
                      : 'El siguiente gran equipo empieza aquí'}
                </h3>
                <p>
                  {error
                    ? 'Revisa la conexión y vuelve a intentarlo.'
                    : employees.length
                      ? 'Prueba con otro término o cambia los filtros.'
                      : 'Agrega a tu primer empleado para empezar a organizar el catálogo.'}
                </p>
                {employees.length > 0 ? (
                  <button
                    className="secondary"
                    onClick={() => {
                      setSearch('')
                      setDepartment('all')
                      setStatus('all')
                    }}
                  >
                    Limpiar filtros
                  </button>
                ) : (
                  !error && (
                    <button
                      className="primary"
                      disabled={!session}
                      onClick={() => setForm({ employee: null })}
                    >
                      ＋ Agregar primer empleado
                    </button>
                  )
                )}
              </div>
            )}
            <div className="table-footer">
              <span>
                {loading
                  ? 'Cargando registros…'
                  : `${filtered.length} de ${employees.length} empleados`}
              </span>
              <span>Ordenados por nombre</span>
            </div>
          </section>
          <footer>
            <span>LAB2 CRUD FIREBASE</span>
            <span>
              {emulatorMode
                ? 'Entorno local · Emuladores oficiales de Firebase'
                : 'Cloud Firestore · Catálogo privado de tu sesión'}
            </span>
          </footer>
        </main>
      </div>
      {form && (
        <EmployeeForm
          employee={form.employee}
          busy={saving}
          onSave={save}
          onClose={() => setForm(null)}
        />
      )}
      {deleting && (
        <DeleteDialog
          employee={deleting}
          busy={saving}
          error={deleteError}
          onConfirm={remove}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
