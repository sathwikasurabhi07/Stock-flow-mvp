import { useEffect, useState } from 'react'
import { Bell, Building2, CircleHelp, LockKeyhole, Package, Save, UserRound } from 'lucide-react'
import { Button, Field, Panel } from '../components/ui.jsx'
import api, { EMAIL_KEY, getErrorMessage } from '../lib/api.js'

export default function SettingsPage({ notify, onSettingsChanged }) {
  const [threshold, setThreshold] = useState('5')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const email = localStorage.getItem(EMAIL_KEY) || ''

  useEffect(() => {
    let active = true
    api.get('/api/settings/').then(({ data }) => {
      if (active) setThreshold(String(data.default_low_stock_threshold))
    }).catch((requestError) => {
      if (active) setError(getErrorMessage(requestError, 'Could not load inventory preferences.'))
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  async function saveThreshold(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { data } = await api.put('/api/settings/', { default_low_stock_threshold: Number(threshold) })
      setThreshold(String(data.default_low_stock_threshold))
      notify('Inventory preferences saved.', 'success')
      await onSettingsChanged()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not save your inventory preferences.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-content page-enter settings-page">
      <div className="settings-intro"><p>Adjust inventory preferences for your workspace. Changes are saved to StockFlow.</p><span><CircleHelp size={15} /> Only settings supported by your API can be changed here.</span></div>
      <Panel title="Organization" description="Workspace details" className="settings-panel">
        <div className="settings-row"><span className="settings-row-icon"><Building2 size={18} /></span><div className="settings-row-copy"><strong>Organization name</strong><p>Organization profile details are not currently exposed by the API.</p></div><span className="unavailable-label">Unavailable</span></div>
      </Panel>
      <Panel title="Account" description="Your sign-in information" className="settings-panel">
        <div className="settings-row"><span className="settings-row-icon"><UserRound size={18} /></span><div className="settings-row-copy"><strong>Email address</strong><p>{email || 'No email saved in this browser session.'}</p></div><span className="unavailable-label">Read only</span></div>
        <div className="settings-row"><span className="settings-row-icon"><LockKeyhole size={18} /></span><div className="settings-row-copy"><strong>Password</strong><p>Password management is not available through the current API.</p></div><span className="unavailable-label">Unavailable</span></div>
      </Panel>
      <Panel title="Inventory preferences" description="Set the default threshold for low-stock alerts" className="settings-panel">
        <form className="settings-form" onSubmit={saveThreshold}>
          <div className="settings-row"><span className="settings-row-icon"><Package size={18} /></span><div className="settings-row-copy"><strong>Default low-stock threshold</strong><p>Products at or below this quantity are flagged for attention unless a product-level threshold is set.</p></div>
            <Field label="Units" type="number" min="0" max="100000" step="1" value={threshold} onChange={(event) => setThreshold(event.target.value)} disabled={loading} required />
          </div>
          {error && <p className="form-error settings-error" role="alert">{error}</p>}
          <div className="settings-save"><Button type="submit" loading={saving} disabled={loading || threshold === ''}><Save size={15} /> Save preference</Button></div>
        </form>
      </Panel>
      <Panel title="Notifications" description="Choose how StockFlow keeps you informed" className="settings-panel">
        <div className="settings-row"><span className="settings-row-icon"><Bell size={18} /></span><div className="settings-row-copy"><strong>Notification preferences</strong><p>Per-channel notification settings are not supported by the current API. Low-stock alerts are shown in the app when available.</p></div><span className="unavailable-label">In-app only</span></div>
      </Panel>
    </div>
  )
}
