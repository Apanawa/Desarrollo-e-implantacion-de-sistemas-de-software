import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { decryptText, encryptText } from './lib/crypto'

type Status = 'idle' | 'encrypting' | 'decrypting'

export default function App() {
  const [plainText, setPlainText] = useState('')
  const [secret, setSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [encrypted, setEncrypted] = useState('')
  const [decrypted, setDecrypted] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const strength = useMemo(() => {
    if (!secret) return { label: 'Sin llave', value: 0 }
    let score = Math.min(secret.length / 16, 1) * 50
    if (/[a-z]/.test(secret) && /[A-Z]/.test(secret)) score += 15
    if (/\d/.test(secret)) score += 15
    if (/[^\w\s]/.test(secret)) score += 20
    return { label: score < 45 ? 'Débil' : score < 75 ? 'Aceptable' : 'Fuerte', value: Math.min(score, 100) }
  }, [secret])

  async function encrypt(event: FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')
    setDecrypted('')
    setStatus('encrypting')
    try {
      setEncrypted(await encryptText(plainText, secret))
      setNotice('Texto cifrado correctamente con AES-256-GCM.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo cifrar el texto.')
    } finally {
      setStatus('idle')
    }
  }

  async function decrypt() {
    setError('')
    setNotice('')
    setDecrypted('')
    setStatus('decrypting')
    try {
      setDecrypted(await decryptText(encrypted, secret))
      setNotice('Texto descifrado y autenticado correctamente.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo descifrar el texto.')
    } finally {
      setStatus('idle')
    }
  }

  async function copyEncrypted() {
    if (!encrypted) return
    try {
      await navigator.clipboard.writeText(encrypted)
      setNotice('Texto cifrado copiado al portapapeles.')
    } catch {
      setError('No se pudo copiar. Selecciona el texto manualmente.')
    }
  }

  function clear() {
    setPlainText('')
    setSecret('')
    setEncrypted('')
    setDecrypted('')
    setError('')
    setNotice('')
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <a href="./" className="brand" aria-label="Crypta inicio"><span>◇</span> crypta</a>
        <div className="status-chip"><i /> Web Crypto disponible</div>
      </header>

      <main>
        <section className="intro">
          <div>
            <p className="eyebrow">LAB 04 · CIFRADO Y DESCIFRADO</p>
            <h1>Protege un mensaje.<br /><em>Recupéralo intacto.</em></h1>
            <p className="lead">Cifra texto en tu navegador con una llave secreta. Nada se envía a un servidor.</p>
          </div>
          <aside className="algorithm-card" aria-label="Detalles del algoritmo">
            <div><span>ALGORITMO</span><strong>AES-256-GCM</strong></div>
            <div><span>DERIVACIÓN</span><strong>PBKDF2 · SHA-256</strong></div>
            <div><span>ITERACIONES</span><strong>210,000</strong></div>
          </aside>
        </section>

        <form className="crypto-card" onSubmit={encrypt}>
          <div className="step-label"><span>01</span><div><strong>Escribe tu mensaje</strong><small>Texto plano que deseas proteger</small></div></div>
          <label htmlFor="plain-text">Texto plano</label>
          <div className="field-wrap">
            <textarea id="plain-text" rows={5} maxLength={5000} value={plainText} onChange={(event) => setPlainText(event.target.value)} placeholder="Escribe aquí información que quieras cifrar…" />
            <span className="counter">{plainText.length} / 5000</span>
          </div>

          <label htmlFor="secret">Llave secreta</label>
          <div className="secret-wrap">
            <input id="secret" type={showSecret ? 'text' : 'password'} maxLength={200} value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            <button type="button" onClick={() => setShowSecret((value) => !value)} aria-label={showSecret ? 'Ocultar llave' : 'Mostrar llave'}>{showSecret ? 'Ocultar' : 'Mostrar'}</button>
          </div>
          <div className="strength"><div><i style={{ width: `${strength.value}%` }} /></div><span>{strength.label}</span></div>

          <div className="primary-actions">
            <button className="primary" type="submit" disabled={status !== 'idle'}><span aria-hidden="true">◆</span>{status === 'encrypting' ? 'Cifrando…' : 'Cifrar texto'}</button>
            <button className="ghost" type="button" onClick={clear} disabled={status !== 'idle'}>Limpiar</button>
          </div>

          <div className="divider"><span>RESULTADO CIFRADO</span></div>
          <div className="step-label"><span>02</span><div><strong>Texto protegido</strong><small>Incluye versión, sal, IV y datos autenticados</small></div></div>
          <label htmlFor="encrypted-text">Texto cifrado</label>
          <div className="field-wrap encrypted-wrap">
            <textarea id="encrypted-text" rows={5} value={encrypted} onChange={(event) => { setEncrypted(event.target.value); setDecrypted('') }} placeholder="El resultado aparecerá aquí. También puedes pegar un texto crypta.v1 para descifrarlo." spellCheck={false} />
            <button type="button" onClick={() => void copyEncrypted()} disabled={!encrypted} aria-label="Copiar texto cifrado">Copiar</button>
          </div>
          <button className="decrypt-button" type="button" onClick={() => void decrypt()} disabled={!encrypted || status !== 'idle'}><span aria-hidden="true">◇</span>{status === 'decrypting' ? 'Descifrando…' : 'Descifrar texto'}</button>

          {(error || notice) && <p className={error ? 'message error' : 'message success'} role={error ? 'alert' : 'status'}>{error || notice}</p>}

          <div className="divider"><span>TEXTO ORIGINAL</span></div>
          <div className="step-label"><span>03</span><div><strong>Mensaje recuperado</strong><small>Solo aparece cuando la llave y autenticación son válidas</small></div></div>
          <output className={`decrypted-output ${decrypted ? 'has-value' : ''}`} aria-label="Texto original descifrado">
            {decrypted || 'El texto original aparecerá aquí después de descifrar.'}
          </output>
        </form>

        <section className="security-notes" aria-label="Cómo funciona la seguridad">
          <article><span>01</span><div><h2>Sal aleatoria</h2><p>Una sal nueva evita que mensajes iguales produzcan el mismo resultado.</p></div></article>
          <article><span>02</span><div><h2>IV único</h2><p>AES-GCM recibe un vector aleatorio de 96 bits en cada operación.</p></div></article>
          <article><span>03</span><div><h2>Autenticación</h2><p>El descifrado falla si cambia la llave o se modifica el contenido.</p></div></article>
        </section>
      </main>

      <footer><span>LAB4 · SEGURIDAD</span><span>Procesamiento local · La llave nunca se almacena</span></footer>
    </div>
  )
}
