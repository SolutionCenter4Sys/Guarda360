import { clsx } from 'clsx'
import type { ReactNode } from 'react'

/* ══════════════════════════════════════════════
   Card — Guarda360° DS v1.0
   surface + border + shadow-card
   Hover: shadow-hover + translateY(-1px) — DS spec
   ══════════════════════════════════════════════ */
interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function Card({ children, className, onClick, hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        'card',
        hover && 'card-hover',
        onClick && 'cursor-pointer card-hover',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      {children}
    </div>
  )
}

/* ══════════════════════════════════════════════
   KpiCard / MetricCard — DS spec
   font-hero (48px extrabold) para KPI numbers
   DS: MetricCard border primary-border (sutil), shadow-card
   ══════════════════════════════════════════════ */
interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: { direction: 'up' | 'down'; label: string }
  icon?: ReactNode
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
  className?: string
  large?: boolean  /* hero size: 48px extrabold */
}

const colorVars: Record<string, { iconBg: string; valueColor: string; borderColor: string }> = {
  blue:   { iconBg: 'rgba(29,78,216,0.08)',   valueColor: 'var(--color-primary)',           borderColor: 'rgba(29,78,216,0.15)' },
  green:  { iconBg: 'rgba(22,163,74,0.08)',   valueColor: 'var(--color-severity-low)',      borderColor: 'rgba(22,163,74,0.15)' },
  amber:  { iconBg: 'rgba(217,119,6,0.08)',   valueColor: 'var(--color-severity-medium)',   borderColor: 'rgba(217,119,6,0.15)' },
  red:    { iconBg: 'rgba(220,38,38,0.08)',   valueColor: 'var(--color-severity-high)',     borderColor: 'rgba(220,38,38,0.15)' },
  purple: { iconBg: 'rgba(124,58,237,0.08)',  valueColor: 'var(--color-severity-critical)', borderColor: 'rgba(124,58,237,0.15)' },
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'blue',
  className,
  large = false,
}: KpiCardProps) {
  const c = colorVars[color]

  return (
    <div
      className={clsx('metric-card flex items-start gap-4', className)}
      style={{ borderColor: c.borderColor }}
    >
      {icon && (
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: c.iconBg }}
          aria-hidden="true"
        >
          <span style={{ color: c.valueColor }}>{icon}</span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        {/* Label — DS: text-label uppercase */}
        <p className="text-label" style={{ color: 'var(--color-text-tertiary)' }}>
          {title}
        </p>

        {/* Value — DS: font-hero (48px extrabold) ou text-3xl */}
        <p
          className={clsx('mt-0.5', large ? 'text-hero' : 'text-h2')}
          style={{ color: c.valueColor }}
        >
          {value}
        </p>

        {subtitle && (
          <p className="text-caption mt-0.5">{subtitle}</p>
        )}

        {trend && (
          <p className={clsx(
            'text-caption mt-1 font-medium',
            trend.direction === 'up' ? 'text-success' : 'text-error'
          )}>
            {trend.direction === 'up' ? '▲' : '▼'} {trend.label}
          </p>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   SectionHeader — Título de seção padrão DS
   ══════════════════════════════════════════════ */
interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={clsx('flex items-start justify-between gap-4', className)}>
      <div>
        <h2 className="text-h4" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-caption mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
