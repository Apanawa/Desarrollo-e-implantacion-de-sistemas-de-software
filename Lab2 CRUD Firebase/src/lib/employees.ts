import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocsFromServer,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import { normalizeEmployee } from './employee.ts'
import type { Employee, EmployeeData } from './employee.ts'

export interface Session {
  uid: string
  db: Firestore
}
const catalog = ({ db, uid }: Session) =>
  collection(db, 'users', uid, 'employees')
export async function fetchEmployees(session: Session): Promise<Employee[]> {
  const snapshot = await getDocsFromServer(catalog(session))
  return snapshot.docs
    .map((item) => ({
      ...normalizeEmployee(item.data() as EmployeeData),
      id: item.id,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}
export async function createEmployee(session: Session, input: EmployeeData) {
  return addDoc(catalog(session), {
    ...normalizeEmployee(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
export async function editEmployee(
  session: Session,
  id: string,
  input: EmployeeData,
) {
  return updateDoc(doc(catalog(session), id), {
    ...normalizeEmployee(input),
    updatedAt: serverTimestamp(),
  })
}
export async function deleteEmployee(session: Session, id: string) {
  return deleteDoc(doc(catalog(session), id))
}
