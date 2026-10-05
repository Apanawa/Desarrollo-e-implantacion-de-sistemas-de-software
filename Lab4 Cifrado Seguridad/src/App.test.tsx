import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('recorre el flujo de cifrado y descifrado del formulario', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Texto plano'), 'Hola, seguridad')
    await user.type(screen.getByLabelText('Llave secreta'), 'Clave-Prueba-2026!')
    await user.click(screen.getByRole('button', { name: /Cifrar texto/ }))
    expect(await screen.findByText(/cifrado correctamente/i)).toBeVisible()
    expect((screen.getByLabelText('Texto cifrado') as HTMLTextAreaElement).value).toMatch(/^crypta\.v1\./)
    await user.click(screen.getByRole('button', { name: /Descifrar texto/ }))
    expect(await screen.findByText(/descifrado y autenticado/i)).toBeVisible()
    expect(screen.getByLabelText('Texto original descifrado')).toHaveTextContent('Hola, seguridad')
  })
})
