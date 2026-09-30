import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

export const emulatorMode =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true'

function initialize() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }
  if (Object.values(config).some((value) => !value))
    throw new Error(
      'Falta configurar Firebase. Copia .env.example a .env.local y reinicia la aplicación.',
    )
  if (!emulatorMode && config.projectId?.startsWith('demo-'))
    throw new Error(
      'Configura un proyecto real de Firebase para usar el modo nube.',
    )
  if (emulatorMode && config.projectId !== 'demo-lab2-crud')
    throw new Error(
      'El modo local requiere el proyecto demo-lab2-crud de .env.example.',
    )
  const app = getApps().some((app) => app.name === 'lab2')
    ? getApp('lab2')
    : initializeApp(config, 'lab2')
  const auth = getAuth(app)
  const db = getFirestore(app)
  if (emulatorMode) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
      disableWarnings: true,
    })
    connectFirestoreEmulator(db, '127.0.0.1', 8085)
  }
  return { auth, db }
}

const cache = globalThis as typeof globalThis & {
  lab2Firebase?: ReturnType<typeof initialize>
  lab2Session?: Promise<{ uid: string; db: ReturnType<typeof getFirestore> }>
}

export async function getSession() {
  if (typeof window === 'undefined')
    throw new Error('Firebase se inicializa desde el navegador.')
  if (!cache.lab2Session) {
    cache.lab2Session = (async () => {
      const { auth, db } = (cache.lab2Firebase ??= initialize())
      await auth.authStateReady()
      const user = auth.currentUser ?? (await signInAnonymously(auth)).user
      return { uid: user.uid, db }
    })().catch((error) => {
      cache.lab2Session = undefined
      throw error
    })
  }
  return cache.lab2Session
}
