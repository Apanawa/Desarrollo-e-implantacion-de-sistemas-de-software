'use client'
import { useEffect, useRef } from 'react'
import type { Employee } from '@/lib/employee'
export default function DeleteDialog({
  employee,
  busy,
  error,
  onConfirm,
  onClose,
}: {
  employee: Employee
  busy: boolean
  error: string
  onConfirm: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = ref.current
    el?.showModal()
    return () => el?.close()
  }, [])
  return (
    <dialog
      className="modal delete-modal"
      ref={ref}
      aria-labelledby="delete-title"
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) onClose()
      }}
    >
      <p className="eyebrow">ELIMINAR REGISTRO</p>
      <h2 id="delete-title">¿Eliminar a {employee.name}?</h2>
      <p>
        El registro se eliminará de Firestore. Esta acción no se puede deshacer.
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="modal-actions">
        <button
          autoFocus
          className="secondary"
          disabled={busy}
          onClick={onClose}
        >
          Cancelar
        </button>
        <button className="destructive" disabled={busy} onClick={onConfirm}>
          {busy ? 'Eliminando…' : 'Confirmar eliminación'}
        </button>
      </div>
    </dialog>
  )
}
