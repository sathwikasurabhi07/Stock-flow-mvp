import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { AppHeader, Sidebar } from './components/Layout.jsx'
import { Button, ToastViewport } from './components/ui.jsx'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import api, { EMAIL_KEY, getErrorMessage, TOKEN_KEY } from './lib/api.js'

function fetchInventory() {
  return Promise.allSettled([
    api.get('/api/dashboard/'),
    api.get('/api/products/'),
    api.get('/api/settings/'),
  ])
}

function App() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) || '')
  const [page, setPage] = useState('dashboard')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [dashboard, setDashboard] = useState(null)
  const [products, setProducts] = useState([])
  const [threshold, setThreshold] = useState(5)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))
  const [dataErrors, setDataErrors] = useState([])
  const [search, setSearch] = useState('')
  const [createRequestId, setCreateRequestId] = useState(0)
  const [toasts, setToasts] = useState([])

  const notify = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((current) => [...current, { id, message, type }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4200)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const applyInventory = useCallback(([dashboardResult, productsResult, settingsResult]) => {
    const errors = []
    if (dashboardResult.status === 'fulfilled') setDashboard(dashboardResult.value.data)
    else errors.push(`Dashboard: ${getErrorMessage(dashboardResult.reason)}`)
    if (productsResult.status === 'fulfilled') setProducts(productsResult.value.data)
    else errors.push(`Products: ${getErrorMessage(productsResult.reason)}`)
    if (settingsResult.status === 'fulfilled') setThreshold(settingsResult.value.data.default_low_stock_threshold)
    else errors.push(`Settings: ${getErrorMessage(settingsResult.reason)}`)
    setDataErrors(errors)
    setLoading(false)
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    applyInventory(await fetchInventory())
  }, [applyInventory])

  useEffect(() => {
    if (!authenticated) return undefined
    let active = true
    fetchInventory().then((results) => {
      if (active) applyInventory(results)
    })
    return () => { active = false }
  }, [authenticated, applyInventory])

  useEffect(() => {
    function expireSession() {
      setAuthenticated(false)
      setEmail('')
      setPage('dashboard')
      notify('Your session expired. Please sign in again.', 'error')
    }
    window.addEventListener('stockflow:session-expired', expireSession)
    return () => window.removeEventListener('stockflow:session-expired', expireSession)
  }, [notify])

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    setAuthenticated(false)
    setDashboard(null)
    setProducts([])
    setPage('dashboard')
    setLoading(false)
    notify('You have signed out.', 'success')
  }

  function addProduct() {
    setPage('products')
    setCreateRequestId((current) => current + 1)
  }

  function navigate(nextPage) {
    setPage(nextPage)
    if (nextPage !== 'products') setCreateRequestId(0)
  }

  function signIn(userEmail) {
    setEmail(userEmail)
    setLoading(true)
    setAuthenticated(true)
  }

  if (!authenticated) {
    return <><AuthPage onAuthenticated={signIn} notify={notify} /><ToastViewport toasts={toasts} onDismiss={dismissToast} /></>
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        onNavigate={navigate}
        onLogout={logout}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        email={email}
      />
      <main className="main-shell">
        <AppHeader
          page={page}
          email={email}
          search={search}
          onSearch={setSearch}
          onMenu={() => setMobileNavOpen(true)}
          lowStockCount={dashboard?.low_stock_count || 0}
          onNavigate={navigate}
        />
        {dataErrors.length > 0 && (
          <div className="data-error-banner" role="alert">
            <AlertCircle size={17} />
            <div><strong>Some inventory data could not be loaded.</strong><p>{dataErrors.join(' ')}</p></div>
            <Button variant="secondary" onClick={loadData}><RefreshCw size={14} /> Retry</Button>
          </div>
        )}
        {page === 'dashboard' && <DashboardPage dashboard={dashboard} products={products} threshold={threshold} loading={loading} onNavigate={navigate} onAddProduct={addProduct} />}
        {page === 'products' && <ProductsPage key={`products-${createRequestId}`} products={products} threshold={threshold} loading={loading} onChanged={loadData} notify={notify} search={search} onSearch={setSearch} initialCreate={createRequestId > 0} onCreateHandled={() => setCreateRequestId(0)} />}
        {page === 'orders' && <OrdersPage />}
        {page === 'reports' && <ReportsPage products={products} dashboard={dashboard} threshold={threshold} loading={loading} onNavigate={navigate} />}
        {page === 'settings' && <SettingsPage notify={notify} onSettingsChanged={loadData} />}
      </main>
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default App
