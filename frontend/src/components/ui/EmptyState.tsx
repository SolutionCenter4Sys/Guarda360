import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'gradient'
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-16 px-6"
      role="status"
      aria-label={title}
    >
      {icon && (
        <div
          className="mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-tertiary)' }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3
        className="text-base font-semibold mb-1"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm max-w-xs mb-6"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={action.variant === 'gradient' ? 'btn-gradient' : 'btn-primary'}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
