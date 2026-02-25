import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Calendar, MessageSquare,
  DollarSign, AlertTriangle, FileText, X, Shield, Heart,
  Scale, Activity, Settings, Bell, CheckCircle, Clock,
  DollarSign as DollarIcon, CalendarCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

/* ─── Mock notifications (F-02.08) ─── */
interface AppNotification {
  id: string
  type: 'VISITA' | 'PAGAMENTO' | 'OCORRENCIA' | 'COMUNICADO' | 'SISTEMA'
  title: string
  body: string
  createdAt: string
  read: boolean
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1', type: 'VISITA',
    title: 'Visita amanhã — Lucas',
    body: 'Visita de João Pereira está agendada para amanhã às 08:00. Confirme a presença.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: false,
  },
  {
    id: 'n-2', type: 'PAGAMENTO',
    title: 'Pensão — vencimento em 3 dias',
    body: 'O pagamento de R$ 1.850,00 referente a março/2026 vence em 3 dias.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), read: false,
  },
  {
    id: 'n-3', type: 'OCORRENCIA',
    title: 'Nova ocorrência registrada',
    body: 'João Pereira registrou uma ocorrência de grau MÉDIO. Verifique no módulo de Ocorrências.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: true,
  },
  {
    id: 'n-4', type: 'COMUNICADO',
    title: 'Novo comunicado escolar',
    body: 'Escola Dom Pedro II enviou: Reunião de pais — 15/03/2026 às 19h.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: true,
  },
  {
    id: 'n-5', type: 'SISTEMA',
    title: 'Relatório pronto para download',
    body: 'O relatório "Convivência — Fev/2026" foi gerado com sucesso e está disponível.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), read: true,
  },
]

const notifIcon = (type: AppNotification['type']) => {
  const s = { size: 14 }
  if (type === 'VISITA')    return <CalendarCheck {...s} aria-hidden="true" />
  if (type === 'PAGAMENTO') return <DollarIcon {...s} aria-hidden="true" />
  if (type === 'OCORRENCIA') return <AlertTriangle {...s} aria-hidden="true" />
  if (type === 'COMUNICADO') return <MessageSquare {...s} aria-hidden="true" />
  return <Bell {...s} aria-hidden="true" />
}

const notifColor = (type: AppNotification['type']) => {
  if (type === 'VISITA')     return '#1D4ED8'
  if (type === 'PAGAMENTO')  return '#16A34A'
  if (type === 'OCORRENCIA') return '#DC2626'
  if (type === 'COMUNICADO') return '#7C3AED'
  return '#6B7280'
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}min atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number
  group: string
}

const navItems: NavItem[] = [
  { to: '/dashboard',          icon: <LayoutDashboard size={20} />, label: 'Dashboard',         group: 'principal' },
  { to: '/children',           icon: <Users size={20} />,           label: 'Filhos',            group: 'principal' },
  { to: '/calendar',           icon: <Calendar size={20} />,        label: 'Calendário',        group: 'principal' },
  { to: '/chat',               icon: <MessageSquare size={20} />,   label: 'Chat',              group: 'principal', badge: 3 },
  { to: '/financial',          icon: <DollarSign size={20} />,      label: 'Financeiro',        group: 'principal' },
  { to: '/health',             icon: <Heart size={20} />,           label: 'Saúde & Escola',    group: 'principal' },
  { to: '/incidents',          icon: <AlertTriangle size={20} />,   label: 'Ocorrências',       group: 'principal', badge: 2 },
  { to: '/reports',            icon: <FileText size={20} />,        label: 'Relatórios',        group: 'principal' },
  { to: '/authorized-persons', icon: <Scale size={20} />,           label: 'Terceiros',         group: 'admin' },
  { to: '/audit',              icon: <Activity size={20} />,        label: 'Auditoria',         group: 'admin' },
  { to: '/settings',           icon: <Settings size={20} />,        label: 'Configurações',     group: 'admin' },
]

const groupLabels: Record<string, string> = {
  principal: 'Principal',
  admin:     'Administração',
}

interface SidebarProps {
  onClose: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS)
  const [showNotifPanel, setShowNotifPanel] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-surface)' }}>

      {/* ─── Logo — Foursys gradient + brand typography ─── */}
      <div
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{
          height: '64px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--foursys-gradient)', boxShadow: '0 2px 8px rgba(124,58,237,0.30)' }}
            aria-hidden="true"
          >
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <span
              className="text-h4 leading-none"
              style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--weight-bold)' }}
            >
              Guarda
              <span style={{ background: 'var(--foursys-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>360°</span>
            </span>
            <p className="text-label mt-0.5" style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>
              Guarda Compartilhada
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifPanel(v => !v)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{
              background: showNotifPanel ? 'var(--color-primary)' : 'transparent',
              color: showNotifPanel ? '#fff' : 'var(--color-text-tertiary)',
            }}
            aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ''}`}
            aria-expanded={showNotifPanel}
          >
            <Bell size={18} aria-hidden="true" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs font-extrabold flex items-center justify-center text-white"
                style={{ background: 'var(--color-error)', fontSize: '10px' }}
                aria-hidden="true"
              >
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={onClose}
            className="lg:hidden btn-ghost p-0 w-8 h-8 rounded-md"
            aria-label="Fechar menu de navegação"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ─── Notification Panel (F-02.08) ─── */}
      {showNotifPanel && (
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface-alt)',
            maxHeight: '340px',
            overflowY: 'auto',
          }}
          role="region"
          aria-label="Painel de notificações"
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Notificações {unreadCount > 0 && <span className="text-[var(--color-error)]">({unreadCount})</span>}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold flex items-center gap-1"
                style={{ color: 'var(--color-primary)' }}
              >
                <CheckCircle size={11} aria-hidden="true" />
                Marcar todas lidas
              </button>
            )}
          </div>
          <div className="divide-y" style={{ '--tw-divide-color': 'var(--color-border)' } as React.CSSProperties}>
            {notifications.map(n => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className="w-full text-left px-4 py-3 transition-colors flex items-start gap-3"
                style={{
                  background: n.read ? 'transparent' : 'rgba(29,78,216,0.04)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-border)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : 'rgba(29,78,216,0.04)' }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${notifColor(n.type)}18`, color: notifColor(n.type) }}
                  aria-hidden="true"
                >
                  {notifIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p
                      className="text-xs font-semibold truncate leading-snug"
                      style={{ color: n.read ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}
                    >
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: 'var(--color-primary)' }} aria-label="Não lida" />
                    )}
                  </div>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-tertiary)' }}>{n.body}</p>
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    <Clock size={10} aria-hidden="true" />
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Navigation ─── */}
      <nav
        className="flex-1 px-3 py-4 overflow-y-auto"
        role="navigation"
        aria-label="Navegação principal"
      >
        {(['principal', 'admin'] as const).map(group => {
          const groupNavItems = navItems.filter(i => i.group === group)
          return (
            <div key={group} className="mb-3">
              <p
                className="text-label px-3 mb-1"
                style={{ color: 'var(--color-text-tertiary)', fontSize: '10px', letterSpacing: '0.07em' }}
                aria-hidden="true"
              >
                {groupLabels[group]}
              </p>
              <div className="space-y-0.5">
                {groupNavItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    aria-label={`${item.label}${item.badge ? `, ${item.badge} notificações` : ''}`}
                    className={({ isActive }) =>
                      isActive ? 'nav-item-active flex items-center justify-between w-full' :
                                 'nav-item flex items-center justify-between w-full'
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="flex items-center gap-3">
                          <span aria-hidden="true" style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white flex-shrink-0"
                            style={{ background: 'var(--color-error)' }}
                            aria-label={`${item.badge} notificações`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ─── User profile ─── */}
      <div
        className="p-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        {/* User card */}
        <div
          className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors"
          style={{ borderRadius: 'var(--radius-md)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-alt)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          role="button"
          tabIndex={0}
          aria-label="Perfil do usuário"
        >
          {/* Avatar — Foursys gradient */}
          <div
            className="flex-shrink-0 flex items-center justify-center font-semibold text-white"
            style={{
              width: 'var(--avatar-md)',
              height: 'var(--avatar-md)',
              borderRadius: 'var(--radius-full)',
              background: user?.role === 'GUARDIAN_1'
                ? 'var(--foursys-gradient)'
                : 'linear-gradient(135deg, #DB2777 0%, #9A1BFF 100%)',
              fontSize: 'var(--text-sm)',
              boxShadow: '0 2px 6px rgba(124,58,237,0.25)',
            }}
            aria-hidden="true"
          >
            {user?.fullName?.charAt(0) ?? 'U'}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {user?.fullName}
            </p>
            <p className="text-caption truncate">
              {user?.role === 'GUARDIAN_1' ? 'Responsável 1' : 'Responsável 2'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full mt-1 text-left px-3 py-2 rounded-md text-sm transition-colors"
          style={{ color: 'var(--color-text-tertiary)', borderRadius: 'var(--radius-md)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--color-error)'
            ;(e.currentTarget as HTMLElement).style.background = 'var(--color-cancelado-bg)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--color-text-tertiary)'
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
          aria-label="Sair da conta"
        >
          Sair da conta
        </button>
      </div>
    </div>
  )
}
