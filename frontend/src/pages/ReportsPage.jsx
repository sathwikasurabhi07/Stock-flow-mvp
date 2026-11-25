import { useMemo } from 'react'
import { BarChart3, CircleAlert, Coins, Package } from 'lucide-react'
import { EmptyState, Panel, StatusBadge } from '../components/ui.jsx'

function formatNumber(value) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(value) || 0)
}

export default function ReportsPage({ products, dashboard, threshold, loading, onNavigate }) {
  const stockTotals = useMemo(() => products.reduce((totals, product) => {
    const key = Number(product.quantity) <= Number(product.low_stock_threshold ?? threshold) ? 'low' : 'healthy'
    totals[key] += 1
    return totals
  }, { low: 0, healthy: 0 }), [products, threshold])

  const value = products.every((product) => product.cost_price != null)
    ? products.reduce((total, product) => total + Number(product.cost_price) * Number(product.quantity), 0)
    : null
  const lowProducts = dashboard?.low_stock_products || products.filter(
    (product) => Number(product.quantity) <= Number(product.low_stock_threshold ?? threshold),
  )

  return (
    <div className="page-content page-enter">
      <div className="report-note"><BarChart3 size={17} /><span>Analytics below are calculated from the inventory data currently returned by your API. No historical or time-series data is available.</span></div>
      <div className="report-grid">
        <Panel title="Stock distribution" description="Products grouped by current stock status" className="report-panel">
          {loading ? <div className="chart-skeleton" /> : products.length ? (
            <div className="distribution">
              <div className="distribution-total"><strong>{formatNumber(products.length)}</strong><span>products tracked</span></div>
              <div className="distribution-bar"><span className="distribution-good" style={{ width: `${stockTotals.healthy / products.length * 100}%` }} /><span className="distribution-low" style={{ width: `${stockTotals.low / products.length * 100}%` }} /></div>
              <div className="distribution-legend"><span><i className="legend-dot dot-sage" />In stock <strong>{stockTotals.healthy}</strong></span><span><i className="legend-dot dot-amber" />Low stock <strong>{stockTotals.low}</strong></span></div>
            </div>
          ) : <EmptyState icon={Package} title="No stock data yet" description="Add products to generate a stock distribution." />}
        </Panel>
        <Panel title="Inventory value" description="Calculated only when all cost prices are recorded" className="report-panel value-report">
          <div className="report-metric-icon"><Coins size={19} /></div>
          <p className="report-metric">{value == null ? '—' : formatNumber(value)}</p>
          <p className="report-subtext">{value == null ? 'Add cost prices to every product for a complete inventory value.' : 'Total quantity × recorded cost price. Currency is not specified by the API.'}</p>
        </Panel>
        <Panel title="Low-stock report" description="Products at or below their configured threshold" className="report-wide">
          {loading ? <div className="loading-rows"><span className="skeleton-row" /><span className="skeleton-row" /></div> : lowProducts.length ? (
            <div className="table-scroll"><table className="data-table"><thead><tr><th>Product</th><th>SKU</th><th>Quantity</th><th>Threshold</th><th>Status</th></tr></thead><tbody>
              {lowProducts.map((product) => <tr key={product.id}><td><strong className="table-product-name">{product.name}</strong></td><td className="mono-text">{product.sku}</td><td>{formatNumber(product.quantity)}</td><td>{product.low_stock_threshold ?? threshold}</td><td><StatusBadge tone="warning">Low stock</StatusBadge></td></tr>)}
            </tbody></table></div>
          ) : <EmptyState icon={CircleAlert} title="No low-stock products" description="There are no products at or below the current stock threshold." />}
        </Panel>
        <Panel title="Category overview" description="Product categories are not included in the current API response." className="report-wide">
          <div className="unsupported-row"><span className="unsupported-icon"><Package size={18} /></span><div><strong>Category analytics unavailable</strong><p>The API does not expose a category field for products, so category totals cannot be calculated accurately.</p></div></div>
        </Panel>
      </div>
      <div className="report-footer"><span>Inventory records: <strong>{formatNumber(dashboard?.total_products ?? products.length)}</strong></span><span>Historical date filters are unavailable without time-series data.</span><button type="button" className="text-action" onClick={() => onNavigate('products')}>Manage products <span aria-hidden="true">→</span></button></div>
    </div>
  )
}
