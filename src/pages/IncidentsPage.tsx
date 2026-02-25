import { useState, useMemo } from 'react'
import {
  AlertTriangle, Plus, X, Shield, FileText, Search,
  BarChart2, Download, Scale, TrendingUp, Filter,
  CheckCircle, Info,
} from 'lucide-react'
import { mockIncidents, mockChildren, mockAuthorizedPersons } from '../mocks'
import { useToast } from '../context/ToastContext'
import { format, parseISO, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { IncidentType, IncidentSeverity, Incident } from '../types'
import { SeverityBadge, HashBadge } from '../components/ui/Badge'
import { FileUpload } from '../components/ui/FileUpload'

/* ─── Type maps (aligned with F-06.02) ─── */
const incidentTypeLabels: Record<IncidentType, { label: string; description: string; color: string }> = {
  DESCUMPRIMENTO_VISITA:  { label: 'Descumprimento de Visita',   description: 'Não cumprimento de horários, falta sem justificativa, impedimento de visitas.', color: '#f59e0b' },
  COMUNICACAO_INADEQUADA: { label: 'Comunicação Inadequada',      description: 'Linguagem ofensiva, ameaças ou comportamentos inapropriados na comunicação.', color: '#0ea5e9' },
  ALIENACAO_PARENTAL:     { label: 'Alienação Parental',          description: 'Comportamentos que visam prejudicar a relação da criança com o outro responsável.', color: '#dc2626' },
  SAUDE_NEGLIGENCIADA:    { label: 'Saúde Negligenciada',         description: 'Situações de perigo físico, emocional ou psicológico para a criança.', color: '#7c3aed' },
  ESCOLAR:                { label: 'Questão Escolar',             description: 'Problemas relacionados à escola, boletins, frequência ou desenvolvimento.', color: '#059669' },
  FINANCEIRO:             { label: 'Descumprimento Financeiro',   description: 'Não pagamento de pensão, recusa de despesas essenciais.', color: '#d97706' },
  OUTROS:                 { label: 'Outros',                       description: 'Fatos relevantes não categorizados nos tipos anteriores.', color: '#6b7280' },
}

const severityStyle: Record<IncidentSeverity, { borderColor: string; iconColor: string; iconBg: string; label: string }> = {
  LOW:      { borderColor: 'var(--color-severity-low)',      iconColor: 'var(--color-severity-low)',      iconBg: 'var(--color-severity-low-bg)',      label: 'Baixa'    },
  MEDIUM:   { borderColor: 'var(--color-severity-medium)',   iconColor: 'var(--color-severity-medium)',   iconBg: 'var(--color-severity-medium-bg)',   label: 'Média'    },
  HIGH:     { borderColor: 'var(--color-severity-high)',     iconColor: 'var(--color-severity-high)',     iconBg: 'var(--color-severity-high-bg)',     label: 'Alta'     },
  CRITICAL: { borderColor: 'var(--color-severity-critical)', iconColor: 'var(--color-severity-critical)', iconBg: 'var(--color-severity-critical-bg)', label: 'Crítica'  },
}

const severityOrder: IncidentSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

/* ─── F-06.08: Bar chart ─── */
function IncidentsBarChart({ incidents }: { incidents: Incident[] }) {
  const months = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const d     = subMonths(new Date(), 5 - i)
      const start = startOfMonth(d)
      const end   = endOfMonth(d)
      const byType = Object.keys(incidentTypeLabels).reduce((acc, key) => {
        acc[key as IncidentType] = incidents.filter(inc =>
          inc.type === key &&
          isWithinInterval(parseISO(inc.reportedAt), { start, end })
        ).length
        return acc
      }, {} as Record<IncidentType, number>)
      return { label: format(d, 'MMM', { locale: ptBR }), total: incidents.filter(inc => isWithinInterval(parseISO(inc.reportedAt), { start, end })).length, byType }
    })
  , [incidents])

  const maxTotal = Math.max(...months.map(m => m.total), 1)

  return (
    <div>
      <div className="flex items-end gap-2 overflow-x-auto" style={{ height: 100 }}>
        {months.map((m, i) => {
          const h = Math.round((m.total / maxTotal) * 84)
          const isLast = i === months.length - 1
          return (
            <div key={m.label} className="flex flex-col items-center gap-1 flex-1 min-w-[36px]" title={`${m.label}: ${m.total} ocorrência(s)`}>
              {m.total > 0 && (
                <span className="text-xs font-bold" style={{ color: isLast ? 'var(--color-cancelado)' : 'var(--color-text-tertiary)', fontSize: 10 }}>{m.total}</span>
              )}
              <div className="w-full rounded-t" style={{ height: Math.max(h, 4), background: isLast ? 'linear-gradient(135deg, #dc2626, #f59e0b)' : 'var(--color-severity-high)', opacity: 0.8 }} />
              <span className="text-xs capitalize" style={{ color: 'var(--color-text-tertiary)', fontSize: 10 }}>{m.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── F-06.09: Export ─── */
function exportIncidents(incidents: Incident[]) {
  const lines = [
    'GUARDA360° — REGISTRO DE OCORRÊNCIAS',
    `Exportado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
    `Total: ${incidents.length} ocorrência(s)`,
    '─'.repeat(60),
    '',
  ]
  incidents.forEach(inc => {
    lines.push(`[${format(parseISO(inc.reportedAt), 'dd/MM/yyyy HH:mm:ss')}]`)
    lines.push(`Tipo: ${incidentTypeLabels[inc.type].label}`)
    lines.push(`Severidade: ${severityStyle[inc.severity].label}`)
    lines.push(`Título: ${inc.title}`)
    lines.push(`Narrativa: ${inc.narrative}`)
    lines.push(`Hash: ${inc.integrityHash}`)
    if (inc.evidences.length > 0) lines.push(`Evidências: ${inc.evidences.map(e => e.fileName).join(', ')}`)
    lines.push('')
  })
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `guarda360-ocorrencias-${format(new Date(), 'yyyyMMdd')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

type PageView = 'list' | 'analytics'

export default function IncidentsPage() {
  const [view, setView]                   = useState<PageView>('list')
  const [showModal, setShowModal]         = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<IncidentSeverity | 'ALL'>('ALL')
  const [filterType, setFilterType]       = useState<IncidentType | 'ALL'>('ALL')
  const [filterChild, setFilterChild]     = useState<string>('ALL')
  const [search, setSearch]               = useState('')
  const [formSeverity, setFormSeverity]   = useState<IncidentSeverity>('MEDIUM')
  const [lawyerNotified, setLawyerNotified] = useState(false)
  const { toast } = useToast()

  const filtered = useMemo(() =>
    mockIncidents
      .filter(i => filterSeverity === 'ALL' || i.severity === filterSeverity)
      .filter(i => filterType === 'ALL'     || i.type === filterType)
      .filter(i => filterChild === 'ALL'    || i.childId === filterChild)
      .filter(i => !search.trim() || i.title.toLowerCase().includes(search.toLowerCase()) || i.narrative.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const sevDiff = severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
        if (sevDiff !== 0) return sevDiff
        return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
      })
  , [filterSeverity, filterType, filterChild, search])

  const counts: Record<IncidentSeverity, number> = {
    CRITICAL: mockIncidents.filter(i => i.severity === 'CRITICAL').length,
    HIGH:     mockIncidents.filter(i => i.severity === 'HIGH').length,
    MEDIUM:   mockIncidents.filter(i => i.severity === 'MEDIUM').length,
    LOW:      mockIncidents.filter(i => i.severity === 'LOW').length,
  }

  /* F-06.08: pattern detection — >= 3 of same type in 30 days */
  const patternAlerts = useMemo(() => {
    const alerts: { type: IncidentType; count: number }[] = []
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    Object.keys(incidentTypeLabels).forEach(t => {
      const recent = mockIncidents.filter(i => i.type === t && parseISO(i.reportedAt) >= thirtyDaysAgo)
      if (recent.length >= 3) alerts.push({ type: t as IncidentType, count: recent.length })
    })
    return alerts
  }, [])

  /* Has lawyer linked? */
  const hasLawyer = mockAuthorizedPersons.some(ap => ap.role === 'ADVOGADO' && ap.status === 'ATIVO')

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    const isHighSeverity = formSeverity === 'HIGH' || formSeverity === 'CRITICAL'
    setShowModal(false)
    toast('Ocorrência registrada com hash de integridade gerado!', 'success')
    if (isHighSeverity && hasLawyer) {
      setTimeout(() => {
        setLawyerNotified(true)
        toast(`⚖️ Seu advogado foi notificado automaticamente (severidade ${severityStyle[formSeverity].label}).`, 'warning')
      }, 1200)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ─── HERO ─── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #dc2626 100%)', boxShadow: '0 6px 24px rgba(124,58,237,0.28)' }}
      >
        <div className="px-5 pt-4 pb-3 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight">Ocorrências & Incidentes</h2>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Registro formal com valor jurídico — imutável e auditável</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* F-06.08: toggle analytics */}
            <button
              onClick={() => setView(v => v === 'list' ? 'analytics' : 'list')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold"
              style={{ background: view === 'analytics' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)' }}
              aria-pressed={view === 'analytics'}
            >
              <BarChart2 size={14} />
              {view === 'analytics' ? 'Ver lista' : 'Análise'}
            </button>
            {/* F-06.09: Export */}
            <button
              onClick={() => { exportIncidents(filtered); toast('Exportação gerada!', 'success') }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)' }}
            >
              <Download size={14} />
              Exportar
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-white" style={{ color: '#7c3aed' }}>
              <Plus size={14} />
              Nova ocorrência
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-px px-5 py-4 text-white">
          {['CRITICAL','HIGH','MEDIUM','LOW'].map(s => {
            const ss = severityStyle[s as IncidentSeverity]
            return (
              <div key={s} className="text-center">
                <p className="text-2xl font-extrabold">{counts[s as IncidentSeverity]}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{ss.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── F-06.07: Lawyer notified banner ─── */}
      {lawyerNotified && (
        <div className="flex items-start gap-3 p-4 rounded-xl fade-in" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)' }} role="alert">
          <CheckCircle size={16} style={{ color: '#7c3aed', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-sm font-bold" style={{ color: '#7c3aed' }}>Advogado notificado</p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Seu advogado autorizado recebeu notificação automática por e-mail sobre a ocorrência de severidade alta/crítica. Isso ficará registrado no log de auditoria.
            </p>
          </div>
          <button onClick={() => setLawyerNotified(false)} className="ml-auto" aria-label="Fechar"><X size={14} style={{ color: '#7c3aed' }} /></button>
        </div>
      )}

      {/* ─── F-06.08: Pattern alerts ─── */}
      {patternAlerts.length > 0 && (
        <div className="space-y-2">
          {patternAlerts.map(alert => (
            <div key={alert.type} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }} role="alert">
              <Info size={14} style={{ color: 'var(--color-cancelado)', flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <strong>Padrão detectado:</strong> {alert.count} ocorrências de "{incidentTypeLabels[alert.type].label}" nos últimos 30 dias. Considere discutir com seu advogado.
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════
          VIEW: ANALYTICS (F-06.08)
      ══════════════════════════════ */}
      {view === 'analytics' && (
        <div className="space-y-4">
          <div className="card p-5" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} style={{ color: 'var(--color-cancelado)' }} />
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Ocorrências — Últimos 6 meses</h3>
            </div>
            <IncidentsBarChart incidents={mockIncidents} />
          </div>

          {/* Type distribution */}
          <div className="card p-5" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Distribuição por tipo</h3>
            <div className="space-y-2.5">
              {(Object.entries(incidentTypeLabels) as [IncidentType, { label: string; color: string; description: string }][]).map(([type, meta]) => {
                const count = mockIncidents.filter(i => i.type === type).length
                const pct   = mockIncidents.length > 0 ? Math.round((count / mockIncidents.length) * 100) : 0
                if (count === 0) return null
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{meta.label}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{count} · {pct}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'var(--color-border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Severity distribution */}
          <div className="grid grid-cols-2 gap-3">
            {(['CRITICAL','HIGH','MEDIUM','LOW'] as IncidentSeverity[]).map(s => {
              const ss  = severityStyle[s]
              const cnt = counts[s]
              return (
                <div key={s} className="card p-4 flex items-center gap-3" style={{ borderLeft: `4px solid ${ss.borderColor}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: ss.iconBg }}>
                    <AlertTriangle size={18} style={{ color: ss.iconColor }} />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold" style={{ color: ss.iconColor }}>{cnt}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Severidade {ss.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          VIEW: LIST (F-06.06)
      ══════════════════════════════ */}
      {view === 'list' && (
        <div className="space-y-4">
          {/* Severity quick filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['CRITICAL','HIGH','MEDIUM','LOW'] as IncidentSeverity[]).map(severity => {
              const ss = severityStyle[severity]
              const isActive = filterSeverity === severity
              return (
                <button
                  key={severity}
                  onClick={() => setFilterSeverity(prev => prev === severity ? 'ALL' : severity)}
                  className="card p-3 text-center card-hover"
                  style={{ borderLeftWidth: '3px', borderLeftColor: ss.borderColor, outline: isActive ? `2px solid ${ss.borderColor}` : undefined, outlineOffset: 2 }}
                  aria-pressed={isActive}
                >
                  <p className="text-2xl font-extrabold" style={{ color: ss.iconColor }}>{counts[severity]}</p>
                  <p className="text-caption mt-0.5">{ss.label}</p>
                </button>
              )
            })}
          </div>

          {/* F-06.06: Search + type filter */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="flex-1 relative" style={{ minWidth: 200 }}>
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar na narrativa ou título…"
                className="input-field pl-9"
                style={{ minHeight: '36px' }}
                aria-label="Buscar ocorrências"
              />
            </div>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as IncidentType | 'ALL')}
              className="input-field w-auto text-sm"
              style={{ minHeight: '36px' }}
              aria-label="Filtrar por tipo"
            >
              <option value="ALL">Todos os tipos</option>
              {(Object.entries(incidentTypeLabels) as [IncidentType, { label: string }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <select
              value={filterChild}
              onChange={e => setFilterChild(e.target.value)}
              className="input-field w-auto text-sm"
              style={{ minHeight: '36px' }}
              aria-label="Filtrar por filho"
            >
              <option value="ALL">Todos os filhos</option>
              {mockChildren.map(c => <option key={c.id} value={c.id}>{c.fullName.split(' ')[0]}</option>)}
            </select>

            {(filterSeverity !== 'ALL' || filterType !== 'ALL' || search) && (
              <button
                onClick={() => { setFilterSeverity('ALL'); setFilterType('ALL'); setSearch('') }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
              >
                <X size={14} />Limpar
              </button>
            )}
            <span className="text-caption ml-auto">{filtered.length} resultado(s)</span>
          </div>

          {/* List */}
          <div className="space-y-3" role="list">
            {filtered.length === 0 && (
              <div className="card p-8 text-center">
                <Shield size={32} style={{ color: 'var(--color-border-dark)' }} className="mx-auto mb-2" />
                <p className="text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>Nenhuma ocorrência encontrada</p>
              </div>
            )}

            {filtered.map(incident => {
              const ss   = severityStyle[incident.severity]
              const meta = incidentTypeLabels[incident.type]
              const child = mockChildren.find(c => c.id === incident.childId)

              return (
                <div
                  key={incident.id}
                  className="card p-4 card-hover cursor-pointer"
                  style={{ borderLeftWidth: '4px', borderLeftColor: ss.borderColor }}
                  onClick={() => setSelectedIncident(incident)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedIncident(incident) }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: ss.iconBg }} aria-hidden="true">
                      <AlertTriangle size={18} style={{ color: ss.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <SeverityBadge severity={incident.severity} />
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${meta.color}18`, color: meta.color }}>{meta.label}</span>
                          <time dateTime={incident.reportedAt} className="text-timestamp">
                            {format(parseISO(incident.reportedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </time>
                          <HashBadge hash={incident.integrityHash} />
                        </div>
                      </div>
                      <p className="text-h4 leading-snug" style={{ color: 'var(--color-text-primary)' }}>{incident.title}</p>
                      <p className="text-caption mt-0.5">{child ? `${child.fullName.split(' ')[0]}` : ''}</p>
                      <p className="text-legal mt-2 line-clamp-2" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                        {incident.narrative}
                      </p>
                      {incident.evidences.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <FileText size={13} style={{ color: 'var(--color-text-tertiary)' }} />
                          <span className="text-caption">{incident.evidences.length} evidência(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {selectedIncident && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 fade-in" style={{ zIndex: 'var(--z-modal)' }}>
          <div
            className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: 'var(--shadow-xl)', borderLeftWidth: '4px', borderLeftColor: severityStyle[selectedIncident.severity].borderColor }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <SeverityBadge severity={selectedIncident.severity} />
                  <HashBadge hash={selectedIncident.integrityHash} />
                </div>
                <h3 className="text-h4">{selectedIncident.title}</h3>
                <p className="text-caption mt-0.5">{incidentTypeLabels[selectedIncident.type].label}</p>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="btn-ghost p-0 w-9 h-9 rounded-lg flex-shrink-0" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Tooltip de tipo */}
              <div className="p-3 rounded-xl" style={{ background: `${incidentTypeLabels[selectedIncident.type].color}0D`, border: `1px solid ${incidentTypeLabels[selectedIncident.type].color}33` }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: incidentTypeLabels[selectedIncident.type].color }}>{incidentTypeLabels[selectedIncident.type].label}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{incidentTypeLabels[selectedIncident.type].description}</p>
              </div>

              <div>
                <p className="text-label mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Registrado em</p>
                <time dateTime={selectedIncident.reportedAt} className="text-timestamp">
                  {format(parseISO(selectedIncident.reportedAt), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                </time>
              </div>

              <div>
                <p className="text-label mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Narrativa</p>
                <p className="text-legal" style={{ color: 'var(--color-text-primary)' }}>{selectedIncident.narrative}</p>
              </div>

              {selectedIncident.evidences.length > 0 && (
                <div>
                  <p className="text-label mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Evidências ({selectedIncident.evidences.length})</p>
                  <div className="space-y-2">
                    {selectedIncident.evidences.map(ev => (
                      <div key={ev.id} className="flex items-center gap-2 p-2 rounded-md" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                        <FileText size={16} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{ev.fileName}</p>
                          <time dateTime={ev.uploadedAt} className="text-timestamp">{format(parseISO(ev.uploadedAt), 'dd/MM/yyyy HH:mm')}</time>
                        </div>
                        <HashBadge hash={ev.hash} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { toast('Exportando ocorrência…', 'info'); exportIncidents([selectedIncident]) }}
                className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1.5"
              >
                <Download size={14} />Exportar
              </button>
              <button onClick={() => setSelectedIncident(null)} className="btn-ghost flex-1 text-sm">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── New Incident Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 fade-in" style={{ zIndex: 'var(--z-modal)' }}>
          <div
            className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: 'var(--shadow-xl)' }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
                  <Scale size={18} style={{ color: '#7c3aed' }} />
                </div>
                <h3 className="text-h4">Registrar ocorrência</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-0 w-9 h-9 rounded-lg" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl flex items-start gap-2 mb-4" style={{ background: 'var(--color-cancelado-bg)', border: '1px solid var(--color-cancelado-border)' }} role="alert">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-cancelado)' }} />
              <span className="text-sm" style={{ color: 'var(--color-cancelado)' }}>
                <strong>Atenção:</strong> Registros são <strong>imutáveis</strong> e usados como evidência judicial.
              </span>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Filho</label>
                <select className="input-field">
                  {mockChildren.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
              </div>

              {/* F-06.02: Type with tooltip */}
              <div>
                <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Tipo de ocorrência *</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {(Object.entries(incidentTypeLabels) as [IncidentType, { label: string; description: string; color: string }][]).map(([key, meta]) => (
                    <label key={key} className="flex items-start gap-2 p-2.5 rounded-xl cursor-pointer transition-all" style={{ background: 'var(--color-surface-alt)', border: `1px solid var(--color-border)` }}>
                      <input type="radio" name="type" value={key} className="mt-0.5 flex-shrink-0" required />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{meta.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* F-06.03: Severity */}
              <div>
                <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Gravidade *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['LOW','MEDIUM','HIGH','CRITICAL'] as IncidentSeverity[]).map(s => {
                    const ss = severityStyle[s]
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormSeverity(s)}
                        className="py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: formSeverity === s ? ss.iconColor : ss.iconBg,
                          color: formSeverity === s ? '#fff' : ss.iconColor,
                          border: `1.5px solid ${ss.borderColor}`,
                        }}
                        aria-pressed={formSeverity === s}
                      >
                        {ss.label}
                      </button>
                    )
                  })}
                </div>
                {/* F-06.07: Lawyer notification warning */}
                {(formSeverity === 'HIGH' || formSeverity === 'CRITICAL') && hasLawyer && (
                  <div className="mt-2 flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <Scale size={13} style={{ color: '#7c3aed', flexShrink: 0, marginTop: 1 }} />
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      Seu advogado <strong>será notificado automaticamente</strong> ao registrar ocorrências de gravidade Alta ou Crítica.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Título *</label>
                <input type="text" className="input-field" placeholder="Título breve da ocorrência" required />
              </div>

              <div>
                <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Narrativa detalhada * <span className="font-normal text-xs">(máx. 5.000 caracteres)</span>
                </label>
                <textarea
                  className="input-field resize-none text-legal"
                  rows={5}
                  maxLength={5000}
                  placeholder="Descreva detalhadamente o ocorrido, com datas, horários e contexto…"
                  required
                />
                <p className="text-caption mt-1">Seja preciso e objetivo. Este texto será usado como evidência jurídica.</p>
              </div>

              {/* F-06.04: Evidence upload (up to 5 files) */}
              <div>
                <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Evidências <span className="font-normal text-xs">(até 5 arquivos, 20MB total)</span>
                </label>
                <FileUpload
                  label="Fotos, documentos, capturas de tela"
                  accept="image/*,application/pdf,.doc,.docx"
                  hint="Cada arquivo: fotos, PDFs, documentos ou capturas · máx 20 MB total"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="flex-1 py-2 px-4 rounded-xl font-bold text-white transition-all" style={{ background: 'linear-gradient(135deg, #7c3aed, #dc2626)' }}>
                  Registrar ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
