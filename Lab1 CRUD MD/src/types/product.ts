export interface ProductData {
  name: string
  description: string
  price: number
  stock: number
}

export interface Product extends ProductData {
  id: string
  createdAt: string
}

export function validateProduct(data: ProductData): string | null {
  if (!data.name.trim() || data.name.trim().length > 80) {
    return 'El nombre debe contener entre 1 y 80 caracteres.'
  }
  if (data.description.length > 300) return 'La descripción admite hasta 300 caracteres.'
  if (!Number.isFinite(data.price) || data.price < 0 || data.price > 999999999.99) {
    return 'El precio debe estar entre 0 y 999,999,999.99.'
  }
  if (Math.abs(data.price * 100 - Math.round(data.price * 100)) > 0.0001) {
    return 'El precio admite hasta dos decimales.'
  }
  if (!Number.isSafeInteger(data.stock) || data.stock < 0 || data.stock > 999999999) {
    return 'Las existencias deben ser un entero entre 0 y 999,999,999.'
  }
  return null
}
