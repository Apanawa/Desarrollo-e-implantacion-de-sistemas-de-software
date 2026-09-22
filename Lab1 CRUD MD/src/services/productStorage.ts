import { validateProduct } from '../types/product.ts'
import type { Product } from '../types/product.ts'

export const STORAGE_KEY = 'lab1-crud-products-v1'

type ProductStorage = Pick<Storage, 'getItem' | 'setItem'>

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<Product>
  return typeof item.id === 'string' && item.id.length > 0
    && typeof item.createdAt === 'string' && Number.isFinite(Date.parse(item.createdAt))
    && typeof item.name === 'string' && typeof item.description === 'string'
    && typeof item.price === 'number' && typeof item.stock === 'number'
    && validateProduct(item as Product) === null
}

export function loadProducts(storage: ProductStorage = window.localStorage): Product[] {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) return []
  const data: unknown = JSON.parse(raw)
  if (!Array.isArray(data) || !data.every(isProduct)
    || new Set(data.map((item) => item.id)).size !== data.length) {
    throw new Error('Los datos guardados no tienen el formato esperado.')
  }
  return data
}

export function saveProducts(products: Product[], storage: ProductStorage = window.localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(products))
}
