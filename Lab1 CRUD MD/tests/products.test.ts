import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadProducts, saveProducts, STORAGE_KEY } from '../src/services/productStorage.ts'
import { validateProduct } from '../src/types/product.ts'

const product = { id: 'example-1', name: 'Cuaderno', description: '100 hojas', price: 49.9, stock: 8, createdAt: '2026-09-21T12:00:00.000Z' }

function memoryStorage(initial: string | null = null) {
  const data = new Map<string, string>()
  if (initial !== null) data.set(STORAGE_KEY, initial)
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value) } }
}

test('un inventario nuevo está vacío', () => {
  assert.deepEqual(loadProducts(memoryStorage()), [])
})

test('crear, consultar, actualizar y eliminar persiste entre lecturas', () => {
  const storage = memoryStorage()
  saveProducts([product], storage)
  assert.deepEqual(loadProducts(storage), [product])
  const edited = { ...loadProducts(storage)[0], name: 'Cuaderno azul', stock: 0 }
  saveProducts([edited], storage)
  assert.deepEqual(loadProducts(storage), [edited])
  saveProducts([], storage)
  assert.deepEqual(loadProducts(storage), [])
})

test('rechaza datos corruptos, formatos inválidos e identificadores duplicados', () => {
  for (const raw of ['{', '{}', '[null]', JSON.stringify([{ ...product, price: -1 }]), JSON.stringify([product, product])]) {
    assert.throws(() => loadProducts(memoryStorage(raw)))
  }
})

test('propaga errores de almacenamiento sin declarar éxito', () => {
  const storage = { getItem: () => { throw new Error('Permiso denegado') }, setItem: () => { throw new Error('Sin espacio') } }
  assert.throws(() => loadProducts(storage), /Permiso denegado/)
  assert.throws(() => saveProducts([product], storage), /Sin espacio/)
})

test('acepta cero y precios con dos decimales', () => {
  assert.equal(validateProduct({ ...product, price: 0, stock: 0 }), null)
  assert.equal(validateProduct({ ...product, price: 19.99 }), null)
})

test('rechaza campos vacíos, límites excedidos y valores numéricos inválidos', () => {
  const invalid = [
    { name: '   ' }, { name: 'a'.repeat(81) }, { description: 'a'.repeat(301) },
    { price: NaN }, { price: Infinity }, { price: -1 }, { price: 1.234 }, { price: 1000000000 },
    { stock: NaN }, { stock: Infinity }, { stock: -1 }, { stock: 1.5 }, { stock: 1000000000 },
  ]
  for (const data of invalid) assert.ok(validateProduct({ ...product, ...data }))
})
