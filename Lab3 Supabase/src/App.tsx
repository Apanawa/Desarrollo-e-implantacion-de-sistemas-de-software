import { useEffect, useState } from 'react'
import TaskBoard from './components/TaskBoard'
import { configurationError, ensureSession, supabase } from './lib/supabase'
import { createTodoRepository } from './lib/todoRepository'
import { friendlyError } from './lib/todo'

export default function App() {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; repository: ReturnType<typeof createTodoRepository> }
  >({ status: 'loading' })

  useEffect(() => {
    let active = true
    async function connect() {
      if (configurationError || !supabase) {
        setState({ status: 'error', message: configurationError! })
        return
      }
      try {
        const session = await ensureSession()
        if (active) {
          setState({
            status: 'ready',
            repository: createTodoRepository(supabase, session.user.id),
          })
        }
      } catch (error) {
        if (active) setState({ status: 'error', message: friendlyError(error) })
      }
    }
    void connect()
    return () => {
      active = false
    }
  }, [])

  if (state.status === 'loading') {
    return <ConnectionScreen title="Conectando con Supabase…" />
  }
  if (state.status === 'error') {
    return <ConnectionScreen title="Configura tu proyecto" error={state.message} />
  }
  return <TaskBoard repository={state.repository} />
}

function ConnectionScreen({ title, error }: { title: string; error?: string }) {
  return (
    <main className="connection-screen">
      <div className="connection-card">
        <span className="supabase-symbol" aria-hidden="true">◆</span>
        <p className="eyebrow">LAB 03 · REACT + SUPABASE</p>
        <h1>{title}</h1>
        {error ? (
          <>
            <p className="connection-error" role="alert">{error}</p>
            <ol>
              <li>Copia <code>.env.example</code> como <code>.env.local</code>.</li>
              <li>Agrega la URL y la publishable key de tu proyecto.</li>
              <li>Ejecuta el SQL de <code>supabase/migrations</code>.</li>
              <li>Activa Anonymous Sign-Ins y reinicia <code>npm run dev</code>.</li>
            </ol>
          </>
        ) : (
          <span className="loader" aria-label="Cargando" />
        )}
      </div>
    </main>
  )
}
