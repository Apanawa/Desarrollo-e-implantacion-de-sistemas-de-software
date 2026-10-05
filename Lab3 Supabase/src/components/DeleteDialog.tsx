import { useEffect, useRef } from 'react'

export default function DeleteDialog({
  title,
  busy,
  onConfirm,
  onClose,
}: {
  title: string
  busy: boolean
  onConfirm: () => Promise<void>
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return (
    <dialog
      ref={dialog}
      className="modal delete-modal"
      aria-labelledby="delete-title"
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
    >
      <p className="eyebrow">ELIMINAR TAREA</p>
      <h2 id="delete-title">¿Eliminar “{title}”?</h2>
      <p>La tarea se eliminará definitivamente de Supabase.</p>
      <div className="modal-actions">
        <button className="secondary" disabled={busy} onClick={onClose} autoFocus>Cancelar</button>
        <button className="danger" disabled={busy} onClick={() => void onConfirm()}>{busy ? 'Eliminando…' : 'Eliminar tarea'}</button>
      </div>
    </dialog>
  )
}
