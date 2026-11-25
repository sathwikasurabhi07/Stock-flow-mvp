import { ArrowUpRight, ClipboardList, ShoppingBag } from 'lucide-react'
import { EmptyState, Panel, StatusBadge } from '../components/ui.jsx'

export default function OrdersPage() {
  return (
    <div className="page-content page-enter">
      <div className="stats-grid order-stats">
        <article className="stat-card"><div className="stat-top"><span className="stat-icon icon-sand"><ShoppingBag size={18} /></span><StatusBadge>Unavailable</StatusBadge></div><p className="stat-label">Total orders</p><p className="stat-value stat-na">—</p><p className="stat-detail">No order endpoint is configured</p></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-icon icon-sage"><ClipboardList size={18} /></span><StatusBadge>Unavailable</StatusBadge></div><p className="stat-label">Orders in progress</p><p className="stat-value stat-na">—</p><p className="stat-detail">Order status data is not available</p></article>
        <article className="stat-card order-intro"><div><p className="eyebrow">ORDER MANAGEMENT</p><h2>One place for every order.</h2><p>Connect an orders API to manage fulfillment, status, and order history here.</p></div><ArrowUpRight size={19} /></article>
      </div>
      <Panel title="Orders" description="Order records are not currently available from the StockFlow API.">
        <EmptyState
          icon={ShoppingBag}
          title="Orders are not connected yet"
          description="This workspace currently exposes inventory, dashboard, and settings endpoints only. No order table or order actions are shown here."
        />
      </Panel>
    </div>
  )
}
