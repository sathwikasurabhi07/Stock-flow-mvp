import { useMemo, useState } from 'react'
import { Eye, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Button, EmptyState, Field, LoadingState, Modal, SearchField, StatusBadge } from '../components/ui.jsx'
import api, { getErrorMessage } from '../lib/api.js'

const blankProduct = { name: '', sku: '', description: '', quantity: '0', cost_price: '', selling_price: '' }

function stockState(product, threshold) {
  return Number(product.quantity) <= Number(product.low_stock_threshold ?? threshold) ? 'Low stock' : 'In stock'
}

function number(value) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(value) || 0)
}

export default function ProductsPage({ products, threshold, loading, onChanged, notify, search, onSearch, initialCreate, onCreateHandled }) {
  const [stockFilter, setStockFilter] = useState('all')
  const [modal, setModal] = useState(() => initialCreate ? { type: 'edit', product: null } : null)
  const [form, setForm] = useState(blankProduct)
  const [saving, setSaving] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const filteredProducts = useMemo(() => products.filter((product) => {
    const needle = search.trim().toLowerCase()
    const matchesSearch = !needle || `${product.name} ${product.sku}`.toLowerCase().includes(needle)
    const matchesStock = stockFilter === 'all' || (stockFilter === 'low'
      ? stockState(product, threshold) === 'Low stock'
      : stockState(product, threshold) === 'In stock')
    return matchesSearch && matchesStock
  }), [products, search, stockFilter, threshold])

  function openCreate() {
    setForm({ ...blankProduct })
    setFormError('')
    setModal({ type: 'edit', product: null })
  }

  function closeModal() {
    setModal(null)
    onCreateHandled()
  }

  function openEdit(product) {
    setForm({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      quantity: String(product.quantity ?? 0),
      cost_price: product.cost_price ?? '',
      selling_price: product.selling_price ?? '',
    })
    setFormError('')
    setModal({ type: 'edit', product })
  }

  async function openDetails(product) {
    setModal({ type: 'details', product })
    setDetailLoading(true)
    try {
      const { data } = await api.get(`/api/products/${product.id}`)
      setModal({ type: 'details', product: data })
    } catch (error) {
      setModal(null)
      notify(getErrorMessage(error, 'Could not load product details.'), 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  async function saveProduct(event) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim() || null,
      quantity: Number(form.quantity),
      cost_price: form.cost_price === '' ? null : Number(form.cost_price),
      selling_price: form.selling_price === '' ? null : Number(form.selling_price),
    }
    try {
      if (modal.product) {
        await api.put(`/api/products/${modal.product.id}`, payload)
        notify('Product updated.', 'success')
      } else {
        await api.post('/api/products/', payload)
        notify('Product added to your inventory.', 'success')
      }
      closeModal()
      await onChanged()
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not save this product.'))
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct() {
    setSaving(true)
    try {
      await api.delete(`/api/products/${modal.product.id}`)
      notify('Product deleted.', 'success')
      closeModal()
      await onChanged()
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not delete this product.'))
    } finally {
      setSaving(false)
    }
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  return (
    <div className="page-content page-enter">
      <div className="page-toolbar">
        <div className="toolbar-search"><SearchField value={search} onChange={onSearch} placeholder="Search name or SKU" /></div>
        <div className="toolbar-filters">
          <label className="filter-field"><span>Category</span><select disabled aria-label="Category filter unavailable"><option>Not provided by API</option></select></label>
          <label className="filter-field"><span>Stock status</span><select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}><option value="all">All stock</option><option value="low">Low stock</option><option value="in">In stock</option></select></label>
          <Button onClick={openCreate}><Plus size={16} /> Add product</Button>
        </div>
      </div>
      <div className="products-summary">
        <span><strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'product' : 'products'}</span>
        <span className="summary-separator" />
        <span>Stock threshold: <strong>{threshold}</strong> units by default</span>
      </div>
      <section className="panel product-table-panel">
        {loading ? <LoadingState rows={5} /> : filteredProducts.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Quantity</th><th>Stock status</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const low = stockState(product, threshold) === 'Low stock'
                  return (
                    <tr key={product.id}>
                      <td><div className="product-cell"><span className="product-initial">{product.name?.slice(0, 1)?.toUpperCase() || 'P'}</span><strong className="table-product-name">{product.name}</strong></div></td>
                      <td className="mono-text">{product.sku}</td>
                      <td><span className="muted-cell">{product.category || 'Not provided'}</span></td>
                      <td>{product.selling_price == null ? <span className="muted-cell">—</span> : number(product.selling_price)}</td>
                      <td><strong>{number(product.quantity)}</strong></td>
                      <td><StatusBadge tone={low ? 'warning' : 'success'}>{low ? 'Low stock' : 'In stock'}</StatusBadge></td>
                      <td><div className="row-actions">
                        <button type="button" className="icon-button row-action" onClick={() => openDetails(product)} aria-label={`View ${product.name}`}><Eye size={16} /></button>
                        <button type="button" className="icon-button row-action" onClick={() => openEdit(product)} aria-label={`Edit ${product.name}`}><Pencil size={15} /></button>
                        <button type="button" className="icon-button row-action danger-action" onClick={() => { setFormError(''); setModal({ type: 'delete', product }) }} aria-label={`Delete ${product.name}`}><Trash2 size={15} /></button>
                      </div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={search || stockFilter !== 'all' ? Search : Package}
            title={search || stockFilter !== 'all' ? 'No matching products' : 'Your inventory starts here'}
            description={search || stockFilter !== 'all' ? 'Try another search or stock filter.' : 'Add your first product to keep its quantity and pricing in one place.'}
            action={search || stockFilter !== 'all' ? <Button variant="secondary" onClick={() => { onSearch(''); setStockFilter('all') }}>Clear filters</Button> : <Button onClick={openCreate}><Plus size={15} /> Add a product</Button>}
          />
        )}
      </section>

      {modal?.type === 'edit' && (
        <Modal title={modal.product ? 'Edit product' : 'Add a product'} description="Product details are saved to your inventory." onClose={closeModal}>
          <form className="modal-form" onSubmit={saveProduct}>
            <Field label="Product name" name="name" value={form.name} onChange={updateField} required minLength={1} maxLength={150} placeholder="e.g. Ceramic Pour-over" />
            <Field label="SKU" name="sku" value={form.sku} onChange={updateField} required minLength={1} maxLength={100} placeholder="e.g. CER-001" />
            <label className="form-field"><span>Description <small className="optional-label">Optional</small></span><textarea name="description" rows="3" value={form.description} onChange={updateField} placeholder="A short product description" /></label>
            <div className="form-grid">
              <Field label="Quantity" name="quantity" type="number" value={form.quantity} onChange={updateField} min="0" step="1" required />
              <Field label="Selling price" name="selling_price" type="number" value={form.selling_price} onChange={updateField} min="0" step="0.01" placeholder="Optional" />
              <Field label="Cost price" name="cost_price" type="number" value={form.cost_price} onChange={updateField} min="0" step="0.01" placeholder="Optional" />
            </div>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <div className="modal-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button><Button type="submit" loading={saving}>{modal.product ? 'Save changes' : 'Add product'}</Button></div>
          </form>
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <Modal title="Delete product?" description="This action cannot be undone." onClose={closeModal}>
          <div className="confirm-content"><p><strong>{modal.product.name}</strong> will be permanently removed from your inventory.</p>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="modal-actions"><Button variant="secondary" onClick={closeModal}>Keep product</Button><Button variant="danger" loading={saving} onClick={deleteProduct}><Trash2 size={15} /> Delete product</Button></div></div>
        </Modal>
      )}
      {modal?.type === 'details' && (
        <Modal title="Product details" description={detailLoading ? 'Loading product information…' : modal.product.name} onClose={closeModal}>
          <div className="details-grid">
            <Detail label="SKU" value={modal.product.sku} />
            <Detail label="Category" value={modal.product.category || 'Not provided by API'} />
            <Detail label="Quantity" value={`${number(modal.product.quantity)} units`} />
            <Detail label="Stock status" value={stockState(modal.product, threshold)} />
            <Detail label="Selling price" value={modal.product.selling_price == null ? 'Not set' : number(modal.product.selling_price)} />
            <Detail label="Cost price" value={modal.product.cost_price == null ? 'Not set' : number(modal.product.cost_price)} />
            <div className="detail-item detail-wide"><span>Description</span><p>{modal.product.description || 'No description provided.'}</p></div>
          </div>
          <div className="modal-actions"><Button variant="secondary" onClick={closeModal}>Close</Button><Button onClick={() => openEdit(modal.product)}><Pencil size={15} /> Edit product</Button></div>
        </Modal>
      )}
    </div>
  )
}

function Detail({ label, value }) {
  return <div className="detail-item"><span>{label}</span><p>{value}</p></div>
}
