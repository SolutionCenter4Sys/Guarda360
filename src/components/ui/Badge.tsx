import { clsx } from 'clsx'
import { Shield, ShieldAlert } from 'lucide-react'
import type { AttendanceStatus, IncidentSeverity } from '../../types'

/* ══════════════════════════════════════════════
   StatusBadge — Guarda360° DS v1.0
   radius-full · uppercase · semibold · letter-spacing 0.04em
   CONFIRMADO: pulse dot animado
   ══════════════════════════════════════════════ */
interface StatusBadgeProps {
  status: AttendanceStatus
  className?: string
}

const statusConfig: Record<AttendanceStatus, { label: string; cls: string; pulse?: boolean }> = {
  CONFIRMADO: {
    label: 'Confirmado',
    cls: 'badge badge-confirmado',
    pulse: true,
  },
  PENDENTE: {
    label: 'Pendente',
    cls: 'badge badge-pendente',
  },
  CANCELADO: {
    label: 'Cancelado',
    cls: 'badge badge-cancelado',
  },
  FALTA: {
    label: 'Falta',
    cls: 'badge badge-falta',
  },
  ATRASO: {
    label: 'Atraso',
    cls: 'badge badge-atraso',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span className={clsx(config.cls, className)}>
      {/* Pulse dot animado para CONFIRMADO — DS spec */}
      {config.pulse && (
        <span
          className="pulse inline-block w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  )
}

/* ══════════════════════════════════════════════
   SeverityBadge — Guarda360° DS v1.0
   radius-full · uppercase · bold · letter-spacing 0.04em
   ══════════════════════════════════════════════ */
interface SeverityBadgeProps {
  severity: IncidentSeverity
  className?: string
}

const severityConfig: Record<IncidentSeverity, { label: string; cls: string }> = {
  LOW:      { label: 'Baixa',   cls: 'badge badge-low'      },
  MEDIUM:   { label: 'Média',   cls: 'badge badge-medium'   },
  HIGH:     { label: 'Alta',    cls: 'badge badge-high'      },
  CRITICAL: { label: 'Crítica', cls: 'badge badge-critical'  },
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity]
  return (
    <span className={clsx(config.cls, className)}>
      {config.label}
    </span>
  )
}

/* ══════════════════════════════════════════════
   HashBadge — Guarda360° DS v1.0
   font-mono · sky color · shadow-hash ring
   Ícone: Shield (verificado) | ShieldAlert (inválido)
   Exibe primeiros 8 chars do hash truncado
   ══════════════════════════════════════════════ */
interface HashBadgeProps {
  hash: string
  invalid?: boolean
  className?: string
}

export function HashBadge({ hash, invalid = false, className }: HashBadgeProps) {
  // DS spec: exibir primeiros 8 chars após "sha256:" (se presente)
  const raw = hash.startsWith('sha256:') ? hash.slice(7) : hash
  const truncated = raw.substring(0, 8) + '…'

  return (
    <span
      className={clsx('badge-hash', invalid && 'text-error bg-red-50', className)}
      title={`Hash SHA-256: ${hash}`}
      aria-label={`Integridade verificada: ${truncated}`}
    >
      {invalid
        ? <ShieldAlert size={12} className="flex-shrink-0" aria-hidden="true" />
        : <Shield size={12} className="flex-shrink-0" aria-hidden="true" />
      }
      {truncated}
    </span>
  )
}

/* ══════════════════════════════════════════════
   PaymentStatusBadge — Financeiro
   ══════════════════════════════════════════════ */
interface PaymentBadgeProps {
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO' | 'PARCIAL'
  className?: string
}

const paymentConfig: Record<string, { label: string; cls: string }> = {
  PAGO:     { label: 'Pago',    cls: 'badge badge-confirmado' },
  PENDENTE: { label: 'Pendente',cls: 'badge badge-pendente'   },
  ATRASADO: { label: 'Atrasado',cls: 'badge badge-cancelado'  },
  PARCIAL:  { label: 'Parcial', cls: 'badge badge-pendente'   },
}

export function PaymentBadge({ status, className }: PaymentBadgeProps) {
  const config = paymentConfig[status] ?? paymentConfig['PENDENTE']
  return <span className={clsx(config.cls, className)}>{config.label}</span>
}

/* ══════════════════════════════════════════════
   GuardianBadge — Calendário
   ══════════════════════════════════════════════ */
interface GuardianBadgeProps {
  role: 'GUARDIAN_1' | 'GUARDIAN_2' | 'SHARED'
  className?: string
}

export function GuardianBadge({ role, className }: GuardianBadgeProps) {
  const config = {
    GUARDIAN_1: { label: 'Guardião A', style: { color: 'var(--color-guardian-a)', background: 'var(--color-guardian-a-bg)', borderColor: 'var(--color-guardian-a-border)' } },
    GUARDIAN_2: { label: 'Guardião B', style: { color: 'var(--color-guardian-b)', background: 'var(--color-guardian-b-bg)', borderColor: 'var(--color-guardian-b-border)' } },
    SHARED:     { label: 'Compartilhado', style: { color: 'var(--color-guardian-shared)', background: 'var(--color-guardian-shared-bg)', borderColor: 'rgba(124,58,237,0.30)' } },
  }[role]

  return (
    <span
      className={clsx('badge border', className)}
      style={config.style}
    >
      {config.label}
    </span>
  )
}
