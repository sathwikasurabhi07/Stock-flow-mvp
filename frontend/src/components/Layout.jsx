import { useState } from 'react'
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  X,
} from 'lucide-react'
import { SearchField } from './ui.jsx'

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ page, onNavigate, onLogout, open, onClose, email }) {
  return (
    <>
      {open && <button className="mobile-scrim" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <span className="brand-mark"><Boxes size={20} strokeWidth={1.8} /></span>
          <span className="brand-name">stockflow<span>.</span></span>
          <button type="button" className="mobile-close icon-button" onClick={onClose} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>
        <div className="workspace-switcher">
          <span className="workspace-avatar">S</span>
          <span className="workspace-copy"><strong>Workspace</strong><small>Inventory management</small></span>
          <ChevronDown size={15} />
        </div>
        <p className="nav-caption">WORKSPACE</p>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={`nav-link ${page === id ? 'nav-link-active' : ''}`}
              onClick={() => { onNavigate(id); onClose() }}
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {id === 'orders' && <span className="nav-soon">Soon</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <div className="sidebar-note-icon"><Package size={17} /></div>
            <div><strong>Stock, in good order.</strong><p>A little more clarity, every day.</p></div>
          </div>
          <div className="sidebar-account">
            <span className="account-avatar">{(email || 'S').slice(0, 1).toUpperCase()}</span>
            <div className="account-copy"><strong>{email || 'Your account'}</strong><small>Signed in</small></div>
            <button type="button" className="account-logout" onClick={onLogout} aria-label="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export function AppHeader({ page, email, search, onSearch, onMenu, lowStockCount, onNavigate }) {
  const [alertsOpen, setAlertsOpen] = useState(false)
  const titles = {
    dashboard: ['Good to see you', 'A considered view of your inventory.'],
    products: ['Products', 'Keep your inventory accurate and in good order.'],
    orders: ['Orders', 'Order management is not connected yet.'],
    reports: ['Reports', 'A clear view of the stock you have today.'],
    settings: ['Settings', 'Manage the preferences available to your workspace.'],
  }
  const [title, subtitle] = titles[page] || titles.dashboard

  return (
    <header className="app-header">
      <button type="button" className="mobile-menu icon-button" onClick={onMenu} aria-label="Open navigation">
        <Menu size={19} />
      </button>
      <div className="header-title">
        <h1>{title}{page === 'dashboard' ? <span className="title-period">.</span> : null}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="header-actions">
        <SearchField
          className="header-search"
          value={page === 'products' ? search : ''}
          onChange={(value) => { onSearch(value); if (page !== 'products') onNavigate('products') }}
          placeholder="Search products"
        />
        <div className="notification-wrap">
          <button
            type="button"
            className="icon-button notification-button"
            onClick={() => setAlertsOpen((value) => !value)}
            aria-label={`Notifications${lowStockCount ? `, ${lowStockCount} low-stock items` : ''}`}
            aria-expanded={alertsOpen}
          >
            <Bell size={18} />
            {lowStockCount > 0 && <span className="notification-dot" />}
          </button>
          {alertsOpen && (
            <div className="notification-popover">
              <strong>Inventory alerts</strong>
              {lowStockCount > 0 ? (
                <>
                  <p>{lowStockCount} product{lowStockCount === 1 ? '' : 's'} at or below the stock threshold.</p>
                  <button type="button" onClick={() => { onNavigate('products'); setAlertsOpen(false) }}>Review products</button>
                </>
              ) : <p>No low-stock alerts right now.</p>}
            </div>
          )}
        </div>
        <div className="header-profile">
          <span className="account-avatar">{(email || 'S').slice(0, 1).toUpperCase()}</span>
          <span className="header-email">{email || 'Your account'}</span>
        </div>
      </div>
    </header>
  )
}
