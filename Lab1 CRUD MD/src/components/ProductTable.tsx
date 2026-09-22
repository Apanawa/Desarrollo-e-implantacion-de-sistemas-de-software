import type { Product } from '../types/product'

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

interface Props {
  products: Product[]
  hasProducts: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export default function ProductTable({ products, hasProducts, onEdit, onDelete }: Props) {
  if (!products.length) {
    return <div className="empty"><span aria-hidden="true">▤</span><h3>{hasProducts ? 'Sin coincidencias' : 'Tu inventario empieza aquí'}</h3><p>{hasProducts ? 'Prueba con otro nombre o descripción.' : 'Crea tu primer producto con el formulario.'}</p></div>
  }

  return (
    <div className="table-scroll">
      <table>
        <caption className="sr-only">Productos del inventario. Precios en pesos mexicanos.</caption>
        <thead><tr><th scope="col">Producto</th><th scope="col">Precio</th><th scope="col">Existencias</th><th scope="col">Acciones</th></tr></thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td><strong>{product.name}</strong><p className="description">{product.description || 'Sin descripción'}</p></td>
              <td className="numeric">{currency.format(product.price)}</td>
              <td><span className={product.stock === 0 ? 'badge out' : 'badge'}>{product.stock === 0 ? 'Agotado' : `${product.stock} uds.`}</span></td>
              <td><div className="actions"><button className="text-button" onClick={() => onEdit(product)} aria-label={`Editar ${product.name}`}>Editar</button><button className="text-button danger" onClick={() => onDelete(product)} aria-label={`Eliminar ${product.name}`}>Eliminar</button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
