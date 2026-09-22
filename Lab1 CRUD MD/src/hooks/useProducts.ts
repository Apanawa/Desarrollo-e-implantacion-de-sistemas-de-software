import { useState } from 'react'
import { loadProducts, saveProducts } from '../services/productStorage'
import { validateProduct } from '../types/product'
import type { Product, ProductData } from '../types/product'

export function useProducts() {
  const [initial] = useState(() => {
    try {
      return { products: loadProducts(), error: '' }
    } catch {
      return { products: [] as Product[], error: 'No se pudo leer el almacenamiento. Revisa los permisos del navegador o los datos guardados y recarga la página.' }
    }
  })
  const [products, setProducts] = useState(initial.products)
  const [error, setError] = useState(initial.error)

  function persist(next: Product[]): boolean {
    if (initial.error) return false
    try {
      saveProducts(next)
      setProducts(next)
      setError('')
      return true
    } catch {
      setError('No se pudo guardar. Revisa el espacio y los permisos del navegador e inténtalo de nuevo.')
      return false
    }
  }

  function upsertProduct(data: ProductData, id?: string): boolean {
    const validationError = validateProduct(data)
    if (validationError) {
      setError(validationError)
      return false
    }
    const cleanData = { ...data, name: data.name.trim(), description: data.description.trim() }
    const next = id
      ? products.map((product) => product.id === id ? { ...product, ...cleanData } : product)
      : [{ ...cleanData, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...products]
    return persist(next)
  }

  function deleteProduct(id: string): boolean {
    return persist(products.filter((product) => product.id !== id))
  }

  return { products, error, blocked: Boolean(initial.error), upsertProduct, deleteProduct }
}
