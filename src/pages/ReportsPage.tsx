import { useState } from 'react'
import { FileText, Download, Clock, CheckCircle, AlertCircle, Plus, X, Scale, Shield, Filter, Eye } from 'lucide-react'
import { ReportPreviewModal } from '../components/reports/ReportPreviewModal'
import { mockReports, mockTimeline, mockChildren } from '../mocks'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Report, TimelineEntry } from '../types'
import { HashBadge } from '../components/ui/Badge'
import { useToast } from '../context/ToastContext'

const reportTypeLabels: Record<Report['type'], string> = {
  UNIFIED_TIMELINE: '📋 Timeline Unificada',
  FINANCIAL: '💰 Financeiro',
  INCIDENTS: '⚠️ Ocorrências',
  CALENDAR: '📅 Calendário',
  FULL: '📁 Relatório Completo',
}

const moduleColors: Record<TimelineEntry['module'], { bg: string; text: string; icon: string }> = {
  CALENDAR: { bg: 'rgba(29,78,216,0.08)', text: '#1D4ED8', icon: '📅' },
  CHAT: { bg: 'rgba(37,99,235,0.08)', text: '#2563EB', icon: '💬' },
  FINANCIAL: { bg: 'rgba(22,163,74,0.08)', text: '#16A34A', icon: '💰' },
  INCIDENT: { bg: 'rgba(220,38,38,0.08)', text: '#DC2626', icon: '⚠️' },
  AUTH: { bg: 'rgba(124,58,237,0.08)', text: '#7C3AED', icon: '🔐' },
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'timeline' | 'judicial'>('reports')
  const [showModal, setShowModal] = useState(false)
  const [judicialMode, setJudicialMode] = useState(false)
  const [filterChild, setFilterChild] = useState('ALL')
  const [filterLegal, setFilterLegal] = useState(false)
  const [previewReport, setPreviewReport] = useState<Report | null>(null)
  const { toast } = useToast()

  const filteredTimeline = mockTimeline
    .filter(t => filterChild === 'ALL' || t.childId === filterChild)
    .filter(t => !filterLegal || t.isLegallyRelevant)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Judicial Mode Banner ── */}
      {judicialMode && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(124,58,237,0.08))', border: '1.5px solid rgba(220,38,38,0.25)' }}
          role="alert"
        >
          <Scale size={18} style={{ color: 'var(--color-cancelado)', flexShrink: 0 }} aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: 'var(--color-cancelado)' }}>Modo Judicial Ativado</p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Apenas dados com valor jurídico comprovado e hash de integridade são exibidos. Todos os acessos são auditados.
            </p>
          </div>
          <button
            onClick={() => { setJudicialMode(false); toast('Modo judicial desativado.', 'info') }}
            className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(220,38,38,0.12)', color: 'var(--color-cancelado)' }}
          >
            Desativar
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="border-b border-[#E2E8F0] flex gap-0">
          {[
            { id: 'reports', label: 'Relatórios PDF' },
            { id: 'timeline', label: 'Timeline Unificada' },
            { id: 'judicial', label: '⚖️ Modo Judicial' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#1D4ED8] text-[#1D4ED8]'
                  : 'border-transparent text-[#6B7280] hover:text-[#374151]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {!judicialMode && (
            <button
              onClick={() => { setJudicialMode(true); setActiveTab('judicial'); toast('Modo judicial ativado. Todos os acessos serão auditados.', 'warning') }}
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all"
              style={{
                background: 'rgba(220,38,38,0.08)',
                color: 'var(--color-cancelado)',
                border: '1px solid rgba(220,38,38,0.2)',
              }}
            >
              <Scale size={14} aria-hidden="true" />
              Modo Judicial
            </button>
          )}
          <button onClick={() => setShowModal(true)} className="btn-gradient flex items-center gap-2 text-sm">
            <Plus size={14} aria-hidden="true" />
            Gerar relatório
          </button>
        </div>
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {mockReports.length === 0 && (
            <div className="card p-8 text-center">
              <FileText size={32} className="mx-auto text-[#CBD5E1] mb-2" />
              <p className="text-sm text-[#9CA3AF]">Nenhum relatório gerado ainda</p>
            </div>
          )}
          {mockReports.map(report => {
            const child = mockChildren.find(c => c.id === report.childId)
            return (
              <div key={report.id} className="card p-4 hover:shadow-hover transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[rgba(29,78,216,0.08)] flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-[#1D4ED8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-[#0F172A]">{report.title}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {reportTypeLabels[report.type]}
                          {child ? ` · ${child.fullName.split(' ')[0]}` : ''}
                          {' · Período: '}{report.period}
                        </p>
                      </div>
                      <ReportStatusBadge status={report.status} />
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-[#9CA3AF]">
                        Solicitado em {format(parseISO(report.requestedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                      {report.completedAt && (
                        <p className="text-xs text-[#9CA3AF]">
                          Gerado em {format(parseISO(report.completedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      )}
                    </div>

                    {report.integrityHash && (
                      <div className="mt-2">
                        <HashBadge hash={report.integrityHash} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="btn-secondary flex items-center gap-1.5 text-sm py-1.5"
                      aria-label="Pré-visualizar relatório"
                      onClick={() => { setPreviewReport(report) }}
                    >
                      <Eye size={14} aria-hidden="true" />
                      Preview
                    </button>
                    {report.status === 'READY' && report.pdfUrl && (
                      <button
                        className="btn-gradient flex items-center gap-1.5 text-sm py-1.5"
                        aria-label="Baixar relatório PDF"
                      >
                        <Download size={14} aria-hidden="true" />
                        PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={filterChild}
              onChange={e => setFilterChild(e.target.value)}
              className="input-field w-auto py-1.5 text-sm"
            >
              <option value="ALL">Todos os filhos</option>
              {mockChildren.map(c => <option key={c.id} value={c.id}>{c.fullName.split(' ')[0]}</option>)}
            </select>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filterLegal}
                onChange={e => setFilterLegal(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                ⭐ Somente relevantes
              </span>
            </label>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{filteredTimeline.length} evento(s)</p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-[#E2E8F0]" />

            <div className="space-y-4">
              {filteredTimeline.map(entry => {
                const mc = moduleColors[entry.module]
                return (
                  <div key={entry.id} className="relative flex gap-4 pl-14">
                    {/* Timeline dot */}
                    <div
                      className="absolute left-4 top-3 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: mc.text }}
                    />

                    {/* Content */}
                    <div className={`flex-1 card p-3 border-l-4`} style={{ borderLeftColor: mc.text }}>
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{mc.icon}</span>
                            <p className="font-semibold text-[#0F172A] text-sm">{entry.title}</p>
                            {entry.isLegallyRelevant && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.25)]">
                                ⭐ Relevante
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#374151] mt-0.5">{entry.description}</p>
                          <p className="text-xs text-[#9CA3AF] mt-1">
                            {entry.actor} · {format(parseISO(entry.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        {entry.hash && <HashBadge hash={entry.hash} />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ Judicial Tab ══ */}
      {activeTab === 'judicial' && (
        <div className="space-y-4">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #dc2626)', boxShadow: '0 6px 24px rgba(124,58,237,0.25)' }}
          >
            <div className="px-6 pt-5 pb-4 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true">
                  <Scale size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold">Pacote Judicial</h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Exportação de evidências com integridade verificável
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: '📋', label: 'Itens com hash', value: mockTimeline.filter(t => t.hash).length },
                  { icon: '⭐', label: 'Juridicamente relevantes', value: mockTimeline.filter(t => t.isLegallyRelevant).length },
                  { icon: '🔐', label: 'Relatórios prontos', value: mockReports.filter(r => r.status === 'READY').length },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-extrabold">{s.value}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Evidences with hash */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>
                Evidências com integridade verificada
              </p>
              <button
                className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--color-primary)' }}
                onClick={() => toast('Pacote judicial exportado! Arquivo ZIP gerado com todos os hashes.', 'success')}
              >
                <Download size={14} aria-hidden="true" />
                Exportar pacote ZIP
              </button>
            </div>
            <div className="space-y-2">
              {mockTimeline.filter(t => t.isLegallyRelevant || t.hash).map(entry => {
                const mc = moduleColors[entry.module]
                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3.5 rounded-xl"
                    style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderLeft: `4px solid ${mc.text}` }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base" style={{ background: mc.bg }}>
                      {mc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {entry.title}
                            {entry.isLegallyRelevant && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>⭐</span>
                            )}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{entry.description}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                            {entry.actor} · {format(parseISO(entry.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        {entry.hash && <HashBadge hash={entry.hash} />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Judicial notice */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}
            role="note"
          >
            <Shield size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Todos os dados exibidos neste painel possuem <strong>hash SHA-256</strong> de integridade imutável,
              gerado no momento do registro. Qualquer alteração posterior seria detectada. Os logs de acesso a este painel
              são auditados e registrados automaticamente.
            </p>
          </div>
        </div>
      )}

      {/* ══ Report Preview + Digital Signature Modal — rendered via extracted component ══ */}
      {previewReport && (
        <ReportPreviewModal
          report={previewReport}
          onClose={() => setPreviewReport(null)}
          onDownload={() => toast('Download do PDF iniciado!', 'success')}
          onSigned={() => toast('Relatório assinado digitalmente! Timestamp imutável registrado.', 'success')}
        />
      )}

      {/* New Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#0F172A]">Gerar relatório</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[#F1F5F9]">
                <X size={18} className="text-[#6B7280]" />
              </button>
            </div>
            <form onSubmit={e => { e.preventDefault(); setShowModal(false) }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Filho</label>
                <select className="input-field">
                  {mockChildren.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Tipo de relatório</label>
                <select className="input-field">
                  {Object.entries(reportTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Período</label>
                <input type="month" className="input-field" required />
              </div>
              <div className="p-3 rounded-md bg-[rgba(29,78,216,0.06)] border border-[rgba(29,78,216,0.15)] text-xs text-[#374151]">
                🔒 O relatório será gerado com hash SHA-256 de integridade e valor jurídico.
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Gerar relatório</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ReportStatusBadge({ status }: { status: Report['status'] }) {
  const config = {
    READY: { icon: <CheckCircle size={13} />, label: 'Pronto', className: 'bg-[rgba(22,163,74,0.08)] text-[#16A34A] border border-[rgba(22,163,74,0.25)]' },
    GENERATING: { icon: <Clock size={13} />, label: 'Gerando...', className: 'bg-[rgba(217,119,6,0.08)] text-[#D97706] border border-[rgba(217,119,6,0.25)]' },
    PENDING: { icon: <Clock size={13} />, label: 'Pendente', className: 'bg-[rgba(217,119,6,0.08)] text-[#D97706] border border-[rgba(217,119,6,0.25)]' },
    ERROR: { icon: <AlertCircle size={13} />, label: 'Erro', className: 'bg-[rgba(220,38,38,0.08)] text-[#DC2626] border border-[rgba(220,38,38,0.25)]' },
  }[status]

  return (
    <span className={`badge-status flex items-center gap-1 ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  )
}
