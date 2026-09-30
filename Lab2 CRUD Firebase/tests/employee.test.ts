import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeEmployee } from '../src/lib/employee.ts'
import type { EmployeeData } from '../src/lib/employee.ts'
const valid: EmployeeData = {
  name: 'Ana López',
  email: 'ana@example.com',
  position: 'Desarrolladora',
  department: 'Tecnología',
  status: 'active',
}
test('normaliza espacios y correo sin modificar la entrada', () => {
  const input = {
    ...valid,
    name: '  Ana López  ',
    email: ' ANA@EXAMPLE.COM ',
    position: ' Desarrolladora ',
  }
  assert.deepEqual(normalizeEmployee(input), valid)
  assert.equal(input.name, '  Ana López  ')
})
test('rechaza campos vacíos, correos inválidos y límites excedidos', () => {
  for (const data of [
    { name: ' ' },
    { name: 'a'.repeat(101) },
    { email: 'a@' },
    { email: 'a b@example.com' },
    { email: `${'a'.repeat(245)}@example.com` },
    { position: '' },
    { position: 'a'.repeat(81) },
    { department: 'Otro' },
    { status: 'unknown' },
  ]) {
    assert.throws(() =>
      normalizeEmployee({ ...valid, ...data } as EmployeeData),
    )
  }
})
test('admite nombres con acentos y ambos estados', () => {
  assert.equal(
    normalizeEmployee({ ...valid, name: 'María José', status: 'inactive' })
      .status,
    'inactive',
  )
})
