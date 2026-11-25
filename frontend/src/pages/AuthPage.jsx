import { useState } from 'react'
import { ArrowRight, Boxes, LockKeyhole, Mail, Store } from 'lucide-react'
import { Button, Field } from '../components/ui.jsx'
import api, { EMAIL_KEY, getErrorMessage, TOKEN_KEY } from '../lib/api.js'

const currentYear = new Date().getFullYear()

export default function AuthPage({ onAuthenticated, notify }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organization, setOrganization] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isRegister = mode === 'register'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post(`/api/auth/${isRegister ? 'register' : 'login'}`, isRegister
        ? { email, password, organization_name: organization }
        : { email, password })
      localStorage.setItem(TOKEN_KEY, data.access_token)
      localStorage.setItem(EMAIL_KEY, email)
      onAuthenticated(email)
      notify(isRegister ? 'Your StockFlow account is ready.' : 'Welcome back to StockFlow.', 'success')
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Please check your details and try again.'))
    } finally {
      setLoading(false)
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  return (
    <main className="auth-page">
      <div className="auth-topline">
        <a className="auth-brand" href="/" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><Boxes size={19} /></span>
          <span className="brand-name">stockflow<span>.</span></span>
        </a>
        <span className="auth-topnote">A calmer way to manage stock</span>
      </div>
      <section className="auth-card">
        <span className="auth-symbol"><Store size={23} strokeWidth={1.7} /></span>
        <p className="eyebrow">{isRegister ? 'YOUR BUSINESS, IN ORDER' : 'WELCOME BACK'}</p>
        <h1>{isRegister ? 'Create your workspace' : 'Good to have you back.'}</h1>
        <p className="auth-description">
          {isRegister ? 'Set up your StockFlow account to get started.' : 'Sign in to pick up right where you left off.'}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <Field
              label="Organization name"
              name="organization_name"
              placeholder="Your business name"
              autoComplete="organization"
              required
              minLength={2}
              maxLength={150}
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
              icon={Store}
            />
          )}
          <Field
            label="Email address"
            type="email"
            name="email"
            placeholder="you@company.com"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            icon={Mail}
          />
          <Field
            label="Password"
            type="password"
            name="password"
            placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
            minLength={isRegister ? 8 : undefined}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            icon={LockKeyhole}
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit" className="auth-submit" loading={loading}>
            {isRegister ? 'Create account' : 'Sign in'} <ArrowRight size={16} />
          </Button>
        </form>
        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'New to StockFlow?'}{' '}
          <button type="button" onClick={() => changeMode(isRegister ? 'login' : 'register')}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </section>
      <footer className="auth-footer"><span>Thoughtful inventory management</span><span>© {currentYear} StockFlow</span></footer>
    </main>
  )
}
