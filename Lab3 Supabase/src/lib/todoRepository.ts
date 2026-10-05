import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { normalizeTodo } from './todo'
import type { Todo, TodoInput } from './todo'

export interface TodoRepository {
  list(): Promise<Todo[]>
  create(input: TodoInput): Promise<Todo>
  update(id: string, input: TodoInput): Promise<Todo>
  toggle(id: string, completed: boolean): Promise<Todo>
  remove(id: string): Promise<void>
}

export function createTodoRepository(
  client: SupabaseClient<Database>,
  userId: string,
): TodoRepository {
  return {
    async list() {
      const { data, error } = await client
        .from('pendientes')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    async create(input) {
      const { data, error } = await client
        .from('pendientes')
        .insert({ ...normalizeTodo(input), user_id: userId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    async update(id, input) {
      const { data, error } = await client
        .from('pendientes')
        .update(normalizeTodo(input))
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    async toggle(id, completed) {
      const { data, error } = await client
        .from('pendientes')
        .update({ is_completed: completed })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    async remove(id) {
      const { error } = await client
        .from('pendientes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw error
    },
  }
}
