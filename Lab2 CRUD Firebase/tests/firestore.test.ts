import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing'
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing'
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import {
  createEmployee,
  fetchEmployees,
  editEmployee,
  deleteEmployee,
} from '../src/lib/employees.ts'
import type { Session } from '../src/lib/employees.ts'
import type { EmployeeData } from '../src/lib/employee.ts'

let environment: RulesTestEnvironment
const input: EmployeeData = {
  name: 'Ana Prueba',
  email: 'ana@example.com',
  position: 'Desarrolladora',
  department: 'Tecnología',
  status: 'active',
}
const payload = () => ({
  ...input,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})
before(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'demo-lab2-tests',
    firestore: {
      host: '127.0.0.1',
      port: 8188,
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  })
})
after(async () => {
  await environment?.cleanup()
})

test('servicio real: crear, consultar, editar, volver a consultar y eliminar en Firestore', async () => {
  const session = {
    uid: 'crud-test',
    db: environment.authenticatedContext('crud-test').firestore(),
  } as unknown as Session
  const created = await createEmployee(session, input)
  assert.deepEqual(await fetchEmployees(session), [
    { ...input, id: created.id },
  ])
  await editEmployee(session, created.id, {
    ...input,
    position: 'Líder técnica',
    status: 'inactive',
  })
  const reloaded = await fetchEmployees(session)
  assert.equal(reloaded[0].position, 'Líder técnica')
  assert.equal(reloaded[0].status, 'inactive')
  await deleteEmployee(session, created.id)
  assert.deepEqual(await fetchEmployees(session), [])
})
test('sin autenticación no se permite consultar ni escribir', async () => {
  const db = environment.unauthenticatedContext().firestore()
  await assertFails(getDocs(collection(db, 'users/owner/employees')))
  await assertFails(
    setDoc(doc(db, 'users/owner/employees/anonymous'), payload()),
  )
})
test('otro usuario no puede consultar, crear, editar ni eliminar registros ajenos', async () => {
  const owner = environment.authenticatedContext('owner').firestore()
  await assertSucceeds(
    setDoc(doc(owner, 'users/owner/employees/private'), payload()),
  )
  const stranger = environment.authenticatedContext('stranger').firestore()
  await assertFails(getDocs(collection(stranger, 'users/owner/employees')))
  await assertFails(
    setDoc(doc(stranger, 'users/owner/employees/injected'), payload()),
  )
  await assertFails(
    updateDoc(doc(stranger, 'users/owner/employees/private'), {
      position: 'Intruso',
      updatedAt: serverTimestamp(),
    }),
  )
  await assertFails(deleteDoc(doc(stranger, 'users/owner/employees/private')))
})
test('las reglas rechazan datos inválidos aunque se omita la validación de la interfaz', async () => {
  const db = environment.authenticatedContext('validation').firestore()
  for (const patch of [
    { name: '' },
    { name: '   ' },
    { email: 'invalido' },
    { department: 'Desconocido' },
    { status: 'otro' },
    { admin: true },
    { createdAt: Timestamp.fromMillis(1) },
  ]) {
    await assertFails(
      setDoc(doc(db, 'users/validation/employees/invalid'), {
        ...payload(),
        ...patch,
      }),
    )
  }
})
test('createdAt es inmutable al editar', async () => {
  const db = environment.authenticatedContext('timestamps').firestore()
  const ref = doc(db, 'users/timestamps/employees/fixed')
  await setDoc(ref, payload())
  await assertFails(
    updateDoc(ref, {
      createdAt: Timestamp.fromMillis(1),
      updatedAt: serverTimestamp(),
    }),
  )
})
