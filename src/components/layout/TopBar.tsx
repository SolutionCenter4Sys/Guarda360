import { Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocation } from 'react-router-dom'
import { NotificationBell } from '../ui/NotificationBell'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/children':  'Meus Filhos',
  '/calendar':  'Calendário de Convivência',
  '/chat':      'Comunicação Monitorada',
  '/financial': 'Gestão Financeira',
  '/incidents': 'Ocorrências e Incidentes',
  '/reports':   'Relatórios Jurídicos',
}

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user } = useAuth()
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] ?? 'Guarda360°'

  return (
    <header
      className="flex items-center justify-between px-4 flex-shrink-0"
      style={{
        height: '64px',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-soft)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
      }}
      role="banner"
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden btn-ghost p-0 w-9 h-9 rounded-lg"
          aria-label="Abrir menu de navegação"
          aria-expanded="false"
          aria-controls="sidebar"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        {/* Page title — DS: text-h4 */}
        <h1
          className="text-h4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications — dropdown funcional */}
        <NotificationBell />

        {/* User Avatar — DS: guardian color + Foursys touch */}
        <div
          className="flex items-center justify-center font-semibold text-white cursor-pointer"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            background: user?.role === 'GUARDIAN_1'
              ? 'var(--foursys-gradient)'
              : 'linear-gradient(135deg, #DB2777 0%, #9A1BFF 100%)',
            fontSize: 'var(--text-sm)',
            boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
          }}
          aria-label={`Perfil de ${user?.fullName}`}
          role="button"
          tabIndex={0}
        >
          {user?.fullName?.charAt(0) ?? 'U'}
        </div>
      </div>
    </header>
  )
}
