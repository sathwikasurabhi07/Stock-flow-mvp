import { LoaderCircle, Search, X } from 'lucide-react'

export function Button({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`button button-${variant} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle size={16} className="spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function SearchField({ value, onChange, placeholder = 'Search', className = '' }) {
  return (
    <label className={`search-field ${className}`}>
      <Search size={16} aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button type="button" className="search-clear" onClick={() => onChange('')} aria-label="Clear search">
          <X size={14} />
        </button>
      )}
    </label>
  )
}

export function Field({ label, hint, className = '', ...props }) {
  const { icon: Icon, ...inputProps } = props
  return (
    <label className={`form-field ${className}`}>
      <span>{label}</span>
      <span className={`input-wrap ${Icon ? 'input-with-icon' : ''}`}>
        {Icon && <Icon size={16} aria-hidden="true" />}
        <input {...inputProps} />
      </span>
      {hint && <small>{hint}</small>}
    </label>
  )
}

export function Panel({ title, description, action, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <div className="panel-heading">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function StatusBadge({ children, tone = 'neutral' }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && <span className="empty-icon"><Icon size={20} /></span>}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

export function LoadingState({ rows = 4 }) {
  return (
    <div className="loading-rows" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => <span className="skeleton-row" key={index} />)}
    </div>
  )
}

export function Modal({ title, description, onClose, children, size = '' }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${size}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="toast-viewport" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
          <span>{toast.message}</span>
          <button type="button" className="icon-button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}
