import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { useToast, type Toast, type ToastVariant } from '../../context/ToastContext'

const variantConfig: Record<
  ToastVariant,
  { icon: React.ReactNode; colorVar: string; bgVar: string; borderVar: string }
> = {
  success: {
    icon: <CheckCircle size={18} aria-hidden="true" />,
    colorVar:  'var(--color-confirmado)',
    bgVar:     'var(--color-confirmado-bg)',
    borderVar: 'var(--color-confirmado-border)',
  },
  error: {
    icon: <XCircle size={18} aria-hidden="true" />,
    colorVar:  'var(--color-cancelado)',
    bgVar:     'var(--color-cancelado-bg)',
    borderVar: 'var(--color-cancelado-border)',
  },
  warning: {
    icon: <AlertTriangle size={18} aria-hidden="true" />,
    colorVar:  'var(--color-pendente)',
    bgVar:     'var(--color-pendente-bg)',
    borderVar: 'var(--color-pendente-border)',
  },
  info: {
    icon: <Info size={18} aria-hidden="true" />,
    colorVar:  'var(--color-primary)',
    bgVar:     'var(--color-primary-muted)',
    borderVar: 'var(--color-primary)',
  },
}

function ToastItem({ toast }: { toast: Toast }) {
  const { dismiss } = useToast()
  const [visible, setVisible] = useState(false)
  const cfg = variantConfig[toast.variant]

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(() => dismiss(toast.id), 250)
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface)',
        border: `1px solid ${cfg.borderVar}`,
        boxShadow: 'var(--shadow-soft)',
        color: 'var(--color-text-primary)',
        fontSize: '0.875rem',
        fontWeight: 500,
        minWidth: '280px',
        maxWidth: '420px',
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s ease, opacity 0.25s ease',
        borderLeft: `4px solid ${cfg.colorVar}`,
      }}
    >
      <span style={{ color: cfg.colorVar, flexShrink: 0 }}>{cfg.icon}</span>
      <span style={{ flex: 1, color: 'var(--color-text-primary)' }}>{toast.message}</span>
      <button
        onClick={handleDismiss}
        aria-label="Fechar notificação"
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          color: 'var(--color-text-tertiary)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useToast()

  return createPortal(
    <div
      aria-label="Notificações"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: toasts.length === 0 ? 'none' : 'auto',
      }}
    >
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>,
    document.body,
  )
}
