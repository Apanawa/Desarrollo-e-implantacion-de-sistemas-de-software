export const DEPARTMENTS = [
  'Tecnología',
  'Operaciones',
  'Administración',
  'Ventas',
  'Recursos humanos',
] as const
export type Department = (typeof DEPARTMENTS)[number]
export interface EmployeeData {
  name: string
  email: string
  position: string
  department: Department
  status: 'active' | 'inactive'
}
export interface Employee extends EmployeeData {
  id: string
}
export const EMPTY_EMPLOYEE: EmployeeData = {
  name: '',
  email: '',
  position: '',
  department: 'Tecnología',
  status: 'active',
}

export function normalizeEmployee(data: EmployeeData): EmployeeData {
  const result = {
    department: data.department,
    status: data.status,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    position: data.position.trim(),
  }
  if (!result.name || result.name.length > 100)
    throw new Error('El nombre debe tener entre 1 y 100 caracteres.')
  if (!result.position || result.position.length > 80)
    throw new Error('El puesto debe tener entre 1 y 80 caracteres.')
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email) ||
    result.email.length > 254
  )
    throw new Error('Escribe un correo electrónico válido.')
  if (!DEPARTMENTS.includes(result.department))
    throw new Error('Selecciona un departamento válido.')
  if (!['active', 'inactive'].includes(result.status))
    throw new Error('Selecciona un estado válido.')
  return result
}

export function readableError(error: unknown): string {
  const code = (error as { code?: string })?.code
  if (code === 'permission-denied')
    return 'Firebase rechazó el acceso. Verifica la sesión y las reglas de Firestore del README.'
  if (
    code === 'auth/operation-not-allowed' ||
    code === 'auth/admin-restricted-operation'
  )
    return 'Activa el proveedor Anónimo en Firebase Authentication para este laboratorio.'
  if (code === 'auth/network-request-failed' || code === 'unavailable')
    return 'No se pudo conectar con Firebase. Comprueba tu conexión o inicia los emuladores con npm run dev:local.'
  return error instanceof Error
    ? error.message
    : 'No se pudo completar la operación. Inténtalo de nuevo.'
}
