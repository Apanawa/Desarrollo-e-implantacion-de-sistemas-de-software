import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { validateProduct } from '../types/product'
import type { Product, ProductData } from '../types/product'

interface Props {
  product: Product | null
  disabled: boolean
  onSave: (data: ProductData) => void
  onCancel: () => void
}

export default function ProductForm({ product, disabled, onSave, onCancel }: Props) {
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [stock, setStock] = useState(product ? String(product.stock) : '')
  const [error, setError] = useState('')

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = { name, description, price: price.trim() ? Number(price) : NaN, stock: stock.trim() ? Number(stock) : NaN }
    const message = validateProduct(data)
    setError(message ?? '')
    if (!message) onSave(data)
  }

  return (
    <section className="panel form-panel" aria-labelledby="form-title">
      <p className="eyebrow">{product ? 'ACTUALIZAR REGISTRO' : 'AMPLÍA TU CATÁLOGO'}</p>
      <h2 id="form-title">{product ? 'Editar producto' : 'Nuevo producto'}</h2>
      <p className="muted">Los campos con * son obligatorios.</p>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={disabled}>
          <label htmlFor="name">Nombre *</label>
          <input id="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} placeholder="Ej. Cuaderno de notas" />
          <label htmlFor="description">Descripción</label>
          <textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={300} rows={3} placeholder="Detalles del producto" />
          <div className="form-row">
            <div>
              <label htmlFor="price">Precio (MXN) *</label>
              <input id="price" type="number" min="0" max="999999999.99" step="0.01" required value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label htmlFor="stock">Existencias *</label>
              <input id="stock" type="number" min="0" max="999999999" step="1" required value={stock} onChange={(event) => setStock(event.target.value)} placeholder="0" />
            </div>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="primary full" type="submit">{product ? 'Guardar cambios' : '+ Crear producto'}</button>
          {product && <button className="secondary full" type="button" onClick={onCancel}>Cancelar edición</button>}
        </fieldset>
      </form>
    </section>
  )
}
