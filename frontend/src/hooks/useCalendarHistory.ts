import { useState, useMemo } from 'react'
import { subMonths } from 'date-fns'
import type { CalendarEvent } from '../types'

export type HistoryPeriod = '1M' | '3M' | '6M' | '12M'
export type HistoryTypeFilter = 'ALL' | 'VISITA' | 'CONVIVENCIA' | 'FALTA'

export interface CalendarHistoryStats {
  total: number
  confirmado: number
  falta: number
  atraso: number
  cancelado: number
  compliance: number
}

/** Cycle of statuses used to simulate realistic historical data */
const STATUS_CYCLE: CalendarEvent['status'][] = [
  'CONFIRMADO', 'CONFIRMADO', 'CONFIRMADO', 'FALTA',
  'CONFIRMADO', 'ATRASO', 'CANCELADO', 'CONFIRMADO',
]

const MONTHS_BY_PERIOD: Record<HistoryPeriod, number> = {
  '1M': 1, '3M': 3, '6M': 6, '12M': 12,
}

/**
 * Generates simulated past events for the given child and period.
 * Pure function — no side effects, deterministic output for a given input.
 */
function buildPastEvents(childId: string, period: HistoryPeriod): CalendarEvent[] {
  const monthsBack = MONTHS_BY_PERIOD[period]
  const events: CalendarEvent[] = []

  for (let mo = 1; mo <= monthsBack; mo++) {
    const d  = subMonths(new Date(), mo)
    const pm = d.getMonth()
    const py = d.getFullYear()

    for (let wk = 0; wk < 4; wk++) {
      const day    = Math.min(wk * 7 + 7, 28)
      const status = STATUS_CYCLE[(mo * 4 + wk) % STATUS_CYCLE.length]

      events.push({
        id: `hist-${mo}-${wk}`,
        childId,
        type:              wk % 2 === 0 ? 'VISITA' : 'CONVIVENCIA',
        startAt:           new Date(py, pm, day, 8, 0).toISOString(),
        endAt:             new Date(py, pm, day, 18, 0).toISOString(),
        responsibleUserId: 'user-2',
        guardianRole:      'GUARDIAN_2',
        status,
        title:             wk % 2 === 0 ? 'Visita — João Pereira' : 'Convivência — João Pereira',
        isRecurring:       true,
      })
    }
  }

  return events.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
}

function computeStats(events: CalendarEvent[]): CalendarHistoryStats {
  const total      = events.length || 1
  const confirmado = events.filter(e => e.status === 'CONFIRMADO').length
  const falta      = events.filter(e => e.status === 'FALTA').length
  const atraso     = events.filter(e => e.status === 'ATRASO').length
  const cancelado  = events.filter(e => e.status === 'CANCELADO').length

  return {
    total: events.length,
    confirmado,
    falta,
    atraso,
    cancelado,
    compliance: Math.round((confirmado / total) * 100),
  }
}

/**
 * Encapsulates all state and derived data for the Convivência history panel (F-02.09).
 * Separates history business logic from the CalendarPage presentation layer (SRP).
 */
export function useCalendarHistory(selectedChild: string) {
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [period, setPeriod]       = useState<HistoryPeriod>('3M')
  const [typeFilter, setTypeFilter] = useState<HistoryTypeFilter>('ALL')

  const pastEvents = useMemo(
    () => buildPastEvents(selectedChild, period),
    [selectedChild, period],
  )

  const filteredHistory = useMemo(() => {
    if (typeFilter === 'ALL')    return pastEvents
    if (typeFilter === 'FALTA')  return pastEvents.filter(e => e.status === 'FALTA' || e.status === 'CANCELADO')
    return pastEvents.filter(e => e.type === typeFilter)
  }, [pastEvents, typeFilter])

  const stats = useMemo(() => computeStats(pastEvents), [pastEvents])

  return {
    showHistoryPanel,
    setShowHistoryPanel,
    period,
    setPeriod,
    typeFilter,
    setTypeFilter,
    filteredHistory,
    stats,
  }
}
