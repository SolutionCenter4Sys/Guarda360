/**
 * Centralised token-aware style maps for recurring status/type visual patterns.
 * Eliminates duplicated inline style objects across CalendarPage, IncidentsPage,
 * FinancialPage and HealthPage (DRY principle).
 *
 * All values reference CSS custom properties from the Foursys Design System
 * (defined in src/index.css) so dark-mode overrides apply automatically.
 */

export interface StatusStyle {
  color:  string
  bg:     string
  label:  string
}

/** Calendar event / visit statuses */
export const CALENDAR_STATUS_STYLES: Record<string, StatusStyle> = {
  CONFIRMADO: {
    color: 'var(--color-confirmado)',
    bg:    'var(--color-confirmado-bg)',
    label: 'Confirmado',
  },
  PENDENTE: {
    color: 'var(--color-pendente)',
    bg:    'var(--color-pendente-bg)',
    label: 'Pendente',
  },
  FALTA: {
    color: 'var(--color-cancelado)',
    bg:    'var(--color-cancelado-bg)',
    label: 'Falta',
  },
  CANCELADO: {
    color: 'var(--color-cancelado)',
    bg:    'var(--color-cancelado-bg)',
    label: 'Cancelado',
  },
  ATRASO: {
    color: '#D97706',
    bg:    'rgba(217,119,6,0.08)',
    label: 'Com atraso',
  },
}

/** Alimony / financial payment statuses */
export const PAYMENT_STATUS_STYLES: Record<string, StatusStyle> = {
  PAGO: {
    color: 'var(--color-confirmado)',
    bg:    'var(--color-confirmado-bg)',
    label: 'Pago',
  },
  PENDENTE: {
    color: 'var(--color-pendente)',
    bg:    'var(--color-pendente-bg)',
    label: 'Pendente',
  },
  ATRASADO: {
    color: 'var(--color-cancelado)',
    bg:    'var(--color-cancelado-bg)',
    label: 'Atrasado',
  },
  PARCIAL: {
    color: 'var(--color-pendente)',
    bg:    'var(--color-pendente-bg)',
    label: 'Parcial',
  },
}

/** Incident severity levels */
export const SEVERITY_STYLES: Record<string, StatusStyle> = {
  BAIXA: {
    color: 'var(--color-confirmado)',
    bg:    'var(--color-confirmado-bg)',
    label: 'Baixa',
  },
  MEDIA: {
    color: 'var(--color-pendente)',
    bg:    'var(--color-pendente-bg)',
    label: 'Média',
  },
  ALTA: {
    color: '#D97706',
    bg:    'rgba(217,119,6,0.08)',
    label: 'Alta',
  },
  CRITICA: {
    color: 'var(--color-cancelado)',
    bg:    'var(--color-cancelado-bg)',
    label: 'Crítica',
  },
}

/** Medical appointment statuses */
export const APPOINTMENT_STATUS_STYLES: Record<string, StatusStyle> = {
  AGENDADO: {
    color: 'var(--color-pendente)',
    bg:    'var(--color-pendente-bg)',
    label: 'Agendado',
  },
  REALIZADO: {
    color: 'var(--color-confirmado)',
    bg:    'var(--color-confirmado-bg)',
    label: 'Realizado',
  },
  CANCELADO: {
    color: 'var(--color-cancelado)',
    bg:    'var(--color-cancelado-bg)',
    label: 'Cancelado',
  },
}

/** Returns a fallback style when the key is not found */
export function getStatusStyle(
  map: Record<string, StatusStyle>,
  key: string,
): StatusStyle {
  return map[key] ?? {
    color: 'var(--color-text-secondary)',
    bg:    'var(--color-surface-alt)',
    label: key,
  }
}
