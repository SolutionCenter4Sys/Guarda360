/**
 * HistoryPanel — Painel de Histórico de Convivência (F-02.09)
 *
 * Extracted from CalendarPage to enforce SRP:
 * CalendarPage handles navigation/events, HistoryPanel handles history display.
 * Receives all data and callbacks via props — zero internal business logic.
 */
import { format, parseISO } from 'date-fns'
import {
  History, BarChart2, Shield,
  CheckCircle, AlertTriangle, Clock, Ban,
} from 'lucide-react'
import type { CalendarEvent } from '../../types'
import type { HistoryPeriod, HistoryTypeFilter, CalendarHistoryStats } from '../../hooks/useCalendarHistory'

interface StatusConfig {
  label: string
  color: string
  bg:    string
  icon:  React.ReactNode
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  CONFIRMADO: { label: 'Confirmado', color: 'var(--color-confirmado)', bg: 'var(--color-confirmado-bg)', icon: <CheckCircle  size={13} aria-hidden="true" /> },
  PENDENTE:   { label: 'Pendente',   color: 'var(--color-pendente)',   bg: 'var(--color-pendente-bg)',   icon: <Clock         size={13} aria-hidden="true" /> },
  FALTA:      { label: 'Falta',      color: 'var(--color-cancelado)',  bg: 'var(--color-cancelado-bg)',  icon: <AlertTriangle size={13} aria-hidden="true" /> },
  CANCELADO:  { label: 'Cancelado',  color: 'var(--color-cancelado)',  bg: 'var(--color-cancelado-bg)',  icon: <Ban           size={13} aria-hidden="true" /> },
  ATRASO:     { label: 'Com atraso', color: '#D97706',                 bg: 'rgba(217,119,6,0.08)',       icon: <Clock         size={13} aria-hidden="true" /> },
}

const PERIOD_OPTIONS: { val: HistoryPeriod; label: string }[] = [
  { val: '1M',  label: '1 mês'   },
  { val: '3M',  label: '3 meses' },
  { val: '6M',  label: '6 meses' },
  { val: '12M', label: '12 meses' },
]

const TYPE_OPTIONS: { val: HistoryTypeFilter; label: string }[] = [
  { val: 'ALL',         label: 'Todos'         },
  { val: 'VISITA',      label: 'Visitas'        },
  { val: 'CONVIVENCIA', label: 'Convivência'    },
  { val: 'FALTA',       label: 'Faltas/Cancel.' },
]

interface HistoryPanelProps {
  stats:          CalendarHistoryStats
  events:         CalendarEvent[]
  period:         HistoryPeriod
  typeFilter:     HistoryTypeFilter
  onPeriodChange: (p: HistoryPeriod)     => void
  onTypeChange:   (t: HistoryTypeFilter) => void
}

function FilterChip<T extends string>({
  value,
  active,
  label,
  onClick,
}: {
  value: T
  active: boolean
  label: string
  onClick: (v: T) => void
}) {
  return (
    <button
      onClick={() => onClick(value)}
      className="text-xs font-bold px-3 py-1 rounded-full transition-all"
      style={{
        background: active ? 'var(--color-primary)' : 'var(--color-border)',
        color:      active ? '#fff' : 'var(--color-text-secondary)',
      }}
    >
      {label}
    </button>
  )
}

function ComplianceBar({ compliance }: { compliance: number }) {
  const color =
    compliance >= 75 ? 'var(--color-confirmado)' :
    compliance >= 50 ? 'linear-gradient(90deg, var(--color-pendente), var(--color-confirmado))' :
                       'var(--color-cancelado)'

  return (
    <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
          Taxa de cumprimento
        </span>
        <span className="text-xs font-extrabold" style={{ color: compliance >= 75 ? 'var(--color-confirmado)' : compliance >= 50 ? 'var(--color-pendente)' : 'var(--color-cancelado)' }}>
          {compliance}%
        </span>
      </div>
      <div
        className="h-2.5 rounded-full overflow-hidden"
        style={{ background: 'var(--color-border)' }}
        role="progressbar"
        aria-valuenow={compliance}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Taxa de cumprimento: ${compliance}%`}
      >
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${compliance}%`, background: color }} />
      </div>
    </div>
  )
}

function EventRow({ evt }: { evt: CalendarEvent }) {
  const conf = STATUS_CONFIGS[evt.status] ?? {
    label: evt.status, color: 'var(--color-text-secondary)', bg: 'var(--color-border)', icon: null,
  }

  return (
    <div
      className="flex items-center gap-4 px-5 py-3"
      style={{ borderLeft: `4px solid ${conf.color}` }}
    >
      <div className="min-w-[80px] text-center">
        <p className="text-sm font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
          {format(parseISO(evt.startAt), 'dd/MM')}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {format(parseISO(evt.startAt), 'yyyy')}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {evt.title}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {evt.type === 'VISITA' ? 'Visita presencial' : 'Convivência'}
          {' · '}{format(parseISO(evt.startAt), 'HH:mm')} — {format(parseISO(evt.endAt), 'HH:mm')}
        </p>
      </div>

      <div
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
        style={{ background: conf.bg, color: conf.color }}
      >
        {conf.icon}
        {conf.label}
      </div>
    </div>
  )
}

export function HistoryPanel({
  stats, events, period, typeFilter, onPeriodChange, onTypeChange,
}: HistoryPanelProps) {
  const statsChips = [
    { label: `${stats.compliance}% cumprimento`, bg: 'rgba(255,255,255,0.2)' },
    { label: `${stats.confirmado} confirmadas`,  bg: 'rgba(22,163,74,0.25)' },
    { label: `${stats.falta} faltas`,            bg: 'rgba(220,38,38,0.25)' },
    { label: `${stats.atraso} atrasos`,          bg: 'rgba(217,119,6,0.25)' },
  ]

  return (
    <div className="card overflow-hidden fade-in">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'var(--foursys-gradient)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.18)' }}
            aria-hidden="true"
          >
            <History size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Histórico de Convivência</h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {stats.total} registros · Insumo para relatório jurídico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {statsChips.map(s => (
            <span key={s.label} className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: s.bg }}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-3 px-5 py-3 flex-wrap"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-alt)' }}
        role="group"
        aria-label="Filtros do histórico"
      >
        <BarChart2 size={14} style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Período:</span>
        {PERIOD_OPTIONS.map(opt => (
          <FilterChip key={opt.val} value={opt.val} active={period === opt.val} label={opt.label} onClick={onPeriodChange} />
        ))}

        <div className="w-px h-4 bg-[var(--color-border)]" aria-hidden="true" />

        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Tipo:</span>
        {TYPE_OPTIONS.map(opt => (
          <FilterChip key={opt.val} value={opt.val} active={typeFilter === opt.val} label={opt.label} onClick={onTypeChange} />
        ))}

        <span className="ml-auto text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {events.length} evento(s)
        </span>
      </div>

      <ComplianceBar compliance={stats.compliance} />

      {/* Event list */}
      <div className="divide-y" style={{ '--tw-divide-color': 'var(--color-border)' } as React.CSSProperties}>
        {events.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <History size={28} className="mx-auto mb-2" style={{ color: 'var(--color-text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Nenhum registro encontrado para os filtros selecionados.
            </p>
          </div>
        ) : (
          events.map(evt => <EventRow key={evt.id} evt={evt} />)
        )}
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-alt)' }}
      >
        <Shield size={12} style={{ color: 'var(--color-primary)', flexShrink: 0 }} aria-hidden="true" />
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          Dados históricos imutáveis. Este histórico é insumo para geração de relatório jurídico
          em Relatórios → Convivência.
        </p>
      </div>
    </div>
  )
}
