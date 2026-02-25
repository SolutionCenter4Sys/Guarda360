import { useState } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin,
  RotateCcw, CheckCircle, AlertTriangle, Calendar, Shield,
  ArrowLeftRight, Check, Ban, LogIn, LogOut, Star, RefreshCw,
  Download, Repeat, Info, Trash2, History,
} from 'lucide-react'
import { mockCalendarEvents, mockChildren, mockSwapRequests, mockSpecialDates, mockRecurrenceConfigs } from '../mocks'
import { useToast } from '../context/ToastContext'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, parseISO, addMonths, subMonths, getDay, isToday,
  isWithinInterval,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { CalendarEvent, SwapRequest, SpecialDate, RecurrenceConfig } from '../types'
import { StatusBadge, GuardianBadge } from '../components/ui/Badge'
import { useCalendarHistory } from '../hooks/useCalendarHistory'
import { HistoryPanel } from '../components/calendar/HistoryPanel'

/* ─── DS guardian map ─── */
const GS = {
  GUARDIAN_1: { bg: 'var(--color-guardian-a-bg)', border: 'var(--color-guardian-a)', text: 'var(--color-guardian-a)', label: 'Guardião A' },
  GUARDIAN_2: { bg: 'var(--color-guardian-b-bg)', border: 'var(--color-guardian-b)', text: 'var(--color-guardian-b)', label: 'Guardião B' },
  SHARED:     { bg: 'rgba(124,58,237,0.06)',       border: 'var(--color-guardian-shared)', text: 'var(--color-guardian-shared)', label: 'Compartilhado' },
}

const eventAccent = (evt: CalendarEvent): string => {
  if (evt.status === 'FALTA' || evt.status === 'CANCELADO') return 'var(--color-cancelado)'
  if (evt.status === 'ATRASO') return 'var(--color-atraso)'
  if (evt.status === 'CONFIRMADO') return 'var(--color-confirmado)'
  return GS[evt.guardianRole]?.border ?? 'var(--color-text-tertiary)'
}

/* ─── Compliance donut ─── */
function ComplianceDonut({ pct }: { pct: number }) {
  const r = 28, circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const color = pct >= 75 ? 'var(--color-confirmado)' : pct >= 50 ? 'var(--color-pendente)' : 'var(--color-cancelado)'
  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }} aria-hidden="true">
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-border)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-sm font-extrabold leading-none" style={{ color }}>{pct}%</span>
      </div>
    </div>
  )
}

/* ─── Event pill for cell ─── */
function EventPill({ evt, selected }: { evt: CalendarEvent; selected: boolean }) {
  const color = eventAccent(evt)
  return (
    <div
      className="w-full rounded text-xs font-semibold px-1 truncate leading-5"
      style={{
        background: selected ? 'rgba(255,255,255,0.2)' : `color-mix(in srgb, ${color} 15%, transparent)`,
        color: selected ? '#fff' : color,
        borderLeft: `2px solid ${selected ? 'rgba(255,255,255,0.7)' : color}`,
      }}
      aria-hidden="true"
    >
      {format(parseISO(evt.startAt), 'HH:mm')} {evt.title.split('—')[0].trim()}
    </div>
  )
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate]   = useState(new Date())
  const [selectedDay, setSelectedDay]   = useState<Date | null>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showNewModal, setShowNewModal]           = useState(false)
  const [showSwapModal, setShowSwapModal]         = useState(false)
  const [showSwapListModal, setShowSwapListModal] = useState(false)
  const [showSpecialDatesModal, setShowSpecialDatesModal] = useState(false)
  const [showRecurrenceModal, setShowRecurrenceModal]     = useState(false)
  const [swapRequests, setSwapRequests]   = useState<SwapRequest[]>(mockSwapRequests)
  const [specialDates, setSpecialDates]   = useState<SpecialDate[]>(mockSpecialDates)
  const [recurrenceConfigs, setRecurrenceConfigs] = useState<RecurrenceConfig[]>(mockRecurrenceConfigs)
  const [selectedChild, setSelectedChild] = useState(mockChildren[0].id)
  // Check-in/out state keyed by event id
  const [checkIns, setCheckIns]   = useState<Record<string, string>>({})
  const [checkOuts, setCheckOuts] = useState<Record<string, string>>({})
  const { toast } = useToast()

  /* ─── F-02.09: History panel — logic delegated to custom hook (SRP) ─── */
  const {
    showHistoryPanel, setShowHistoryPanel,
    period: historyPeriod, setPeriod: setHistoryPeriod,
    typeFilter: historyTypeFilter, setTypeFilter: setHistoryTypeFilter,
    filteredHistory, stats: historyStats,
  } = useCalendarHistory(selectedChild)

  const pendingSwaps = swapRequests.filter(s => s.status === 'PENDENTE').length

  const handleCheckIn = (eventId: string) => {
    const ts = new Date().toISOString()
    setCheckIns(prev => ({ ...prev, [eventId]: ts }))
    toast('Check-in registrado com sucesso!', 'success')
  }

  const handleCheckOut = (eventId: string) => {
    const ts = new Date().toISOString()
    setCheckOuts(prev => ({ ...prev, [eventId]: ts }))
    toast('Check-out registrado com sucesso!', 'success')
  }

  const getSpecialDatesForDay = (day: Date): SpecialDate[] =>
    specialDates.filter(sd => {
      try {
        return isWithinInterval(day, { start: parseISO(sd.startDate), end: parseISO(sd.endDate) })
      } catch { return false }
    })

  const exportIcal = () => {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Guarda360//Calendário//PT-BR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ]
    filteredEvents.forEach(evt => {
      const dtStart = parseISO(evt.startAt)
      const dtEnd   = parseISO(evt.endAt)
      const fmt     = (d: Date) => format(d, "yyyyMMdd'T'HHmmss")
      lines.push(
        'BEGIN:VEVENT',
        `UID:${evt.id}@guarda360`,
        `DTSTART:${fmt(dtStart)}`,
        `DTEND:${fmt(dtEnd)}`,
        `SUMMARY:${evt.title}`,
        evt.location ? `LOCATION:${evt.location}` : '',
        `STATUS:${evt.status === 'CONFIRMADO' ? 'CONFIRMED' : 'TENTATIVE'}`,
        'END:VEVENT',
      ).filter(Boolean)
    })
    specialDates.filter(sd => sd.childIds.includes(selectedChild)).forEach(sd => {
      lines.push(
        'BEGIN:VEVENT',
        `UID:${sd.id}@guarda360-special`,
        `DTSTART;VALUE=DATE:${sd.startDate.replace(/-/g,'')}`,
        `DTEND;VALUE=DATE:${sd.endDate.replace(/-/g,'')}`,
        `SUMMARY:${sd.title}`,
        sd.notes ? `DESCRIPTION:${sd.notes}` : '',
        'END:VEVENT',
      ).filter(Boolean)
    })
    lines.push('END:VCALENDAR')
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'guarda360-calendario.ics'; a.click()
    URL.revokeObjectURL(url)
    toast('Calendário exportado (.ics)', 'success')
  }

  const monthStart  = startOfMonth(currentDate)
  const monthEnd    = endOfMonth(currentDate)
  const days        = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad    = getDay(monthStart)
  const paddedDays: (Date | null)[] = [...Array(startPad).fill(null), ...days]

  const filteredEvents = mockCalendarEvents.filter(e => e.childId === selectedChild)
  const getEventsForDay = (day: Date) =>
    filteredEvents.filter(e => { try { return isSameDay(parseISO(e.startAt), day) } catch { return false } })

  const dayEvents   = selectedDay ? getEventsForDay(selectedDay) : []
  const total       = filteredEvents.length || 1
  const cumpridas   = filteredEvents.filter(e => e.status === 'CONFIRMADO').length
  const pendentes   = filteredEvents.filter(e => e.status === 'PENDENTE').length
  const faltas      = filteredEvents.filter(e => e.status === 'FALTA').length
  const compliance  = Math.round((cumpridas / total) * 100)

  const selectedChild_obj = mockChildren.find(c => c.id === selectedChild)

  return (
    <div className="max-w-6xl mx-auto space-y-4" style={{ minHeight: '100%' }}>

      {/* ══════════ HERO HEADER ══════════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--foursys-gradient)',
          boxShadow: '0 6px 24px rgba(124,58,237,0.28)',
        }}
      >
        {/* Top strip: child tabs + actions */}
        <div
          className="flex items-center justify-between gap-4 px-5 pt-4 pb-3 flex-wrap"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}
        >
          {/* Child pills */}
          <div className="flex items-center gap-2 flex-wrap" role="tablist" aria-label="Selecionar filho">
            {mockChildren.map(c => {
              const active = c.id === selectedChild
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedChild(c.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
                  style={{
                    background: active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    border: active ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid transparent',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                    style={{ background: 'rgba(255,255,255,0.25)' }}
                    aria-hidden="true"
                  >
                    {c.fullName.charAt(0)}
                  </span>
                  {c.fullName.split(' ')[0]}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowSwapListModal(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)' }}
              aria-label="Solicitações de troca"
            >
              <ArrowLeftRight size={14} aria-hidden="true" />
              Trocas
              {pendingSwaps > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center" style={{ background: 'var(--color-cancelado)', color: '#fff' }}>
                  {pendingSwaps}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowHistoryPanel(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                background: showHistoryPanel ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.12)',
                color: '#fff',
                border: showHistoryPanel ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.25)',
              }}
              aria-label="Histórico de convivência"
              aria-pressed={showHistoryPanel}
            >
              <History size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Histórico</span>
            </button>
            <button
              onClick={() => setShowSpecialDatesModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)' }}
              aria-label="Datas especiais"
            >
              <Star size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Especiais</span>
            </button>
            <button
              onClick={() => setShowRecurrenceModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)' }}
              aria-label="Configurar recorrência"
            >
              <Repeat size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Recorrência</span>
            </button>
            <button
              onClick={exportIcal}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)' }}
              aria-label="Exportar calendário"
            >
              <Download size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(4px)' }}
            >
              <Plus size={15} aria-hidden="true" />
              Novo evento
            </button>
          </div>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => setCurrentDate(d => subMonths(d, 1))}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            aria-label="Mês anterior"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-extrabold capitalize text-white tracking-tight">
              {format(currentDate, 'MMMM', { locale: ptBR })}
            </h2>
            <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {format(currentDate, 'yyyy')}
            </p>
          </div>

          <button
            onClick={() => setCurrentDate(d => addMonths(d, 1))}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            aria-label="Próximo mês"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ══════════ LEGEND ══════════ */}
      <div className="flex flex-wrap gap-2" role="legend" aria-label="Legenda de cores">
        {[
          { color: 'var(--color-guardian-a)',      bg: 'var(--color-guardian-a-bg)',      label: 'Guardião A' },
          { color: 'var(--color-guardian-b)',      bg: 'var(--color-guardian-b-bg)',      label: 'Guardião B' },
          { color: 'var(--color-guardian-shared)', bg: 'rgba(124,58,237,0.08)',           label: 'Compartilhado' },
          { color: 'var(--color-confirmado)',      bg: 'var(--color-confirmado-bg)',      label: 'Confirmado' },
          { color: 'var(--color-cancelado)',       bg: 'var(--color-cancelado-bg)',       label: 'Falta' },
          { color: 'var(--color-atraso)',          bg: 'var(--color-pendente-bg)',        label: 'Atraso' },
        ].map(({ color, bg, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: bg, color }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />
            {label}
          </div>
        ))}
      </div>

      {/* ══════════ MAIN GRID ══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* ─── Calendar ─── */}
        <section
          className="lg:col-span-2 card overflow-hidden"
          style={{ padding: 0 }}
          aria-label="Calendário de convivência"
        >
          {/* Day-of-week headers */}
          <div
            className="grid grid-cols-7 text-center"
            style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-alt)' }}
            role="row"
            aria-label="Dias da semana"
          >
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
              <div
                key={d}
                className="py-2.5 text-xs font-bold uppercase tracking-widest"
                style={{ color: i === 0 || i === 6 ? 'var(--color-cancelado)' : 'var(--color-text-tertiary)' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div
            className="grid grid-cols-7"
            role="grid"
            aria-label="Dias do mês"
            style={{ padding: '4px' }}
          >
            {paddedDays.map((day, i) => {
              if (!day) return (
                <div
                  key={`pad-${i}`}
                  role="gridcell"
                  aria-hidden="true"
                  style={{ minHeight: 80, borderRadius: 10 }}
                />
              )

              const events      = getEventsForDay(day)
              const specials    = getSpecialDatesForDay(day)
              const isT         = isToday(day)
              const isSel       = selectedDay ? isSameDay(day, selectedDay) : false
              const isWeekend   = getDay(day) === 0 || getDay(day) === 6
              const hasEvents   = events.length > 0
              const hasSpecials = specials.length > 0

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => { setSelectedDay(day); setSelectedEvent(null) }}
                  role="gridcell"
                  aria-label={`${format(day, 'd')} de ${format(day, 'MMMM', { locale: ptBR })}, ${events.length} evento(s)`}
                  aria-pressed={isSel}
                  className="relative flex flex-col p-1.5 transition-all"
                  style={{
                    minHeight: 80,
                    borderRadius: 10,
                    margin: 2,
                    background: isSel
                      ? 'var(--foursys-gradient)'
                      : isT
                      ? 'rgba(29,78,216,0.07)'
                      : 'transparent',
                    boxShadow: isSel ? '0 4px 16px rgba(124,58,237,0.3)' : undefined,
                    outline: isT && !isSel ? '2px solid var(--color-primary)' : undefined,
                    outlineOffset: -2,
                  }}
                >
                  {/* Day number */}
                  <span
                    className="text-sm font-bold self-end w-7 h-7 flex items-center justify-center rounded-full"
                    style={{
                      color: isSel ? '#fff'
                           : isT   ? 'var(--color-primary)'
                           : isWeekend ? 'var(--color-text-tertiary)'
                           : 'var(--color-text-primary)',
                      background: isT && !isSel ? 'rgba(29,78,216,0.12)' : 'transparent',
                      fontWeight: isT ? 800 : 600,
                    }}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Special date indicator */}
                  {hasSpecials && (
                    <div className="absolute top-1 left-1.5">
                      <Star size={9} fill={isSel ? '#fff' : '#d97706'} stroke="none" aria-hidden="true" />
                    </div>
                  )}

                  {/* Event pills */}
                  <div className="flex flex-col gap-0.5 mt-0.5 w-full overflow-hidden">
                    {events.slice(0, 2).map(evt => (
                      <EventPill key={evt.id} evt={evt} selected={isSel} />
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs px-1 font-semibold" style={{ color: isSel ? 'rgba(255,255,255,0.7)' : 'var(--color-text-tertiary)' }}>
                        +{events.length - 2} mais
                      </div>
                    )}
                    {!hasEvents && isT && (
                      <div className="text-xs px-1 font-medium" style={{ color: 'var(--color-primary)' }}>
                        Hoje
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* ─── Day detail sidebar ─── */}
        <aside className="flex flex-col gap-4" aria-label="Detalhes do dia selecionado">

          {/* Date hero */}
          {selectedDay && (
            <div
              className="card p-4"
              style={{
                borderTop: '3px solid var(--color-primary)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>
                    {format(selectedDay, 'EEEE', { locale: ptBR })}
                  </p>
                  <p className="text-4xl font-extrabold leading-none mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                    {format(selectedDay, 'd')}
                  </p>
                  <p className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text-tertiary)' }}>
                    {format(selectedDay, 'MMMM yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Eventos</p>
                  <p
                    className="text-3xl font-extrabold"
                    style={{ color: dayEvents.length > 0 ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}
                  >
                    {dayEvents.length}
                  </p>
                </div>
              </div>

              {/* Events list or empty */}
              {dayEvents.length === 0 ? (
                <div
                  className="rounded-xl p-4 text-center"
                  style={{ background: 'var(--color-surface-alt)', border: '1px dashed var(--color-border-dark)' }}
                >
                  <Calendar size={24} className="mx-auto mb-2" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Nenhum evento</p>
                  <button
                    onClick={() => setShowNewModal(true)}
                    className="mt-2 text-sm font-semibold"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    + Adicionar evento
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {dayEvents.map(evt => {
                    const gs = GS[evt.guardianRole]
                    const isNeg = evt.status === 'FALTA' || evt.status === 'CANCELADO'
                    const accent = eventAccent(evt)

                    return (
                      <div
                        key={evt.id}
                        className="rounded-xl p-3 cursor-pointer transition-all"
                        style={{
                          background: isNeg ? 'var(--color-cancelado-bg)' : gs.bg,
                          border: `1px solid ${isNeg ? 'var(--color-cancelado-border)' : gs.border}`,
                          borderLeft: `4px solid ${accent}`,
                        }}
                        onClick={() => setSelectedEvent(evt)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter') setSelectedEvent(evt) }}
                        aria-label={`${evt.title} — ${evt.status}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-sm font-bold" style={{ color: isNeg ? 'var(--color-cancelado)' : gs.text }}>
                            {evt.title}
                          </p>
                          <StatusBadge status={evt.status} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                          <span className="text-timestamp">
                            {format(parseISO(evt.startAt), 'HH:mm')} — {format(parseISO(evt.endAt), 'HH:mm')}
                          </span>
                          {evt.isRecurring && (
                            <RotateCcw size={11} style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                          )}
                        </div>

                        {evt.status === 'PENDENTE' && !checkIns[evt.id] && (
                          <div className="flex gap-1.5 mt-2.5">
                            <button
                              className="btn-gradient flex-1 text-xs flex items-center justify-center gap-1"
                              style={{ minHeight: 30 }}
                              onClick={e => { e.stopPropagation(); handleCheckIn(evt.id) }}
                            >
                              <LogIn size={12} aria-hidden="true" />Check-in
                            </button>
                            <button
                              className="btn-danger text-xs"
                              style={{ minHeight: 30, flex: '0 0 auto', padding: '0 12px' }}
                              onClick={e => { e.stopPropagation(); toast('Falta registrada.', 'warning') }}
                            >
                              Falta
                            </button>
                          </div>
                        )}
                        {checkIns[evt.id] && !checkOuts[evt.id] && (
                          <div className="mt-2.5 space-y-1.5">
                            <div className="flex items-center gap-1.5 p-1.5 rounded-lg" style={{ background: 'var(--color-confirmado-bg)' }}>
                              <LogIn size={11} style={{ color: 'var(--color-confirmado)' }} aria-hidden="true" />
                              <span className="text-xs font-semibold" style={{ color: 'var(--color-confirmado)' }}>
                                Check-in: {format(parseISO(checkIns[evt.id]), 'HH:mm')}
                              </span>
                            </div>
                            <button
                              className="btn-success w-full text-xs flex items-center justify-center gap-1"
                              style={{ minHeight: 30 }}
                              onClick={e => { e.stopPropagation(); handleCheckOut(evt.id) }}
                            >
                              <LogOut size={12} aria-hidden="true" />Check-out
                            </button>
                          </div>
                        )}
                        {checkIns[evt.id] && checkOuts[evt.id] && (
                          <div className="mt-2.5 space-y-1 p-2 rounded-lg" style={{ background: 'var(--color-confirmado-bg)' }}>
                            <div className="flex items-center gap-1.5">
                              <LogIn size={11} style={{ color: 'var(--color-confirmado)' }} />
                              <span className="text-xs font-semibold" style={{ color: 'var(--color-confirmado)' }}>Entrada: {format(parseISO(checkIns[evt.id]), 'HH:mm')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <LogOut size={11} style={{ color: 'var(--color-confirmado)' }} />
                              <span className="text-xs font-semibold" style={{ color: 'var(--color-confirmado)' }}>Saída: {format(parseISO(checkOuts[evt.id]), 'HH:mm')}</span>
                            </div>
                          </div>
                        )}
                        {evt.status === 'CONFIRMADO' && !checkIns[evt.id] && (
                          <button
                            className="btn-success w-full text-xs mt-2 flex items-center justify-center gap-1"
                            style={{ minHeight: 30 }}
                            onClick={e => { e.stopPropagation(); toast('Check-out registrado!', 'success') }}
                          >
                            Registrar check-out
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── Monthly compliance card ─── */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-label uppercase tracking-wide" style={{ color: 'var(--color-text-tertiary)' }}>
                  Resumo — {format(currentDate, 'MMMM', { locale: ptBR })}
                </p>
                {selectedChild_obj && (
                  <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    {selectedChild_obj.fullName.split(' ')[0]}
                  </p>
                )}
              </div>
              <ComplianceDonut pct={compliance} />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Cumpridas', value: cumpridas, color: 'var(--color-confirmado)', bg: 'var(--color-confirmado-bg)', icon: <CheckCircle size={14} aria-hidden="true" /> },
                { label: 'Pendentes', value: pendentes, color: 'var(--color-pendente)',   bg: 'var(--color-pendente-bg)',   icon: <Clock size={14} aria-hidden="true" /> },
                { label: 'Faltas',    value: faltas,    color: 'var(--color-cancelado)',  bg: 'var(--color-cancelado-bg)',  icon: <AlertTriangle size={14} aria-hidden="true" /> },
              ].map(s => (
                <div
                  key={s.label}
                  className="rounded-xl p-2.5 text-center"
                  style={{ background: s.bg }}
                >
                  <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                  <p className="text-xl font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: s.color }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Segmented progress */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-caption">Cumprimento</span>
                <span className="text-xs font-bold" style={{ color: compliance >= 75 ? 'var(--color-confirmado)' : 'var(--color-pendente)' }}>
                  {compliance}%
                </span>
              </div>
              <div
                className="h-2.5 rounded-full overflow-hidden flex gap-px"
                style={{ background: 'var(--color-border)' }}
                role="progressbar"
                aria-valuenow={compliance}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${compliance}%`,
                    background: compliance >= 75
                      ? 'var(--color-confirmado)'
                      : 'linear-gradient(90deg, var(--color-pendente), var(--color-confirmado))',
                  }}
                />
              </div>
            </div>

            {/* Child selector */}
            <div
              className="mt-4 pt-4 flex items-center gap-2"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <Shield size={13} style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
              <span className="text-caption">
                {selectedChild_obj?.fullName ?? '—'}
              </span>
            </div>
          </div>

          {/* ─── Quick add button ─── */}
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-gradient w-full flex items-center justify-center gap-2"
          >
            <Plus size={16} aria-hidden="true" />
            Novo evento
          </button>
        </aside>
      </div>

      {/* ══════════ HISTORY PANEL (F-02.09) — rendered via extracted component ══════════ */}
      {showHistoryPanel && (
        <HistoryPanel
          stats={historyStats}
          events={filteredHistory}
          period={historyPeriod}
          typeFilter={historyTypeFilter}
          onPeriodChange={setHistoryPeriod}
          onTypeChange={setHistoryTypeFilter}
        />
      )}

      {/* ══════════ EVENT DETAIL MODAL ══════════ */}
      {selectedEvent && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 fade-in"
          style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
          aria-label={selectedEvent.title}
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            {/* Modal hero */}
            <div
              className="p-6 relative"
              style={{ background: 'var(--foursys-gradient)' }}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                aria-label="Fechar"
              >
                <X size={16} aria-hidden="true" />
              </button>

              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                <Calendar size={12} aria-hidden="true" />
                {selectedEvent.type === 'VISITA' ? 'Visita presencial' : 'Convivência'}
              </div>

              <h3 className="text-xl font-extrabold text-white">{selectedEvent.title}</h3>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {format(parseISO(selectedEvent.startAt), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4" style={{ background: 'var(--color-surface)' }}>
              {/* Time */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(29,78,216,0.08)', color: 'var(--color-primary)' }}
                  aria-hidden="true"
                >
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Horário</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {format(parseISO(selectedEvent.startAt), 'HH:mm')} — {format(parseISO(selectedEvent.endAt), 'HH:mm')}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(29,78,216,0.08)', color: 'var(--color-primary)' }}
                  aria-hidden="true"
                >
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Tipo</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedEvent.type === 'VISITA' ? 'Visita presencial' : 'Convivência prolongada'}
                  </p>
                </div>
              </div>

              {/* Status + Guardian */}
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={selectedEvent.status} />
                <GuardianBadge role={selectedEvent.guardianRole} />
                {selectedEvent.isRecurring && (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}
                  >
                    <RotateCcw size={11} aria-hidden="true" />
                    Recorrente semanal
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {selectedEvent.status === 'PENDENTE' && (
                  <>
                    <button
                      className="btn-gradient flex-1"
                      onClick={() => { setSelectedEvent(null); toast('Check-in registrado!', 'success') }}
                    >
                      Check-in
                    </button>
                    <button
                      className="btn-danger flex-1"
                      onClick={() => { setSelectedEvent(null); toast('Falta registrada. Ocorrência gerada automaticamente.', 'warning') }}
                    >
                      Registrar falta
                    </button>
                  </>
                )}
                {selectedEvent.status === 'CONFIRMADO' && (
                  <button
                    className="btn-success flex-1"
                    onClick={() => { setSelectedEvent(null); toast('Check-out registrado!', 'success') }}
                  >
                    Check-out
                  </button>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="btn-secondary"
                  style={{ flex: selectedEvent.status === 'CONFIRMADO' ? '0 0 auto' : '0 0 auto', padding: '0 16px' }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ NEW EVENT MODAL ══════════ */}
      {showNewModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 fade-in"
          style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-event-title"
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            {/* Modal hero */}
            <div className="p-5 flex items-center justify-between" style={{ background: 'var(--foursys-gradient)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                  aria-hidden="true"
                >
                  <Plus size={20} color="#fff" />
                </div>
                <h3 id="new-event-title" className="text-lg font-bold text-white">Novo evento</h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                aria-label="Fechar"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5" style={{ background: 'var(--color-surface)' }}>
              <form
                onSubmit={e => { e.preventDefault(); setShowNewModal(false); toast('Evento criado com sucesso!', 'success') }}
                className="space-y-4"
              >
                <div>
                  <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Filho
                  </label>
                  <select className="input-field">
                    {mockChildren.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Tipo de evento
                  </label>
                  <select className="input-field">
                    <option value="VISITA">Visita presencial</option>
                    <option value="CONVIVENCIA">Convivência prolongada</option>
                    <option value="EVENTO">Evento especial</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      Início
                    </label>
                    <input type="datetime-local" className="input-field text-sm" required />
                  </div>
                  <div>
                    <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      Fim
                    </label>
                    <input type="datetime-local" className="input-field text-sm" required />
                  </div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
                  <input type="checkbox" className="rounded" />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Recorrente semanal</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Repete toda semana no mesmo dia</p>
                  </div>
                </label>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowNewModal(false)} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-gradient flex-1">
                    Criar evento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════ MODAL: SOLICITAR TROCA DE DIA ══════ */}
      {showSwapModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 fade-in"
          style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          role="dialog" aria-modal="true" aria-labelledby="modal-swap-title"
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div className="p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true">
                  <ArrowLeftRight size={20} color="#fff" />
                </div>
                <h3 id="modal-swap-title" className="text-lg font-bold text-white">Solicitar Troca de Dia</h3>
              </div>
              <button onClick={() => setShowSwapModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} aria-label="Fechar">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="p-5 space-y-4" style={{ background: 'var(--color-surface)' }}>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.2)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  A solicitação de troca será enviada ao co-guardião para aprovação. Ambas as datas ficam bloqueadas até a resposta.
                </p>
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  const newSwap: SwapRequest = {
                    id: `swap-${Date.now()}`,
                    childId: selectedChild,
                    requesterId: 'user-1',
                    requesterName: 'Maria Silva',
                    originalDate: (e.currentTarget as HTMLFormElement).originalDate.value,
                    proposedDate: (e.currentTarget as HTMLFormElement).proposedDate.value,
                    reason: (e.currentTarget as HTMLFormElement).reason.value,
                    status: 'PENDENTE',
                    createdAt: new Date().toISOString(),
                  }
                  setSwapRequests(prev => [newSwap, ...prev])
                  setShowSwapModal(false)
                  toast('Solicitação de troca enviada! O co-guardião será notificado.', 'success')
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Filho
                  </label>
                  <select className="input-field">
                    {mockChildren.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      Data original *
                    </label>
                    <input name="originalDate" type="date" className="input-field" required autoFocus />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      Nova data proposta *
                    </label>
                    <input name="proposedDate" type="date" className="input-field" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Motivo da solicitação *
                  </label>
                  <textarea name="reason" className="input-field resize-none" rows={3} placeholder="Explique o motivo da troca..." required />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowSwapModal(false)} className="btn-secondary flex-1">Cancelar</button>
                  <button type="submit" className="btn-gradient flex-1">Enviar solicitação</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════ MODAL: LISTA DE TROCAS ══════ */}
      {showSwapListModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 fade-in"
          style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          role="dialog" aria-modal="true" aria-label="Solicitações de troca"
        >
          <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div className="p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true">
                  <ArrowLeftRight size={20} color="#fff" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Solicitações de Troca</h3>
                  {pendingSwaps > 0 && (
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{pendingSwaps} pendente(s)</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowSwapListModal(false); setShowSwapModal(true) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
                  style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.35)' }}
                >
                  <Plus size={13} /> Nova
                </button>
                <button onClick={() => setShowSwapListModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} aria-label="Fechar">
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3" style={{ background: 'var(--color-surface)' }}>
              {swapRequests.length === 0 ? (
                <div className="py-8 text-center">
                  <ArrowLeftRight size={28} className="mx-auto mb-2" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Nenhuma solicitação de troca</p>
                </div>
              ) : swapRequests.map(swap => {
                const statusColors: Record<SwapRequest['status'], { bg: string; text: string }> = {
                  PENDENTE: { bg: 'var(--color-pendente-bg)', text: 'var(--color-pendente)' },
                  ACEITO:   { bg: 'var(--color-confirmado-bg)', text: 'var(--color-confirmado)' },
                  REJEITADO:{ bg: 'var(--color-cancelado-bg)', text: 'var(--color-cancelado)' },
                  CANCELADO:{ bg: 'var(--color-surface-alt)', text: 'var(--color-text-tertiary)' },
                }
                const sc = statusColors[swap.status]
                const isReceived = swap.requesterId !== 'user-1'
                return (
                  <div
                    key={swap.id}
                    className="p-3.5 rounded-xl"
                    style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderLeft: `4px solid ${sc.text}` }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                          {format(new Date(swap.originalDate), 'dd/MM/yyyy', { locale: ptBR })}
                          {' '}<ArrowLeftRight size={12} className="inline" aria-hidden="true" />{' '}
                          {format(new Date(swap.proposedDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                          {isReceived ? `Solicitado por ${swap.requesterName}` : 'Sua solicitação'}
                        </p>
                      </div>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {swap.status === 'PENDENTE' ? 'Pendente' : swap.status === 'ACEITO' ? 'Aceito' : swap.status === 'REJEITADO' ? 'Rejeitado' : 'Cancelado'}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{swap.reason}</p>
                    {swap.responseNote && (
                      <p className="text-xs mt-1 italic" style={{ color: 'var(--color-text-tertiary)' }}>
                        Resposta: "{swap.responseNote}"
                      </p>
                    )}

                    {/* Action buttons for received pending swaps */}
                    {swap.status === 'PENDENTE' && isReceived && (
                      <div className="flex gap-2 mt-2.5 pt-2.5" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <button
                          className="flex items-center justify-center gap-1.5 flex-1 py-1.5 rounded-xl text-xs font-semibold"
                          style={{ background: 'var(--color-confirmado-bg)', color: 'var(--color-confirmado)', border: '1px solid var(--color-confirmado-border)' }}
                          onClick={() => {
                            setSwapRequests(prev => prev.map(s => s.id === swap.id ? { ...s, status: 'ACEITO', respondedAt: new Date().toISOString() } : s))
                            toast('Troca aceita! Calendário atualizado.', 'success')
                          }}
                        >
                          <Check size={13} aria-hidden="true" /> Aceitar
                        </button>
                        <button
                          className="flex items-center justify-center gap-1.5 flex-1 py-1.5 rounded-xl text-xs font-semibold"
                          style={{ background: 'var(--color-cancelado-bg)', color: 'var(--color-cancelado)', border: '1px solid var(--color-cancelado-border)' }}
                          onClick={() => {
                            setSwapRequests(prev => prev.map(s => s.id === swap.id ? { ...s, status: 'REJEITADO', respondedAt: new Date().toISOString() } : s))
                            toast('Troca recusada.', 'warning')
                          }}
                        >
                          <Ban size={13} aria-hidden="true" /> Recusar
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: SPECIAL DATES (F-02.04) ═══ */}
      {showSpecialDatesModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 fade-in" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} role="dialog" aria-modal="true" aria-labelledby="modal-special-title">
          <div className="w-full max-w-lg rounded-2xl overflow-auto" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)', maxHeight: '90vh' }}>
            <div className="p-5 flex items-center justify-between sticky top-0 z-10" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true"><Star size={18} color="#fff" /></div>
                <h3 id="modal-special-title" className="text-lg font-bold text-white">Datas Especiais</h3>
              </div>
              <button onClick={() => setShowSpecialDatesModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} aria-label="Fechar"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4" style={{ background: 'var(--color-surface)' }}>
              <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Info size={14} style={{ color: '#d97706' }} aria-hidden="true" />
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Datas marcadas com ★ no calendário. Feriados e férias podem suspender ou alterar o cronograma de visitas.</p>
              </div>
              {specialDates.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-tertiary)' }}>Nenhuma data especial cadastrada</p>
              ) : (
                <div className="space-y-2">
                  {specialDates.map(sd => {
                    const typeConfig: Record<string, { label: string; color: string }> = {
                      FERIADO:       { label: 'Feriado',       color: '#dc2626' },
                      FERIAS:        { label: 'Férias',        color: '#7c3aed' },
                      DATA_ESPECIAL: { label: 'Data especial', color: '#d97706' },
                      ANIVERSARIO:   { label: 'Aniversário',   color: '#059669' },
                    }
                    const tc = typeConfig[sd.type] ?? { label: sd.type, color: '#6b7280' }
                    return (
                      <div key={sd.id} className="p-3.5 rounded-xl" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderLeft: `4px solid ${tc.color}` }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{sd.title}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${tc.color}15`, color: tc.color }}>{tc.label}</span>
                              {sd.recurring && <RefreshCw size={11} style={{ color: 'var(--color-text-tertiary)' }} aria-label="Recorrente" />}
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                              {sd.startDate === sd.endDate
                                ? format(parseISO(sd.startDate), 'dd/MM/yyyy', { locale: ptBR })
                                : `${format(parseISO(sd.startDate), 'dd/MM', { locale: ptBR })} até ${format(parseISO(sd.endDate), 'dd/MM/yyyy', { locale: ptBR })}`}
                            </p>
                            {sd.notes && <p className="text-xs mt-0.5 italic" style={{ color: 'var(--color-text-tertiary)' }}>{sd.notes}</p>}
                          </div>
                          <button onClick={() => setSpecialDates(p => p.filter(x => x.id !== sd.id))} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ color: 'var(--color-cancelado)', background: 'var(--color-cancelado-bg)' }} aria-label={`Remover ${sd.title}`}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-tertiary)' }}>Adicionar nova data</p>
                <form onSubmit={e => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  const newSd: SpecialDate = {
                    id: `sd-${Date.now()}`,
                    type: fd.get('type') as SpecialDate['type'],
                    title: fd.get('title') as string,
                    startDate: fd.get('startDate') as string,
                    endDate: (fd.get('endDate') as string) || (fd.get('startDate') as string),
                    recurring: fd.get('recurring') === 'on',
                    affectsSchedule: fd.get('affects') === 'on',
                    notes: fd.get('notes') as string,
                    childIds: [selectedChild],
                  }
                  setSpecialDates(p => [...p, newSd])
                  ;(e.target as HTMLFormElement).reset()
                  toast('Data especial adicionada!', 'success')
                }} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>Tipo *</label>
                      <select name="type" className="input-field text-sm" required>
                        <option value="FERIADO">Feriado</option>
                        <option value="FERIAS">Férias</option>
                        <option value="DATA_ESPECIAL">Data especial</option>
                        <option value="ANIVERSARIO">Aniversário</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>Título *</label>
                      <input name="title" type="text" className="input-field text-sm" placeholder="Ex: Natal 2026" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>Data início *</label>
                      <input name="startDate" type="date" className="input-field text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>Data fim</label>
                      <input name="endDate" type="date" className="input-field text-sm" />
                    </div>
                  </div>
                  <input name="notes" type="text" className="input-field text-sm" placeholder="Observações sobre esta data..." />
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input name="recurring" type="checkbox" className="rounded" />
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Recorrente anualmente</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input name="affects" type="checkbox" className="rounded" />
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Afeta cronograma</span>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowSpecialDatesModal(false)} className="btn-secondary flex-1">Fechar</button>
                    <button type="submit" className="btn-gradient flex-1">Adicionar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: RECURRENCE CONFIG (F-02.03) ═══ */}
      {showRecurrenceModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 fade-in" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} role="dialog" aria-modal="true" aria-labelledby="modal-rec-title">
          <div className="w-full max-w-lg rounded-2xl overflow-auto" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)', maxHeight: '90vh' }}>
            <div className="p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true"><Repeat size={18} color="#fff" /></div>
                <h3 id="modal-rec-title" className="text-lg font-bold text-white">Configurar Recorrência</h3>
              </div>
              <button onClick={() => setShowRecurrenceModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} aria-label="Fechar"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4" style={{ background: 'var(--color-surface)' }}>
              <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.15)' }}>
                <Info size={14} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>A recorrência define automaticamente quais semanas cada guardião tem a criança, eliminando a necessidade de criar eventos individuais.</p>
              </div>
              {recurrenceConfigs.filter(r => r.childId === selectedChild).map(rc => (
                <div key={rc.id} className="p-4 rounded-xl" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        Configuração Atual: <span style={{ color: 'var(--color-primary)' }}>
                          {rc.pattern === 'QUINZENAL' ? 'Quinzenal' : rc.pattern === 'SEMANAL' ? 'Semanal' : rc.pattern === 'MENSAL' ? 'Mensal' : 'Personalizado'}
                        </span>
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>Vigente desde {format(parseISO(rc.startDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                    </div>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: rc.active ? 'var(--color-confirmado-bg)' : 'var(--color-cancelado-bg)', color: rc.active ? 'var(--color-confirmado)' : 'var(--color-cancelado)' }}>
                      {rc.active ? <Check size={10} /> : <X size={10} />}
                      {rc.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl" style={{ background: 'var(--color-guardian-a-bg)' }}>
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-guardian-a)' }}>Guardião A</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--color-guardian-a)' }}>
                        Semanas {rc.guardian1Weeks === 'PAR' ? 'Pares' : rc.guardian1Weeks === 'IMPAR' ? 'Ímpares' : 'Todas'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl" style={{ background: 'var(--color-guardian-b-bg)' }}>
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-guardian-b)' }}>Guardião B</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--color-guardian-b)' }}>
                        Semanas {rc.guardian2Weeks === 'PAR' ? 'Pares' : rc.guardian2Weeks === 'IMPAR' ? 'Ímpares' : 'Todas'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setRecurrenceConfigs(prev => prev.map(r => r.id === rc.id ? { ...r, active: !r.active } : r))
                      toast(rc.active ? 'Recorrência pausada.' : 'Recorrência reativada!', rc.active ? 'warning' : 'success')
                    }}
                    className="mt-3 text-xs font-semibold"
                    style={{ color: rc.active ? 'var(--color-cancelado)' : 'var(--color-confirmado)' }}
                  >
                    {rc.active ? '⏸ Pausar recorrência' : '▶ Reativar recorrência'}
                  </button>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-tertiary)' }}>Nova configuração</p>
                <form onSubmit={e => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  const newRc: RecurrenceConfig = {
                    id: `rec-${Date.now()}`,
                    childId: selectedChild,
                    pattern: fd.get('pattern') as RecurrenceConfig['pattern'],
                    guardian1Weeks: fd.get('g1weeks') as RecurrenceConfig['guardian1Weeks'],
                    guardian2Weeks: fd.get('g2weeks') as RecurrenceConfig['guardian2Weeks'],
                    startDate: fd.get('startDate') as string,
                    active: true,
                  }
                  setRecurrenceConfigs(p => p.filter(r => r.childId !== selectedChild).concat(newRc))
                  toast('Recorrência configurada! Eventos gerados automaticamente.', 'success')
                  setShowRecurrenceModal(false)
                }} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>Padrão *</label>
                    <select name="pattern" className="input-field" defaultValue="QUINZENAL" required>
                      <option value="SEMANAL">Semanal (fins de semana alternados)</option>
                      <option value="QUINZENAL">Quinzenal (semanas alternadas)</option>
                      <option value="MENSAL">Mensal (1 semana por mês)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-guardian-a)' }}>Guardião A — semanas *</label>
                      <select name="g1weeks" className="input-field" defaultValue="PAR" required>
                        <option value="PAR">Pares</option>
                        <option value="IMPAR">Ímpares</option>
                        <option value="TODAS">Todas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-guardian-b)' }}>Guardião B — semanas *</label>
                      <select name="g2weeks" className="input-field" defaultValue="IMPAR" required>
                        <option value="PAR">Pares</option>
                        <option value="IMPAR">Ímpares</option>
                        <option value="TODAS">Todas</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>Data de início *</label>
                    <input name="startDate" type="date" className="input-field" required defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setShowRecurrenceModal(false)} className="btn-secondary flex-1">Cancelar</button>
                    <button type="submit" className="btn-gradient flex-1 flex items-center justify-center gap-1.5"><Repeat size={14} />Aplicar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
