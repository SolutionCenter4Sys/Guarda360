/**
 * ReportPreviewModal — Preview de Relatórios + Assinatura Digital (F-07.01–07.04, F-07.10)
 *
 * Extracted from ReportsPage to respect SRP.
 * ReportsPage handles listing and generation; this component handles preview and signing.
 */
import { useState } from 'react'
import { FileText, Download, X, CheckCircle, Lock, PenLine } from 'lucide-react'
import type { Report } from '../../types'
import { HashBadge } from '../ui/Badge'

const REPORT_TYPE_LABELS: Record<Report['type'], string> = {
  UNIFIED_TIMELINE: '📋 Timeline Unificada',
  FINANCIAL:        '💰 Financeiro',
  INCIDENTS:        '⚠️ Ocorrências',
  CALENDAR:         '📅 Calendário',
  FULL:             '📁 Relatório Completo',
}

interface PreviewSection {
  title: string
  items: string[]
}

function buildPreviewContent(report: Report): PreviewSection[] {
  const childFirstName = 'filho(a)'

  if (report.type === 'CALENDAR') return [
    { title: '📅 Resumo de Convivência',  items: ['Total de eventos: 24', 'Confirmados: 19 (79%)', 'Faltas: 3 (12%)', 'Atrasos: 2 (8%)', 'Cancelamentos: 0'] },
    { title: '📆 Eventos por mês',        items: ['Jan/2026: 6 eventos — 5 confirmados, 1 falta', 'Fev/2026: 8 eventos — 7 confirmados, 1 atraso', 'Mar/2026: 10 eventos — 7 confirmados, 2 faltas'] },
    { title: '⚖️ Observações jurídicas',  items: [`${childFirstName} não foi entregue em 3 ocasiões previstas`, 'Todos os registros possuem check-in/check-out validado', 'Timestamps imutáveis registrados em servidor UTC'] },
  ]

  if (report.type === 'FINANCIAL') return [
    { title: '💰 Pensão Alimentícia',        items: ['Valor mensal: R$ 1.850,00', 'Período: Jan–Mar/2026', 'Pagamentos recebidos: 3/3 (100%)', 'Valor total: R$ 5.550,00'] },
    { title: '🧾 Despesas Extraordinárias',  items: ['Médico: R$ 420,00 (aprovado)', 'Escolar: R$ 380,00 (aprovado)', 'Esporte: R$ 150,00 (pendente)'] },
    { title: '⚠️ Inadimplência',             items: ['Nenhum mês com atraso no período selecionado', 'Score de adimplência: 100%'] },
  ]

  if (report.type === 'INCIDENTS') return [
    { title: '🚨 Ocorrências Registradas',  items: ['Total: 5 ocorrências no período', 'Críticas: 0 | Altas: 1 | Médias: 2 | Baixas: 2'] },
    { title: '📊 Distribuição por tipo',    items: ['Descumprimento de visita: 2 (40%)', 'Comunicação inadequada: 2 (40%)', 'Outros: 1 (20%)'] },
    { title: '📎 Evidências anexadas',      items: ['3 ocorrências possuem evidências em arquivo', '2 ocorrências possuem hash SHA-256 verificado', 'Advogado notificado em 1 ocorrência de gravidade alta'] },
  ]

  return [
    { title: '📋 Relatório Completo',  items: ['Calendário de convivência', 'Histórico financeiro', 'Ocorrências registradas', 'Timeline unificada de eventos'] },
    { title: '🔐 Integridade',         items: ['Todos os itens possuem hash SHA-256', 'Gerado com assinatura temporal do servidor', `Arquivo: ${report.id}.pdf`] },
  ]
}

/* ─── Signature sub-component ─── */
type SignatureStep = 'idle' | 'signing' | 'signed'

interface SignaturePanelProps {
  onSuccess: () => void
}

function SignaturePanel({ onSuccess }: SignaturePanelProps) {
  const [step, setStep]   = useState<SignatureStep>('idle')
  const [pin, setPin]     = useState('')

  const handleConfirm = () => {
    if (pin.length === 6) {
      setStep('signed')
      onSuccess()
    }
  }

  return (
    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
      <div className="flex items-center gap-2 mb-3">
        <PenLine size={15} style={{ color: 'var(--color-text-secondary)' }} aria-hidden="true" />
        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Assinatura Digital</p>
        {step === 'signed' && (
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--color-confirmado-bg)', color: 'var(--color-confirmado)' }}>
            <CheckCircle size={11} aria-hidden="true" /> Assinado
          </span>
        )}
      </div>

      {step === 'idle' && (
        <div>
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Ao assinar digitalmente, você certifica que as informações deste relatório são fidedignas
            e autoriza seu uso em processo judicial.
          </p>
          <div className="flex items-center gap-3 p-3 rounded-xl mb-3" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: 'var(--foursys-gradient)' }} aria-hidden="true">M</div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Maria Silva</p>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Responsável 1 · CPF 123.456.789-00</p>
            </div>
          </div>
          <button onClick={() => setStep('signing')} className="w-full btn-gradient flex items-center justify-center gap-2 text-sm">
            <PenLine size={15} aria-hidden="true" /> Assinar este relatório
          </button>
        </div>
      )}

      {step === 'signing' && (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Digite seu PIN de 6 dígitos para confirmar a assinatura digital:
          </p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            className="input-field text-center text-xl tracking-widest font-bold"
            aria-label="PIN de assinatura digital (6 dígitos)"
          />
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('idle')} className="btn-secondary flex-1 text-sm">Cancelar</button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pin.length < 6}
              className="btn-gradient flex-1 flex items-center justify-center gap-1.5 text-sm disabled:opacity-50"
            >
              <Lock size={14} aria-hidden="true" /> Confirmar assinatura
            </button>
          </div>
        </div>
      )}

      {step === 'signed' && (
        <div className="p-4 rounded-xl space-y-2" style={{ background: 'var(--color-confirmado-bg)', border: '1px solid color-mix(in srgb, var(--color-confirmado) 30%, transparent)' }}>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} style={{ color: 'var(--color-confirmado)' }} aria-hidden="true" />
            <p className="text-sm font-bold" style={{ color: 'var(--color-confirmado)' }}>Assinado com sucesso</p>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}><strong>Signatário:</strong> Maria Silva (CPF 123.456.789-00)</p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}><strong>Data/hora:</strong> {new Date().toLocaleString('pt-BR')}</p>
          <p className="text-xs font-mono truncate" style={{ color: 'var(--color-text-tertiary)' }}>Carimbo: SIG-{Date.now().toString(36).toUpperCase()}</p>
        </div>
      )}
    </div>
  )
}

/* ─── Main modal component ─── */
interface ReportPreviewModalProps {
  report:     Report
  onClose:    () => void
  onDownload: () => void
  onSigned:   () => void
}

export function ReportPreviewModal({ report, onClose, onDownload, onSigned }: ReportPreviewModalProps) {
  const sections = buildPreviewContent(report)

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 fade-in"
      style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{ background: 'var(--color-surface)', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="p-5 flex items-start justify-between gap-3" style={{ background: 'var(--foursys-gradient)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <p id="preview-modal-title" className="font-extrabold text-white text-base">{report.title}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {REPORT_TYPE_LABELS[report.type]} · Período: {report.period}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
            aria-label="Fechar preview"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {sections.map(section => (
            <div key={section.title}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                {section.title}
              </p>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm"
                    style={{
                      borderBottom:  i < section.items.length - 1 ? '1px solid var(--color-border)' : 'none',
                      color:         'var(--color-text-secondary)',
                      background:    i % 2 === 0 ? 'transparent' : 'var(--color-surface-alt)',
                    }}
                  >
                    <CheckCircle size={13} style={{ color: 'var(--color-confirmado)', flexShrink: 0 }} aria-hidden="true" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {report.integrityHash && (
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.15)' }}>
              <Lock size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>Hash SHA-256 de Integridade</p>
                <HashBadge hash={report.integrityHash} />
              </div>
            </div>
          )}

          <SignaturePanel onSuccess={onSigned} />

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-secondary flex-1 text-sm">Fechar</button>
            {report.status === 'READY' && (
              <button onClick={onDownload} className="btn-gradient flex items-center justify-center gap-1.5 flex-1 text-sm">
                <Download size={14} aria-hidden="true" /> Baixar PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
