export const PRIORITIES = ['low', 'medium', 'high'] as const
export type Priority = (typeof PRIORITIES)[number]

export interface TodoInput {
  title: string
  description: string
  priority: Priority
}

export interface Todo extends TodoInput {
  id: string
  user_id: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export const EMPTY_TODO: TodoInput = {
  title: '',
  description: '',
  priority: 'medium',
}

export function normalizeTodo(input: TodoInput): TodoInput {
  const result = {
    title: input.title.trim(),
    description: input.description.trim(),
    priority: input.priority,
  }
  if (!result.title || result.title.length > 120) {
    throw new Error('El título debe tener entre 1 y 120 caracteres.')
  }
  if (result.description.length > 500) {
    throw new Error('La descripción no puede superar 500 caracteres.')
  }
  if (!PRIORITIES.includes(result.priority)) {
    throw new Error('Selecciona una prioridad válida.')
  }
  return result
}

export function friendlyError(error: unknown) {
  if (!(error instanceof Error)) return 'No se pudo completar la operación.'
  if (error.message.includes('Anonymous sign-ins are disabled')) {
    return 'Activa Anonymous Sign-Ins en Supabase Authentication.'
  }
  if (error.message.includes('Failed to fetch')) {
    return 'No se pudo conectar con Supabase. Revisa la URL, la clave y tu conexión.'
  }
  return error.message
}
