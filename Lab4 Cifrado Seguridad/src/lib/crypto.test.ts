import { describe, expect, it } from 'vitest'
import { decryptText, encryptText, validateInput } from './crypto'

describe('AES-256-GCM', () => {
  it('cifra y descifra texto Unicode de varias líneas', async () => {
    const original = 'Información confidencial 🔐\nSegunda línea'
    const encrypted = await encryptText(original, 'Llave-Segura-2026!')
    expect(encrypted).toMatch(/^crypta\.v1\./)
    await expect(decryptText(encrypted, 'Llave-Segura-2026!')).resolves.toBe(original)
  })

  it('produce resultados diferentes para el mismo mensaje y llave', async () => {
    const first = await encryptText('Mensaje', 'Llave-Segura-2026!')
    const second = await encryptText('Mensaje', 'Llave-Segura-2026!')
    expect(first).not.toBe(second)
  })

  it('rechaza una llave incorrecta o datos modificados', async () => {
    const encrypted = await encryptText('Mensaje', 'Llave-Segura-2026!')
    await expect(decryptText(encrypted, 'Otra-Llave-2026!')).rejects.toThrow(/No se pudo descifrar/)
    await expect(decryptText(`${encrypted}x`, 'Llave-Segura-2026!')).rejects.toThrow(/No se pudo descifrar/)
  })

  it('valida el texto, la longitud de la llave y el formato', async () => {
    expect(() => validateInput('', 'Llave-Segura')).toThrow(/texto/)
    expect(() => validateInput('Texto', 'corta')).toThrow(/8 caracteres/)
    await expect(decryptText('texto-inválido', 'Llave-Segura')).rejects.toThrow(/no pertenece/)
  })
})
