const encoder = new TextEncoder()
const decoder = new TextDecoder(undefined, { fatal: true })
const VERSION = 'crypta.v1'
const ITERATIONS = 210_000

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('El texto cifrado tiene un formato inválido.')
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  try {
    return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0))
  } catch {
    throw new Error('El texto cifrado tiene un formato inválido.')
  }
}

async function deriveKey(secret: string, salt: Uint8Array, usage: KeyUsage) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(secret), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: ITERATIONS },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  )
}

export function validateInput(text: string, secret: string) {
  if (!text.trim()) throw new Error('Escribe un texto para continuar.')
  if (secret.length < 8) throw new Error('La llave debe tener al menos 8 caracteres.')
  if (secret.length > 200) throw new Error('La llave no puede superar 200 caracteres.')
}

export async function encryptText(plainText: string, secret: string) {
  validateInput(plainText, secret)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(secret, salt, 'encrypt')
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    encoder.encode(plainText),
  )
  return [VERSION, toBase64Url(salt), toBase64Url(iv), toBase64Url(new Uint8Array(encrypted))].join('.')
}

export async function decryptText(payload: string, secret: string) {
  validateInput(payload, secret)
  const [name, version, saltValue, ivValue, encryptedValue, extra] = payload.trim().split('.')
  if (`${name}.${version}` !== VERSION || !saltValue || !ivValue || !encryptedValue || extra) {
    throw new Error('El texto cifrado no pertenece a este laboratorio o está incompleto.')
  }
  const salt = fromBase64Url(saltValue)
  const iv = fromBase64Url(ivValue)
  if (salt.length !== 16 || iv.length !== 12) throw new Error('El texto cifrado tiene parámetros inválidos.')
  const key = await deriveKey(secret, salt, 'decrypt')
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      fromBase64Url(encryptedValue) as BufferSource,
    )
    return decoder.decode(plain)
  } catch {
    throw new Error('No se pudo descifrar. Revisa la llave y que el texto no haya sido modificado.')
  }
}
