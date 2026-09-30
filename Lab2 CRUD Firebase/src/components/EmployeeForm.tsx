'use client'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { DEPARTMENTS, EMPTY_EMPLOYEE, normalizeEmployee } from '@/lib/employee'
import type { Employee, EmployeeData } from '@/lib/employee'

export default function EmployeeForm({
  employee,
  busy,
  onSave,
  onClose,
}: {
  employee: Employee | null
  busy: boolean
  onSave: (data: EmployeeData) => Promise<void>
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [values, setValues] = useState<EmployeeData>(
    employee
      ? {
          name: employee.name,
          email: employee.email,
          position: employee.position,
          department: employee.department,
          status: employee.status,
        }
      : EMPTY_EMPLOYEE,
  )
  const [error, setError] = useState('')
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      await onSave(normalizeEmployee(values))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo guardar.')
    }
  }
  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby="form-title"
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) onClose()
      }}
    >
      <div className="modal-header">
        <div>
          <p className="eyebrow">CATÁLOGO DE PERSONAL</p>
          <h2 id="form-title">
            {employee ? 'Editar empleado' : 'Nuevo empleado'}
          </h2>
        </div>
        <button
          className="icon-button"
          aria-label="Cerrar formulario"
          disabled={busy}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <p className="muted">Todos los campos son obligatorios.</p>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label htmlFor="name">Nombre completo</label>
          <input
            id="name"
            autoFocus
            required
            maxLength={100}
            value={values.name}
            placeholder="Ej. Ana Martínez"
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            required
            maxLength={254}
            value={values.email}
            placeholder="ana@empresa.com"
            onChange={(e) => setValues({ ...values, email: e.target.value })}
          />
          <label htmlFor="position">Puesto</label>
          <input
            id="position"
            required
            maxLength={80}
            value={values.position}
            placeholder="Ej. Desarrolladora de software"
            onChange={(e) => setValues({ ...values, position: e.target.value })}
          />
          <div className="form-row">
            <div>
              <label htmlFor="department">Departamento</label>
              <select
                id="department"
                value={values.department}
                onChange={(e) =>
                  setValues({
                    ...values,
                    department: e.target.value as EmployeeData['department'],
                  })
                }
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                value={values.status}
                onChange={(e) =>
                  setValues({
                    ...values,
                    status: e.target.value as EmployeeData['status'],
                  })
                }
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="primary" type="submit">
              {busy
                ? 'Guardando…'
                : employee
                  ? 'Guardar cambios'
                  : 'Agregar empleado'}
            </button>
          </div>
        </fieldset>
      </form>
    </dialog>
  )
}
