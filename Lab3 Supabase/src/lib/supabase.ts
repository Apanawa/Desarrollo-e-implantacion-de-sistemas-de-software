import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_KEY
)?.trim()

export const configurationError =
  !url || !key || url.includes('TU_PROYECTO') || key.includes('REEMPLAZA')
    ? 'Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en .env.local.'
    : null

export const supabase = configurationError
  ? null
  : createClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

export async function ensureSession() {
  if (!supabase) throw new Error(configurationError ?? 'Falta configurar Supabase.')
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  if (data.session) return data.session
  const created = await supabase.auth.signInAnonymously()
  if (created.error) throw created.error
  if (!created.data.session) throw new Error('Supabase no creó la sesión anónima.')
  return created.data.session
}
