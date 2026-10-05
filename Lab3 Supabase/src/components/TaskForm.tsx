import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { EMPTY_TODO, normalizeTodo } from '../lib/todo'
import type { Todo, TodoInput } from '../lib/todo'

export default function TaskForm({
  todo,
  busy,
  onSave,
  onClose,
}: {
  todo: Todo | null
  busy: boolean
  onSave: (input: TodoInput) => Promise<void>
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [input, setInput] = useState<TodoInput>(todo ?? EMPTY_TODO)
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
      await onSave(normalizeTodo(input))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo guardar.')
    }
  }

  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby="task-form-title"
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
    >
      <div className="modal-heading">
        <div>
          <p className="eyebrow">DETALLES DE LA TAREA</p>
          <h2 id="task-form-title">{todo ? 'Editar tarea' : 'Nueva tarea'}</h2>
        </div>
        <button className="icon-button" aria-label="Cerrar formulario" disabled={busy} onClick={onClose}>×</button>
      </div>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label htmlFor="title">Título</label>
          <input
            id="title"
            autoFocus
            required
            maxLength={120}
            placeholder="Ej. Preparar presentación"
            value={input.title}
            onChange={(event) => setInput({ ...input, title: event.target.value })}
          />
          <label htmlFor="description">Descripción <span>Opcional</span></label>
          <textarea
            id="description"
            maxLength={500}
            rows={4}
            placeholder="Agrega contexto para completar la tarea…"
            value={input.description}
            onChange={(event) => setInput({ ...input, description: event.target.value })}
          />
          <label htmlFor="priority">Prioridad</label>
          <select
            id="priority"
            value={input.priority}
            onChange={(event) => setInput({ ...input, priority: event.target.value as TodoInput['priority'] })}
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="primary">{busy ? 'Guardando…' : todo ? 'Guardar cambios' : 'Crear tarea'}</button>
          </div>
        </fieldset>
      </form>
    </dialog>
  )
}
