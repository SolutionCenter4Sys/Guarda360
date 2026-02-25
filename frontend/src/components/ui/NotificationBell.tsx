import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCircle, AlertTriangle, DollarSign, Calendar, X, Check } from 'lucide-react'

type NotifVariant = 'info' | 'warning' | 'success' | 'danger'

interface Notification {
  id: string
  variant: NotifVariant
  title: string
  message: string
  time: string
  read: boolean
}

const variantIcon: Record<NotifVariant, React.ReactNode> = {
  success: <CheckCircle size={16} aria-hidden="true" />,
  warning: <AlertTriangle size={16} aria-hidden="true" />,
  danger:  <AlertTriangle size={16} aria-hidden="true" />,
  info:    <Calendar size={16} aria-hidden="true" />,
}

const variantColor: Record<NotifVariant, string> = {
  success: 'var(--color-confirmado)',
  warning: 'var(--color-pendente)',
  danger:  'var(--color-cancelado)',
  info:    'var(--color-primary)',
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    variant: 'warning',
    title: 'Pensão vence em 3 dias',
    message: 'Vencimento da pensão alimentícia em 05/03. Valor: R$ 1.800,00.',
    time: 'Agora',
    read: false,
  },
  {
    id: 'n2',
    variant: 'info',
    title: 'Visita confirmada amanhã',
    message: 'João confirmou a visita de amanhã às 14h. Check-in disponível.',
    time: '2h atrás',
    read: false,
  },
  {
    id: 'n3',
    variant: 'danger',
    title: 'Nova ocorrência registrada',
    message: 'Uma ocorrência CRÍTICA foi registrada: "Alienação parental detectada".',
    time: '1 dia atrás',
    read: false,
  },
  {
    id: 'n4',
    variant: 'success',
    title: 'Pagamento registrado',
    message: 'Pensão de Fevereiro foi registrada com comprovante.',
    time: '3 dias atrás',
    read: true,
  },
  {
    id: 'n5',
    variant: 'info',
    title: 'Co-guardião aceitou convite',
    message: 'João Pereira criou a conta e está vinculado ao seu perfil.',
    time: '5 dias atrás',
    read: true,
  },
]

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  /* Close on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  /* Close on Escape */
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open])

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  const dismiss = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id))

  const markRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={`Notificações${unreadCount > 0 ? ` — ${unreadCount} não lida(s)` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          position: 'relative',
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          background: open ? 'var(--color-surface-alt)' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          transition: 'background 0.15s',
        }}
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'var(--foursys-gradient)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              border: '1.5px solid var(--color-surface)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="dialog"
          aria-label="Notificações"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '360px',
            maxWidth: 'calc(100vw - 24px)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-soft-hover)',
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                Notificações
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'var(--foursys-gradient)',
                    color: '#fff',
                    borderRadius: '9999px',
                    padding: '1px 7px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: '12px',
                  color: 'var(--color-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 500,
                }}
                aria-label="Marcar todas como lidas"
              >
                <Check size={13} aria-hidden="true" />
                Marcar todas lidas
              </button>
            )}
          </div>

          {/* Notifications list */}
          <ul
            style={{ maxHeight: '380px', overflowY: 'auto', listStyle: 'none', margin: 0, padding: 0 }}
            aria-label="Lista de notificações"
          >
            {notifications.length === 0 && (
              <li style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
                Nenhuma notificação
              </li>
            )}
            {notifications.map(notif => (
              <li
                key={notif.id}
                onClick={() => markRead(notif.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  background: notif.read ? 'transparent' : 'color-mix(in srgb, var(--color-primary) 4%, transparent)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (notif.read) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-alt)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = notif.read ? 'transparent' : 'color-mix(in srgb, var(--color-primary) 4%, transparent)' }}
                role="listitem"
              >
                {/* Icon */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: variantColor[notif.variant],
                    background: `color-mix(in srgb, ${variantColor[notif.variant]} 12%, transparent)`,
                  }}
                  aria-hidden="true"
                >
                  {variantIcon[notif.variant]}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <p
                      style={{
                        fontSize: '13px',
                        fontWeight: notif.read ? 500 : 700,
                        color: 'var(--color-text-primary)',
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: 'var(--color-primary)',
                          flexShrink: 0,
                        }}
                        aria-label="Não lida"
                      />
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-tertiary)',
                      marginTop: '2px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {notif.message}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px', display: 'block' }}>
                    {notif.time}
                  </span>
                </div>

                {/* Dismiss */}
                <button
                  onClick={e => { e.stopPropagation(); dismiss(notif.id) }}
                  aria-label={`Descartar: ${notif.title}`}
                  style={{
                    flexShrink: 0,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-tertiary)',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
            }}
          >
            <button
              style={{
                fontSize: '12px',
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Ver todas as notificações →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
