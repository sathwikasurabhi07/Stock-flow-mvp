import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CircleAlert,
  Package,
  Plus,
  ScanLine,
  Wallet,
} from 'lucide-react'
import { Button, EmptyState, Panel, StatusBadge } from '../components/ui.jsx'

function formatNumber(value) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(value) || 0)
}

function inventoryValue(products) {
  if (products.some((product) => product.cost_price == null)) return null
  return products.reduce((sum, product) => sum + Number(product.cost_price) * Number(product.quantity), 0)
}

export default function DashboardPage({ dashboard, products, threshold, loading, onNavigate, onAddProduct }) {
  const lowStock = dashboard?.low_stock_products || products.filter(
    (product) => Number(product.quantity) <= Number(product.low_stock_threshold ?? threshold),
  )
  const value = inventoryValue(products)
  const chartProducts = [...products].sort((a, b) => Number(b.quantity) - Number(a.quantity)).slice(0, 7)
  const maxQuantity = Math.max(1, ...chartProducts.map((product) => Number(product.quantity)))
  const latestProducts = products.slice(0, 5)

  const stats = [
    { label: 'Total products', value: dashboard?.total_products ?? products.length, detail: 'Products in your catalogue', icon: Package, tone: 'terracotta' },
    { label: 'Total stock', value: dashboard?.total_quantity ?? products.reduce((sum, product) => sum + Number(product.quantity), 0), detail: 'Units currently on hand', icon: Boxes, tone: 'sage' },
    { label: 'Low stock items', value: dashboard?.low_stock_count ?? lowStock.length, detail: 'At or below your threshold', icon: CircleAlert, tone: 'amber', indicator: lowStock.length ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} /> },
    { label: 'Inventory value', value: value == null ? '—' : formatNumber(value), detail: value == null ? 'Add cost prices to calculate' : 'At recorded cost prices', icon: Wallet, tone: 'sand' },
  ]

  return (
    <div className="page-content page-enter">
      <div className="welcome-strip">
        <div><p className="eyebrow">YOUR INVENTORY AT A GLANCE</p><p>Here’s what’s happening across your stock today.</p></div>
        <Button onClick={onAddProduct}><Plus size={16} /> Add product</Button>
      </div>
      <div className="stats-grid">
        {stats.map(({ label, value: statValue, detail, icon: Icon, tone, indicator }) => (
          <article className="stat-card" key={label}>
            <div className="stat-top"><span className={`stat-icon icon-${tone}`}><Icon size={18} /></span>{indicator && <span className="stat-indicator">{indicator}<span>Live</span></span>}</div>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{loading ? <span className="skeleton-value" /> : formatStat(statValue)}</p>
            <p className="stat-detail">{detail}</p>
          </article>
        ))}
      </div>
      <div className="dashboard-grid">
        <Panel title="Stock overview" description="Quantity on hand, by product" action={<button className="text-action" onClick={() => onNavigate('reports')}>View report <ArrowRight size={14} /></button>} className="chart-panel">
          {loading ? <div className="chart-skeleton" /> : chartProducts.length ? (
            <div className="bar-chart">
              <div className="chart-axis"><span>{formatNumber(maxQuantity)}</span><span>{formatNumber(maxQuantity / 2)}</span><span>0</span></div>
              <div className="chart-bars">
                {chartProducts.map((product) => (
                  <div className="bar-column" key={product.id} title={`${product.name}: ${formatNumber(product.quantity)} units`}>
                    <span className="bar-value">{formatNumber(product.quantity)}</span>
                    <div className="bar-track"><span className="bar-fill" style={{ height: `${Math.max(4, (Number(product.quantity) / maxQuantity) * 100)}%` }} /></div>
                    <span className="bar-label">{product.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyState icon={ScanLine} title="Nothing to chart just yet" description="Add products and their quantities to see your stock overview." action={<Button variant="secondary" onClick={onAddProduct}>Add a product</Button>} />}
        </Panel>
        <Panel title="Low stock" description="Items that need a closer look" action={<button className="text-action" onClick={() => onNavigate('products')}>All products <ArrowRight size={14} /></button>} className="low-stock-panel">
          {loading ? <div className="loading-rows"><span className="skeleton-row" /><span className="skeleton-row" /><span className="skeleton-row" /></div> : lowStock.length ? (
            <div className="compact-list">
              {lowStock.slice(0, 5).map((product) => (
                <div className="compact-item" key={product.id}>
                  <span className="product-initial">{product.name?.slice(0, 1)?.toUpperCase() || 'P'}</span>
                  <span className="compact-copy"><strong>{product.name}</strong><small>{product.sku}</small></span>
                  <span className="quantity-warning">{formatNumber(product.quantity)} <small>left</small></span>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={CircleAlert} title="All clear" description="No low-stock products were returned by your inventory." />}
        </Panel>
      </div>
      <Panel title="Latest products" description="Recently returned by your inventory" action={<button className="text-action" onClick={() => onNavigate('products')}>Open products <ArrowRight size={14} /></button>} className="latest-panel">
        {loading ? <div className="loading-rows"><span className="skeleton-row" /><span className="skeleton-row" /></div> : latestProducts.length ? (
          <div className="table-scroll">
            <table className="data-table compact-table">
              <thead><tr><th>Product</th><th>SKU</th><th>Quantity</th><th>Stock status</th></tr></thead>
              <tbody>{latestProducts.map((product) => {
                const isLow = Number(product.quantity) <= Number(product.low_stock_threshold ?? threshold)
                return <tr key={product.id}><td><strong className="table-product-name">{product.name}</strong></td><td className="mono-text">{product.sku}</td><td>{formatNumber(product.quantity)}</td><td><StatusBadge tone={isLow ? 'warning' : 'success'}>{isLow ? 'Low stock' : 'In stock'}</StatusBadge></td></tr>
              })}</tbody>
            </table>
          </div>
        ) : <EmptyState icon={Package} title="Your product list is ready" description="Add your first product and it will appear here." action={<Button variant="secondary" onClick={onAddProduct}>Add a product</Button>} />}
      </Panel>
      <div className="quick-actions">
        <div><p className="eyebrow">QUICK ACTIONS</p><p>What would you like to do?</p></div>
        <div className="quick-action-buttons">
          <Button variant="secondary" onClick={onAddProduct}><Plus size={15} /> New product</Button>
          <Button variant="ghost" onClick={() => onNavigate('reports')}><ArrowRight size={15} /> View reports</Button>
        </div>
      </div>
    </div>
  )
}

function formatStat(value) {
  if (typeof value === 'string') return value
  return formatNumber(value)
}
