import { useEffect, useMemo, useState } from 'react'
import DeleteDialog from './DeleteDialog'
import TaskForm from './TaskForm'
import type { Todo, TodoInput } from '../lib/todo'
import { friendlyError } from '../lib/todo'
import type { TodoRepository } from '../lib/todoRepository'

type Filter = 'all' | 'pending' | 'completed'

export default function TaskBoard({ repository }: { repository: TodoRepository }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [form, setForm] = useState<{ todo: Todo | null } | null>(null)
  const [deleting, setDeleting] = useState<Todo | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      setTodos(await repository.list())
    } catch (error) {
      setError(friendlyError(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    repository
      .list()
      .then((items) => {
        if (active) setTodos(items)
      })
      .catch((error: unknown) => {
        if (active) setError(friendlyError(error))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [repository])

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es')
    return todos.filter((todo) => {
      const statusMatches = filter === 'all' || (filter === 'completed' ? todo.is_completed : !todo.is_completed)
      const textMatches = !query || `${todo.title} ${todo.description}`.toLocaleLowerCase('es').includes(query)
      return statusMatches && textMatches
    })
  }, [todos, search, filter])

  async function save(input: TodoInput) {
    setBusy(true)
    setError('')
    try {
      const saved = form?.todo
        ? await repository.update(form.todo.id, input)
        : await repository.create(input)
      setTodos((current) =>
        form?.todo
          ? current.map((todo) => (todo.id === saved.id ? saved : todo))
          : [saved, ...current],
      )
      setNotice(form?.todo ? 'Tarea actualizada en Supabase.' : 'Tarea creada en Supabase.')
      setForm(null)
    } catch (error) {
      throw new Error(friendlyError(error), { cause: error })
    } finally {
      setBusy(false)
    }
  }

  async function toggle(todo: Todo) {
    setBusy(true)
    setError('')
    try {
      const updated = await repository.toggle(todo.id, !todo.is_completed)
      setTodos((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setNotice(updated.is_completed ? 'Tarea marcada como completada.' : 'Tarea reabierta.')
    } catch (error) {
      setError(friendlyError(error))
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!deleting) return
    setBusy(true)
    try {
      await repository.remove(deleting.id)
      setTodos((current) => current.filter((todo) => todo.id !== deleting.id))
      setNotice('Tarea eliminada de Supabase.')
      setDeleting(null)
    } catch (error) {
      setError(friendlyError(error))
    } finally {
      setBusy(false)
    }
  }

  const pending = todos.filter((todo) => !todo.is_completed).length
  const completed = todos.length - pending

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="./" aria-label="Foco inicio"><span>◆</span> foco.</a>
        <p className="nav-label">ESPACIO DE TRABAJO</p>
        <div className="nav-item active"><span>▣</span> Mis tareas <b>{pending}</b></div>
        <div className="nav-item"><span>✓</span> Completadas <b>{completed}</b></div>
        <div className="sidebar-footer">
          <span>LAB 03</span>
          <p>Desarrollo de software</p>
          <small>React + Supabase</small>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <span>TAREAS <i>/</i> TABLERO PERSONAL</span>
          <span className="connected"><i /> Supabase conectado</span>
        </header>
        <main className="board">
          <section className="hero">
            <div>
              <p className="eyebrow">ORGANIZA · AVANZA · COMPLETA</p>
              <h1>Haz espacio para<br />lo que importa.</h1>
              <p>Un lugar tranquilo para ordenar tus pendientes.</p>
            </div>
            <button className="primary" onClick={() => setForm({ todo: null })} disabled={busy}>＋ Nueva tarea</button>
          </section>

          <section className="summary" aria-label="Resumen de tareas">
            <article><span>Total de tareas</span><strong>{String(todos.length).padStart(2, '0')}</strong><small>En tu tablero</small></article>
            <article><span>Por completar</span><strong>{String(pending).padStart(2, '0')}<i /></strong><small>Requieren atención</small></article>
            <article><span>Completadas</span><strong>{String(completed).padStart(2, '0')}</strong><small>Buen trabajo</small></article>
          </section>

          <div className="notice" role="status">{notice}</div>
          {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => void load()}>Reintentar</button></div>}

          <section className="tasks-panel" aria-labelledby="tasks-title">
            <div className="panel-header">
              <div><h2 id="tasks-title">Mis tareas <span>{todos.length}</span></h2><p>Los cambios se sincronizan con Supabase.</p></div>
              <button className="secondary" onClick={() => void load()} disabled={busy || loading}>↻ Actualizar</button>
            </div>
            <div className="toolbar">
              <label className="search"><span aria-hidden="true">⌕</span><span className="sr-only">Buscar tareas</span><input type="search" placeholder="Buscar tareas…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
              <div className="filter-group" aria-label="Filtrar tareas">
                {(['all', 'pending', 'completed'] as Filter[]).map((value) => (
                  <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>
                    {value === 'all' ? 'Todas' : value === 'pending' ? 'Pendientes' : 'Completadas'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <EmptyState title="Cargando tus tareas…" text="Consultando la tabla pendientes en Supabase." />
            ) : visible.length ? (
              <div className="task-list">
                {visible.map((todo) => (
                  <article className={`task ${todo.is_completed ? 'done' : ''}`} key={todo.id}>
                    <button className="check" aria-label={`${todo.is_completed ? 'Reabrir' : 'Completar'} ${todo.title}`} onClick={() => void toggle(todo)} disabled={busy}>{todo.is_completed ? '✓' : ''}</button>
                    <div className="task-copy">
                      <div className="task-title"><h3>{todo.title}</h3><span className={`priority ${todo.priority}`}>{todo.priority === 'high' ? 'Alta' : todo.priority === 'medium' ? 'Media' : 'Baja'}</span></div>
                      {todo.description && <p>{todo.description}</p>}
                      <small>Creada {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(todo.created_at))}</small>
                    </div>
                    <div className="task-actions">
                      <button onClick={() => setForm({ todo })} disabled={busy} aria-label={`Editar ${todo.title}`}>Editar</button>
                      <button className="delete" onClick={() => setDeleting(todo)} disabled={busy} aria-label={`Eliminar ${todo.title}`}>Eliminar</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title={todos.length ? 'No hay coincidencias' : 'Empieza con una tarea pequeña'}
                text={todos.length ? 'Prueba otro término o cambia el filtro.' : 'Agrega tu primera tarea y da el siguiente paso.'}
                action={!todos.length ? () => setForm({ todo: null }) : undefined}
              />
            )}
            <footer><span>{visible.length} de {todos.length} tareas</span><span>Datos protegidos con Row Level Security</span></footer>
          </section>
        </main>
      </div>
      {form && <TaskForm todo={form.todo} busy={busy} onSave={save} onClose={() => setForm(null)} />}
      {deleting && <DeleteDialog title={deleting.title} busy={busy} onConfirm={remove} onClose={() => setDeleting(null)} />}
    </div>
  )
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: () => void }) {
  return (
    <div className="empty-state" role="status">
      <span aria-hidden="true">◇</span><h3>{title}</h3><p>{text}</p>
      {action && <button className="soft-button" onClick={action}>＋ Agregar primera tarea</button>}
    </div>
  )
}
