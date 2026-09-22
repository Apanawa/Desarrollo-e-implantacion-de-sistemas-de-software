import { useState } from 'react'
import ProductForm from './components/ProductForm'
import ProductTable from './components/ProductTable'
import { useProducts } from './hooks/useProducts'
import type { Product, ProductData } from './types/product'

export default function App() {
  const { products, error, blocked, upsertProduct, deleteProduct } = useProducts()
  const [editing, setEditing] = useState<Product | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)
  const [formVersion, setFormVersion] = useState(0)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const query = search.trim().toLocaleLowerCase('es')
  const filtered = products.filter((product) => `${product.name} ${product.description}`.toLocaleLowerCase('es').includes(query))

  function resetForm() {
    setEditing(null)
    setFormVersion((version) => version + 1)
  }

  function handleSave(data: ProductData) {
    if (upsertProduct(data, editing?.id)) {
      setNotice(editing ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.')
      resetForm()
      setSearch('')
    }
  }

  function handleDelete() {
    if (pendingDelete && deleteProduct(pendingDelete.id)) {
      if (editing?.id === pendingDelete.id) resetForm()
      setPendingDelete(null)
      setNotice('Producto eliminado correctamente.')
    }
  }

  function handleEdit(product: Product) {
    setEditing(product)
    setFormVersion((version) => version + 1)
    setNotice('')
    document.getElementById('form-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    requestAnimationFrame(() => document.getElementById('name')?.focus({ preventScroll: true }))
  }

  return (
    <div className="app-shell">
      <header className="topbar"><a className="brand" href="./"><span className="brand-icon" aria-hidden="true">▦</span> Inventario<span className="brand-dot">.</span></a><span className="lab-tag">LAB 01 / REACT CRUD</span></header>
      <main>
        <div className="page-heading"><div><p className="eyebrow">CONTROL DE PRODUCTOS</p><h1>Todo en su lugar.</h1><p className="intro">Crea, consulta y actualiza tu catálogo desde un solo lugar.</p></div><span className="local-note">● Guardado en este navegador</span></div>
        <div className="stats" aria-label="Resumen del inventario"><div><span>Productos registrados</span><strong>{products.length}</strong></div><div><span>Unidades disponibles</span><strong>{products.reduce((total, product) => total + product.stock, 0).toLocaleString('es-MX')}</strong></div><div><span>Productos agotados</span><strong>{products.filter((product) => product.stock === 0).length}</strong></div></div>
        <div role="status" className="notice">{notice}</div>
        {error && <p role="alert" className="error banner">{error}</p>}
        {pendingDelete && <section className="delete-confirm" aria-labelledby="delete-title"><div><h2 id="delete-title">¿Eliminar «{pendingDelete.name}»?</h2><p>El producto se quitará del inventario. Esta acción no se puede deshacer.</p></div><div className="actions"><button className="secondary" autoFocus onClick={() => setPendingDelete(null)}>Cancelar</button><button className="destructive" onClick={handleDelete}>Confirmar eliminación</button></div></section>}
        <div className="workspace">
          <ProductForm key={`${editing?.id ?? 'new'}-${formVersion}`} product={editing} disabled={blocked} onSave={handleSave} onCancel={resetForm} />
          <section className="panel catalog" aria-labelledby="catalog-title"><div className="catalog-heading"><div><p className="eyebrow">TU INVENTARIO</p><h2 id="catalog-title">Catálogo de productos</h2></div><span className="count">{filtered.length} de {products.length}</span></div><div className="search-wrap"><label htmlFor="search" className="sr-only">Buscar por nombre o descripción</label><input id="search" type="search" placeholder="Buscar por nombre o descripción…" value={search} onChange={(event) => setSearch(event.target.value)} /></div><ProductTable products={filtered} hasProducts={products.length > 0} onEdit={handleEdit} onDelete={(product) => { setPendingDelete(product); setNotice('') }} /></section>
        </div>
      </main>
      <footer><span>Lab1 CRUD MD · React + TypeScript</span><span>Almacenamiento local · Sin conexión a servidor</span></footer>
    </div>
  )
}
