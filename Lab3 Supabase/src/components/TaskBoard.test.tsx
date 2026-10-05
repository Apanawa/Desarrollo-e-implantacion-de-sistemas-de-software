import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import TaskBoard from './TaskBoard'
import type { Todo, TodoInput } from '../lib/todo'
import type { TodoRepository } from '../lib/todoRepository'

function fakeRepository(): TodoRepository {
  let todos: Todo[] = []
  const record = (input: TodoInput): Todo => ({
    ...input,
    id: 'task-1',
    user_id: 'user-1',
    is_completed: false,
    created_at: '2026-10-05T12:00:00.000Z',
    updated_at: '2026-10-05T12:00:00.000Z',
  })
  return {
    async list() {
      return [...todos]
    },
    async create(input) {
      const todo = record(input)
      todos = [todo, ...todos]
      return todo
    },
    async update(id, input) {
      const todo = { ...todos.find((item) => item.id === id)!, ...input }
      todos = todos.map((item) => (item.id === id ? todo : item))
      return todo
    },
    async toggle(id, completed) {
      const todo = { ...todos.find((item) => item.id === id)!, is_completed: completed }
      todos = todos.map((item) => (item.id === id ? todo : item))
      return todo
    },
    async remove(id) {
      todos = todos.filter((item) => item.id !== id)
    },
  }
}

describe('TaskBoard', () => {
  it('ejecuta el flujo de crear, editar, completar, buscar y eliminar', async () => {
    const user = userEvent.setup()
    render(<TaskBoard repository={fakeRepository()} />)

    expect(await screen.findByText('Empieza con una tarea pequeña')).toBeVisible()
    await user.click(screen.getByRole('button', { name: /agregar primera tarea/i }))
    await user.type(screen.getByLabelText('Título'), 'Preparar demo')
    await user.type(screen.getByLabelText(/Descripción/), 'Revisar el CRUD')
    await user.selectOptions(screen.getByLabelText('Prioridad'), 'high')
    await user.click(screen.getByRole('button', { name: 'Crear tarea' }))

    expect(await screen.findByText('Preparar demo')).toBeVisible()
    expect(screen.getByText('Tarea creada en Supabase.')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Completar Preparar demo' }))
    expect(await screen.findByRole('button', { name: 'Reabrir Preparar demo' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Editar Preparar demo' }))
    await user.clear(screen.getByLabelText('Título'))
    await user.type(screen.getByLabelText('Título'), 'Presentar laboratorio')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByText('Presentar laboratorio')).toBeVisible()

    await user.type(screen.getByRole('searchbox'), 'sin coincidencia')
    expect(screen.getByText('No hay coincidencias')).toBeVisible()
    await user.clear(screen.getByRole('searchbox'))

    await user.click(screen.getByRole('button', { name: 'Eliminar Presentar laboratorio' }))
    await user.click(screen.getByRole('button', { name: 'Eliminar tarea' }))
    await waitFor(() => expect(screen.queryByText('Presentar laboratorio')).not.toBeInTheDocument())
    expect(screen.getByText('Tarea eliminada de Supabase.')).toBeVisible()
  })
})
