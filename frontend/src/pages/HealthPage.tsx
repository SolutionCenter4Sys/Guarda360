import { useState } from 'react'
import {
  Heart, Syringe, FileText, Phone, Plus, X, Check, Clock,
  AlertTriangle, Calendar, MapPin, User, ChevronDown, ChevronUp,
  Stethoscope, BookOpen, Bell, GraduationCap, Megaphone,
  BarChart2, Star, Download, TrendingUp,
} from 'lucide-react'
import { mockChildren } from '../mocks'
import { useToast } from '../context/ToastContext'
import { format, parseISO, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileUpload } from '../components/ui/FileUpload'
import type {
  MedicalAppointment, AppointmentType, DocumentType, Vaccine,
  SchoolReport, SchoolPeriod, CommunicationType,
} from '../types'
import { useHealthData, PERIOD_LABELS } from '../hooks/useHealthData'
import { useReminderSettings } from '../hooks/useReminderSettings'
import { ReminderConfigPanel } from '../components/health/ReminderConfigPanel'

/* ─── Period labels — imported from useHealthData to avoid duplication ─── */
const periodLabels = PERIOD_LABELS

const commTypeConfig: Record<CommunicationType, { label: string; color: string; icon: React.ReactNode }> = {
  REUNIAO:  { label: 'Reunião',   color: '#7c3aed', icon: <User size={13} /> },
  CIRCULAR: { label: 'Circular',  color: '#0ea5e9', icon: <FileText size={13} /> },
  AVISO:    { label: 'Aviso',     color: '#f59e0b', icon: <Bell size={13} /> },
  EVENTO:   { label: 'Evento',    color: '#059669', icon: <Calendar size={13} /> },
  OUTRO:    { label: 'Outro',     color: '#6b7280', icon: <Megaphone size={13} /> },
}

/* ─── Grade color ─── */
const gradeColor = (g: number, max: number) => {
  const pct = g / max
  if (pct >= 0.9) return 'var(--color-confirmado)'
  if (pct >= 0.7) return 'var(--color-pendente)'
  return 'var(--color-cancelado)'
}

/* ─── Label maps ─── */
const apptTypeLabel: Record<AppointmentType, string> = {
  CONSULTA: 'Consulta',
  EXAME: 'Exame',
  VACINA: 'Vacina',
  EMERGENCIA: 'Emergência',
  OUTRO: 'Outro',
}

const apptTypeIcon: Record<AppointmentType, React.ReactNode> = {
  CONSULTA: <Stethoscope size={14} aria-hidden="true" />,
  EXAME: <FileText size={14} aria-hidden="true" />,
  VACINA: <Syringe size={14} aria-hidden="true" />,
  EMERGENCIA: <AlertTriangle size={14} aria-hidden="true" />,
  OUTRO: <Calendar size={14} aria-hidden="true" />,
}

const docTypeLabel: Record<DocumentType, string> = {
  ATESTADO: 'Atestado',
  RECEITA: 'Receita',
  EXAME: 'Exame',
  BOLETIM: 'Boletim',
  COMUNICADO: 'Comunicado',
  OUTRO: 'Outro',
}

const docTypeColor: Record<DocumentType, string> = {
  ATESTADO: 'var(--color-cancelado)',
  RECEITA: 'var(--color-primary)',
  EXAME: 'var(--color-pendente)',
  BOLETIM: 'var(--color-confirmado)',
  COMUNICADO: 'var(--color-guardian-shared)',
  OUTRO: 'var(--color-text-tertiary)',
}

/* ─── Vaccine status chip ─── */
function VaccineChip({ vac }: { vac: Vaccine }) {
  const colors: Record<Vaccine['status'], { bg: string; text: string; icon: React.ReactNode }> = {
    EM_DIA:  { bg: 'var(--color-confirmado-bg)',  text: 'var(--color-confirmado)', icon: <Check size={12} /> },
    ATRASADA:{ bg: 'var(--color-cancelado-bg)',   text: 'var(--color-cancelado)',  icon: <AlertTriangle size={12} /> },
    PENDENTE:{ bg: 'var(--color-pendente-bg)',    text: 'var(--color-pendente)',   icon: <Clock size={12} /> },
  }
  const c = colors[vac.status]
  return (
    <div
      className="p-3 rounded-xl"
      style={{ background: c.bg, border: `1px solid color-mix(in srgb, ${c.text} 25%, transparent)` }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-bold" style={{ color: c.text }}>{vac.name}</p>
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
          style={{ background: c.text, color: '#fff' }}
        >
          {c.icon}
          {vac.status === 'EM_DIA' ? 'Em dia' : vac.status === 'ATRASADA' ? 'Atrasada' : 'Pendente'}
        </div>
      </div>
      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        Dose {vac.doseNumber}/{vac.totalDoses}
        {vac.appliedAt && ` · Aplicada: ${format(parseISO(vac.appliedAt), 'dd/MM/yyyy', { locale: ptBR })}`}
        {vac.nextDoseAt && ` · Próxima: ${format(parseISO(vac.nextDoseAt), 'dd/MM/yyyy', { locale: ptBR })}`}
      </p>
    </div>
  )
}

/* ─── Appointment card ─── */
function AppointmentCard({
  appt,
  onOpen,
}: {
  appt: MedicalAppointment
  onOpen: (a: MedicalAppointment) => void
}) {
  const isPast = isBefore(parseISO(appt.scheduledAt), new Date())
  const statusColor =
    appt.status === 'REALIZADO' ? 'var(--color-confirmado)' :
    appt.status === 'CANCELADO' ? 'var(--color-cancelado)' :
    'var(--color-pendente)'
  const statusBg =
    appt.status === 'REALIZADO' ? 'var(--color-confirmado-bg)' :
    appt.status === 'CANCELADO' ? 'var(--color-cancelado-bg)' :
    'var(--color-pendente-bg)'

  return (
    <div
      className="p-3.5 rounded-xl cursor-pointer transition-all"
      style={{
        background: 'var(--color-surface-alt)',
        border: '1px solid var(--color-border)',
        borderLeft: `4px solid ${statusColor}`,
        opacity: appt.status === 'CANCELADO' ? 0.7 : 1,
      }}
      onClick={() => onOpen(appt)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onOpen(appt) }}
      aria-label={appt.title}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span style={{ color: statusColor }}>{apptTypeIcon[appt.type]}</span>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {appt.title}
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: statusBg, color: statusColor }}
        >
          {appt.status === 'AGENDADO' ? 'Agendado' : appt.status === 'REALIZADO' ? 'Realizado' : 'Cancelado'}
        </span>
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
          <span className="text-xs" style={{ color: isPast && appt.status === 'AGENDADO' ? 'var(--color-cancelado)' : 'var(--color-text-tertiary)' }}>
            {format(parseISO(appt.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            {isPast && appt.status === 'AGENDADO' && ' — Vencida!'}
          </span>
        </div>
        {appt.doctor && (
          <div className="flex items-center gap-1.5">
            <User size={12} style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{appt.doctor}</span>
          </div>
        )}
        {appt.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={12} style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
            <span className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>{appt.location}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════ MAIN PAGE ═══════════════════════════════════ */
type Tab = 'agenda' | 'vacinas' | 'documentos' | 'boletins' | 'historico' | 'contatos'

export default function HealthPage() {
  const [tab, setTab]                         = useState<Tab>('agenda')
  const [selectedChild, setSelectedChild]     = useState(mockChildren[0].id)
  const [showApptModal, setShowApptModal]     = useState(false)
  const [showDocModal, setShowDocModal]       = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedAppt, setSelectedAppt]       = useState<MedicalAppointment | null>(null)
  const [selectedReport, setSelectedReport]   = useState<SchoolReport | null>(null)
  const [vaccineExpanded, setVaccineExpanded] = useState(true)
  const [historyFilter, setHistoryFilter]     = useState<'ALL' | 'CONSULTA' | 'VACINA' | 'DOCUMENTO' | 'BOLETIM'>('ALL')
  const { toast } = useToast()

  /* ─── F-05.01–05.08: Child health data — logic delegated to hook (SRP) ─── */
  const {
    childAppts, childVaccines, childDocs, childContacts, childReports, childComms,
    upcoming, past, vacEmDia, vacPend, unreadComms,
    healthTimeline, gradeEvolution,
  } = useHealthData(selectedChild, historyFilter)

  /* ─── F-05.06: Reminder configuration — logic delegated to hook (SRP) ─── */
  const {
    showReminderPanel, setShowReminderPanel,
    settings: reminderSettings,
    updateField: updateReminderField,
    toggleType: toggleReminderType,
  } = useReminderSettings()

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'agenda',    label: 'Agenda',    icon: <Calendar size={15} /> },
    { id: 'vacinas',   label: 'Vacinas',   icon: <Syringe size={15} /> },
    { id: 'documentos',label: 'Documentos',icon: <FileText size={15} /> },
    { id: 'boletins',  label: 'Escola',    icon: <GraduationCap size={15} />, badge: unreadComms },
    { id: 'historico', label: 'Histórico', icon: <BarChart2 size={15} /> },
    { id: 'contatos',  label: 'Contatos',  icon: <Phone size={15} /> },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-4">

      {/* ══════ HERO ══════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #0ea5e9 100%)', boxShadow: '0 6px 24px rgba(5,150,105,0.28)' }}
      >
        {/* Top: child selector + action */}
        <div
          className="flex items-center justify-between px-5 pt-4 pb-3 flex-wrap gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)' }}
              aria-hidden="true"
            >
              <Heart size={20} color="#fff" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white leading-tight">Saúde & Escola</h2>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Histórico médico e escolar compartilhado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {mockChildren.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChild(c.id)}
                className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: c.id === selectedChild ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  border: c.id === selectedChild ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid transparent',
                }}
                role="tab"
                aria-selected={c.id === selectedChild}
              >
                {c.fullName.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-px px-5 py-4 text-white">
          {[
            { icon: <Calendar size={15} />, label: 'Próximas consultas', value: upcoming.length },
            { icon: <Check size={15} />,    label: 'Realizadas',          value: past.filter(a => a.status === 'REALIZADO').length },
            { icon: <Syringe size={15} />,  label: 'Vacinas em dia',      value: vacEmDia },
            { icon: <Bell size={15} />,     label: 'Vacinas pendentes',   value: vacPend },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1 text-center">
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>{s.icon}</div>
              <p className="text-2xl font-extrabold leading-none">{s.value}</p>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════ TAB NAVIGATION ══════ */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-sm font-semibold transition-all relative min-w-[56px]"
            style={{
              background: tab === t.id ? 'var(--color-surface)' : 'transparent',
              color: tab === t.id ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
              boxShadow: tab === t.id ? 'var(--shadow-soft)' : 'none',
            }}
            role="tab"
            aria-selected={tab === t.id}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
            {t.badge != null && t.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold" style={{ background: 'var(--color-cancelado)', fontSize: '10px' }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════ AGENDA MÉDICA ══════ */}
      {tab === 'agenda' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Agenda Médica
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReminderPanel(v => !v)}
                className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all"
                style={{
                  background: showReminderPanel ? 'rgba(29,78,216,0.12)' : 'var(--color-surface-alt)',
                  color: showReminderPanel ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  border: `1px solid ${showReminderPanel ? 'rgba(29,78,216,0.3)' : 'var(--color-border)'}`,
                }}
                aria-pressed={showReminderPanel}
              >
                <Bell size={14} aria-hidden="true" />
                Lembretes
              </button>
              <button
                onClick={() => setShowApptModal(true)}
                className="btn-gradient flex items-center gap-2 text-sm"
              >
                <Plus size={14} aria-hidden="true" />
                Agendar consulta
              </button>
            </div>
          </div>

          {/* ─── Reminder Configuration Panel (F-05.06) — rendered via extracted component ─── */}
          {showReminderPanel && (
            <ReminderConfigPanel
              settings={reminderSettings}
              onUpdateField={updateReminderField}
              onToggleType={toggleReminderType}
              onSave={() => {
                toast('Lembretes configurados com sucesso!', 'success')
                setShowReminderPanel(false)
              }}
            />
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Próximas
              </p>
              <div className="space-y-2">
                {upcoming.map(a => (
                  <AppointmentCard key={a.id} appt={a} onOpen={setSelectedAppt} />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Histórico
              </p>
              <div className="space-y-2">
                {past.map(a => (
                  <AppointmentCard key={a.id} appt={a} onOpen={setSelectedAppt} />
                ))}
              </div>
            </div>
          )}

          {childAppts.length === 0 && (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--color-surface-alt)', border: '1px dashed var(--color-border-dark)' }}
            >
              <Calendar size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
                Nenhuma consulta registrada
              </p>
              <button
                onClick={() => setShowApptModal(true)}
                className="mt-3 text-sm font-bold"
                style={{ color: 'var(--color-primary)' }}
              >
                + Agendar primeira consulta
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════ VACINAÇÃO ══════ */}
      {tab === 'vacinas' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Carteira de Vacinação
            </h3>
            <button
              onClick={() => toast('Adicionar vacina em breve!', 'info')}
              className="btn-secondary flex items-center gap-1.5 text-sm"
            >
              <Plus size={14} aria-hidden="true" />
              Adicionar
            </button>
          </div>

          {/* Em dia section */}
          {childVaccines.filter(v => v.status === 'EM_DIA').length > 0 && (
            <div>
              <button
                className="flex items-center gap-2 w-full mb-2"
                onClick={() => setVaccineExpanded(v => !v)}
              >
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'var(--color-confirmado-bg)', color: 'var(--color-confirmado)' }}
                >
                  <Check size={11} aria-hidden="true" />
                  {childVaccines.filter(v => v.status === 'EM_DIA').length} Em dia
                </div>
                {vaccineExpanded ? <ChevronUp size={14} style={{ color: 'var(--color-text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--color-text-tertiary)' }} />}
              </button>

              {vaccineExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {childVaccines.filter(v => v.status === 'EM_DIA').map(v => (
                    <VaccineChip key={v.id} vac={v} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pendentes/Atrasadas */}
          {childVaccines.filter(v => v.status !== 'EM_DIA').length > 0 && (
            <div>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-2 w-fit"
                style={{ background: 'var(--color-pendente-bg)', color: 'var(--color-pendente)' }}
              >
                <Clock size={11} aria-hidden="true" />
                {childVaccines.filter(v => v.status !== 'EM_DIA').length} Pendente(s)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {childVaccines.filter(v => v.status !== 'EM_DIA').map(v => (
                  <VaccineChip key={v.id} vac={v} />
                ))}
              </div>
            </div>
          )}

          {childVaccines.length === 0 && (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--color-surface-alt)', border: '1px dashed var(--color-border-dark)' }}
            >
              <Syringe size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
                Nenhuma vacina registrada
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════ DOCUMENTOS ══════ */}
      {tab === 'documentos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Atestados & Documentos
            </h3>
            <button
              onClick={() => setShowDocModal(true)}
              className="btn-gradient flex items-center gap-2 text-sm"
            >
              <Plus size={14} aria-hidden="true" />
              Adicionar
            </button>
          </div>

          {/* Filter row */}
          <div className="flex gap-2 flex-wrap">
            {(['ATESTADO', 'RECEITA', 'EXAME', 'BOLETIM', 'COMUNICADO'] as DocumentType[]).map(type => (
              <span
                key={type}
                className="px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer"
                style={{
                  background: `color-mix(in srgb, ${docTypeColor[type]} 12%, transparent)`,
                  color: docTypeColor[type],
                  border: `1px solid color-mix(in srgb, ${docTypeColor[type]} 25%, transparent)`,
                }}
              >
                {docTypeLabel[type]} ({childDocs.filter(d => d.type === type).length})
              </span>
            ))}
          </div>

          {childDocs.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--color-surface-alt)', border: '1px dashed var(--color-border-dark)' }}
            >
              <FileText size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
                Nenhum documento cadastrado
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {childDocs.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl transition-all"
                  style={{
                    background: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    borderLeft: `4px solid ${docTypeColor[doc.type]}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `color-mix(in srgb, ${docTypeColor[doc.type]} 12%, transparent)`,
                      color: docTypeColor[doc.type],
                    }}
                    aria-hidden="true"
                  >
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        {doc.title}
                      </p>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: `color-mix(in srgb, ${docTypeColor[doc.type]} 12%, transparent)`,
                          color: docTypeColor[doc.type],
                        }}
                      >
                        {docTypeLabel[doc.type]}
                      </span>
                    </div>
                    {doc.description && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {format(parseISO(doc.uploadedAt), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <code
                        className="text-xs px-1.5 py-0.5 rounded font-mono"
                        style={{ background: 'var(--color-surface)', color: 'var(--color-text-tertiary)' }}
                      >
                        {doc.hash.slice(0, 18)}…
                      </code>
                      <a
                        href={doc.fileUrl}
                        onClick={e => { e.preventDefault(); toast('Download do arquivo iniciado!', 'success') }}
                        className="text-xs font-semibold"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Baixar
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════ CONTATOS DE EMERGÊNCIA ══════ */}
      {tab === 'contatos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Contatos de Emergência
            </h3>
            <button
              onClick={() => toast('Funcionalidade de adicionar contato em breve!', 'info')}
              className="btn-secondary flex items-center gap-1.5 text-sm"
            >
              <Plus size={14} aria-hidden="true" />
              Adicionar
            </button>
          </div>

          {childContacts.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--color-surface-alt)', border: '1px dashed var(--color-border-dark)' }}
            >
              <Phone size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
                Nenhum contato cadastrado
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {childContacts.map(c => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{
                    background: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #059669, #0ea5e9)' }}
                    aria-hidden="true"
                  >
                    <span className="text-white font-bold text-lg">{c.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {c.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      {c.role} · {c.relationship}
                    </p>
                    <a
                      href={`tel:${c.phone}`}
                      className="text-sm font-semibold mt-1 flex items-center gap-1"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <Phone size={12} aria-hidden="true" />
                      {c.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info box */}
          <div
            className="p-3 rounded-xl flex items-start gap-2.5"
            style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)' }}
          >
            <BookOpen size={15} style={{ color: '#059669', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Ambos os responsáveis têm acesso a estes contatos de emergência. Em caso de urgência, qualquer
              guardião pode acionar os profissionais cadastrados.
            </p>
          </div>
        </div>
      )}

      {/* ══════ BOLETINS ESCOLARES (F-05.04/05) ══════ */}
      {tab === 'boletins' && (
        <div className="space-y-5">
          {/* School Comms */}
          {childComms.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Comunicados da Escola
                  {unreadComms > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: 'var(--color-cancelado)' }}>{unreadComms} novo(s)</span>
                  )}
                </h3>
              </div>
              <div className="space-y-2">
                {childComms.map(comm => {
                  const cfg = commTypeConfig[comm.type]
                  return (
                    <div
                      key={comm.id}
                      className="flex items-start gap-3 p-3.5 rounded-xl"
                      style={{ background: 'var(--color-surface-alt)', border: `1px solid var(--color-border)`, borderLeft: `4px solid ${cfg.color}`, opacity: comm.isRead ? 0.8 : 1 }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}18`, color: cfg.color }} aria-hidden="true">
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{comm.title}</p>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0" style={{ background: `${cfg.color}18`, color: cfg.color }}>{cfg.label}</span>
                        </div>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{comm.content}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                            {format(parseISO(comm.uploadedAt), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                          {comm.eventDate && (
                            <span className="text-xs font-semibold" style={{ color: cfg.color }}>
                              📅 {format(parseISO(comm.eventDate), "dd/MM 'às' HH'h'", { locale: ptBR })}
                            </span>
                          )}
                          {!comm.isRead && (
                            <span className="text-xs font-bold" style={{ color: 'var(--color-cancelado)' }}>● Novo</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* School Reports */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Boletins Escolares</h3>
              <button
                onClick={() => setShowReportModal(true)}
                className="btn-gradient flex items-center gap-2 text-sm"
              >
                <Plus size={14} aria-hidden="true" />
                Adicionar boletim
              </button>
            </div>

            {childReports.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--color-surface-alt)', border: '1px dashed var(--color-border-dark)' }}>
                <GraduationCap size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Nenhum boletim cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Grade evolution chart */}
                {gradeEvolution.length >= 2 && (
                  <div className="card p-4" style={{ boxShadow: 'var(--shadow-soft)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={16} style={{ color: 'var(--color-confirmado)' }} />
                      <h4 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Evolução das notas</h4>
                    </div>
                    <div className="flex items-end gap-2" style={{ height: 80 }}>
                      {gradeEvolution.map((g, i) => {
                        const h = Math.round((g.avg / 10) * 72)
                        const isLast = i === gradeEvolution.length - 1
                        return (
                          <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                            <span className="text-xs font-bold" style={{ color: isLast ? 'var(--color-primary)' : 'var(--color-text-tertiary)', fontSize: 10 }}>{g.avg}</span>
                            <div className="w-full rounded-t" style={{ height: h, background: isLast ? 'var(--foursys-gradient)' : gradeColor(g.avg, 10), opacity: 0.85 }} />
                            <span className="text-xs text-center truncate w-full" style={{ color: 'var(--color-text-tertiary)', fontSize: 9 }}>{g.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {childReports.map(report => {
                  const avg = report.grades ? +(report.grades.reduce((s, g) => s + g.grade / g.maxGrade * 10, 0) / report.grades.length).toFixed(1) : null
                  return (
                    <div
                      key={report.id}
                      className="card p-4 cursor-pointer transition-all card-hover"
                      style={{ borderLeft: `4px solid ${avg != null ? gradeColor(avg, 10) : 'var(--color-border-dark)'}` }}
                      onClick={() => setSelectedReport(report)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter') setSelectedReport(report) }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }} aria-hidden="true">
                            <GraduationCap size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                              {periodLabels[report.period]} · {report.year}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{report.school} · {report.schoolGrade}</p>
                            {report.notes && (
                              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-text-secondary)' }}>{report.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {avg != null && (
                            <>
                              <p className="text-xl font-extrabold" style={{ color: gradeColor(avg, 10) }}>{avg}</p>
                              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>média</p>
                            </>
                          )}
                          <a href={report.fileUrl} onClick={e => { e.preventDefault(); e.stopPropagation(); toast('Download iniciado!', 'success') }} className="text-xs font-semibold flex items-center gap-1 mt-1" style={{ color: 'var(--color-primary)' }}>
                            <Download size={11} />PDF
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════ HISTÓRICO MÉDICO UNIFICADO (F-05.07) ══════ */}
      {tab === 'historico' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Histórico de Saúde Unificado
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{healthTimeline.length} evento(s)</p>
          </div>

          {/* Filter chips */}
          <div className="flex gap-1.5 flex-wrap">
            {([
              ['ALL', 'Todos', 'var(--color-primary)'],
              ['CONSULTA', '🩺 Consultas', 'var(--color-primary)'],
              ['VACINA', '💉 Vacinas', 'var(--color-confirmado)'],
              ['DOCUMENTO', '📄 Documentos', 'var(--color-pendente)'],
              ['BOLETIM', '📚 Boletins', '#7c3aed'],
            ] as [string, string, string][]).map(([key, label, color]) => (
              <button
                key={key}
                onClick={() => setHistoryFilter(key as typeof historyFilter)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: historyFilter === key ? color : 'var(--color-surface-alt)',
                  color: historyFilter === key ? '#fff' : 'var(--color-text-secondary)',
                  border: `1px solid ${historyFilter === key ? color : 'var(--color-border)'}`,
                }}
                aria-pressed={historyFilter === key}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Timeline */}
          {healthTimeline.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--color-surface-alt)', border: '1px dashed var(--color-border-dark)' }}>
              <BarChart2 size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Nenhum evento nesta categoria</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5" style={{ background: 'var(--color-border)' }} aria-hidden="true" />

              <div className="space-y-3 pl-10">
                {healthTimeline.map((evt, idx) => {
                  const prev = healthTimeline[idx - 1]
                  const showYear = !prev || format(parseISO(evt.date), 'yyyy') !== format(parseISO(prev.date), 'yyyy')
                  const typeIcon: Record<string, React.ReactNode> = {
                    CONSULTA: <Stethoscope size={14} />,
                    VACINA:   <Syringe size={14} />,
                    DOCUMENTO:<FileText size={14} />,
                    BOLETIM:  <GraduationCap size={14} />,
                  }
                  return (
                    <div key={evt.id}>
                      {showYear && (
                        <div className="flex items-center gap-2 mb-3 -ml-10">
                          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                          <span className="text-xs font-bold px-2" style={{ color: 'var(--color-text-tertiary)' }}>
                            {format(parseISO(evt.date), 'yyyy')}
                          </span>
                          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                        </div>
                      )}
                      <div className="relative flex items-start gap-3">
                        {/* Timeline dot */}
                        <div
                          className="absolute -left-10 w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: evt.color, top: 0 }}
                          aria-hidden="true"
                        >
                          {typeIcon[evt.type]}
                        </div>
                        <div
                          className="flex-1 p-3 rounded-xl"
                          style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderLeft: `3px solid ${evt.color}` }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{evt.title}</p>
                            <time className="text-xs flex-shrink-0 font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                              {format(parseISO(evt.date), 'dd/MM/yyyy', { locale: ptBR })}
                            </time>
                          </div>
                          {evt.subtitle && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{evt.subtitle}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════ MODAL: NOVO BOLETIM ══════ */}
      {showReportModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 fade-in" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div className="p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true"><GraduationCap size={20} color="#fff" /></div>
                <h3 className="text-lg font-bold text-white">Adicionar Boletim</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} aria-label="Fechar"><X size={16} /></button>
            </div>
            <div className="p-5 max-h-[80vh] overflow-y-auto" style={{ background: 'var(--color-surface)' }}>
              <form onSubmit={e => { e.preventDefault(); setShowReportModal(false); toast('Boletim adicionado! Ambos os guardiões foram notificados.', 'success') }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Período *</label>
                    <select className="input-field">
                      {Object.entries(periodLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Ano *</label>
                    <input type="number" className="input-field" defaultValue={new Date().getFullYear()} min={2020} max={2030} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Escola</label>
                  <input type="text" className="input-field" placeholder="Nome da escola" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Série / Turma</label>
                  <input type="text" className="input-field" placeholder="Ex: 5º Ano A" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Observações</label>
                  <textarea className="input-field resize-none" rows={2} placeholder="Comentários do professor, desempenho..." />
                </div>
                <FileUpload label="Arquivo do boletim *" accept="image/*,application/pdf" hint="PDF ou foto · máx 10 MB" />
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowReportModal(false)} className="btn-secondary flex-1">Cancelar</button>
                  <button type="submit" className="btn-gradient flex-1">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════ MODAL: DETALHE BOLETIM ══════ */}
      {selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center p-4 fade-in" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div className="p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)' }}>
              <div>
                <h3 className="text-base font-bold text-white">{periodLabels[selectedReport.period]} · {selectedReport.year}</h3>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{selectedReport.school} · {selectedReport.schoolGrade}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} aria-label="Fechar"><X size={16} /></button>
            </div>
            <div className="p-5" style={{ background: 'var(--color-surface)' }}>
              {selectedReport.grades && selectedReport.grades.length > 0 ? (
                <div className="space-y-2">
                  {selectedReport.grades.map(g => {
                    const pct = g.grade / g.maxGrade
                    const color = gradeColor(g.grade, g.maxGrade)
                    return (
                      <div key={g.subject}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{g.subject}</span>
                          <span className="text-sm font-bold" style={{ color }}>{g.grade}/{g.maxGrade}</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: 'var(--color-border)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, background: color }} />
                        </div>
                      </div>
                    )
                  })}
                  <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold" style={{ color: 'var(--color-text-secondary)' }}>Média geral</span>
                      <span className="text-xl font-extrabold" style={{ color: gradeColor(selectedReport.grades.reduce((s, g) => s + g.grade / g.maxGrade * 10, 0) / selectedReport.grades.length, 10) }}>
                        {(selectedReport.grades.reduce((s, g) => s + g.grade / g.maxGrade * 10, 0) / selectedReport.grades.length).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-tertiary)' }}>Notas não inseridas manualmente</p>
              )}
              {selectedReport.notes && (
                <div className="mt-3 p-3 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{selectedReport.notes}</p>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button onClick={() => { toast('Download do boletim iniciado!', 'success') }} className="btn-secondary flex-1 flex items-center justify-center gap-2"><Download size={14} />Download PDF</button>
                <button onClick={() => setSelectedReport(null)} className="btn-ghost flex-1">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════ MODAL: NOVA CONSULTA ══════ */}
      {showApptModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 fade-in"
          style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-appt-title"
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div
              className="p-5 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #059669, #0ea5e9)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                  aria-hidden="true"
                >
                  <Stethoscope size={20} color="#fff" />
                </div>
                <h3 id="modal-appt-title" className="text-lg font-bold text-white">Agendar Consulta</h3>
              </div>
              <button
                onClick={() => setShowApptModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                aria-label="Fechar"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="p-5 space-y-4" style={{ background: 'var(--color-surface)' }}>
              <form
                onSubmit={e => { e.preventDefault(); setShowApptModal(false); toast('Consulta agendada com sucesso! Ambos os guardiões foram notificados.', 'success') }}
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
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Tipo *
                  </label>
                  <select className="input-field">
                    {Object.entries(apptTypeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Título *
                  </label>
                  <input type="text" className="input-field" placeholder="Ex: Consulta Pediatra de rotina" required autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      Médico / Prof.
                    </label>
                    <input type="text" className="input-field" placeholder="Dr. Nome" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      Data e hora *
                    </label>
                    <input type="datetime-local" className="input-field" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Local
                  </label>
                  <input type="text" className="input-field" placeholder="Clínica / Hospital" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Observações
                  </label>
                  <textarea className="input-field resize-none" rows={2} placeholder="Levar carteirinha, jejum, etc." />
                </div>
                <FileUpload
                  label="Anexo (receita, pedido de exame)"
                  accept="image/*,application/pdf"
                  hint="PDF ou imagem · máx 10 MB"
                />
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowApptModal(false)} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-gradient flex-1">
                    Agendar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════ MODAL: NOVO DOCUMENTO ══════ */}
      {showDocModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 fade-in"
          style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-doc-title"
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div
              className="p-5 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #059669, #0ea5e9)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                  aria-hidden="true"
                >
                  <FileText size={20} color="#fff" />
                </div>
                <h3 id="modal-doc-title" className="text-lg font-bold text-white">Adicionar Documento</h3>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                aria-label="Fechar"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="p-5" style={{ background: 'var(--color-surface)' }}>
              <form
                onSubmit={e => { e.preventDefault(); setShowDocModal(false); toast('Documento adicionado! Ambos os guardiões foram notificados.', 'success') }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Tipo de documento *
                  </label>
                  <select className="input-field">
                    {Object.entries(docTypeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Título *
                  </label>
                  <input type="text" className="input-field" placeholder="Ex: Boletim 1º bimestre 2026" required autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Descrição
                  </label>
                  <input type="text" className="input-field" placeholder="Informações adicionais" />
                </div>
                <FileUpload
                  label="Arquivo *"
                  accept="image/*,application/pdf"
                  hint="PDF ou imagem · máx 10 MB"
                />
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowDocModal(false)} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-gradient flex-1">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════ MODAL: DETALHE CONSULTA ══════ */}
      {selectedAppt && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 fade-in"
          style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
          aria-label={selectedAppt.title}
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div className="p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #059669, #0ea5e9)' }}>
              <h3 className="text-lg font-bold text-white">{selectedAppt.title}</h3>
              <button
                onClick={() => setSelectedAppt(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                aria-label="Fechar"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="p-5 space-y-3" style={{ background: 'var(--color-surface)' }}>
              {[
                { icon: <Calendar size={16} />, label: 'Data', value: format(parseISO(selectedAppt.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) },
                selectedAppt.doctor ? { icon: <User size={16} />, label: 'Profissional', value: selectedAppt.doctor } : null,
                selectedAppt.location ? { icon: <MapPin size={16} />, label: 'Local', value: selectedAppt.location } : null,
                selectedAppt.notes ? { icon: <FileText size={16} />, label: 'Observações', value: selectedAppt.notes } : null,
              ].filter(Boolean).map((item, i) => item && (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.label}</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.value}</p>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                {selectedAppt.status === 'AGENDADO' && (
                  <button
                    className="btn-gradient flex-1"
                    onClick={() => { setSelectedAppt(null); toast('Consulta marcada como realizada!', 'success') }}
                  >
                    Marcar realizada
                  </button>
                )}
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="btn-secondary"
                  style={{ flex: selectedAppt.status !== 'AGENDADO' ? 1 : '0 0 auto', padding: '0 16px' }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
