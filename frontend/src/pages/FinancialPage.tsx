import { useState, useMemo } from 'react'
import {
  DollarSign, Plus, X, CheckCircle, AlertTriangle, Clock,
  ThumbsUp, ThumbsDown, Receipt, Upload, Download, TrendingDown,
  TrendingUp, Bell, BellOff, BarChart2, AlertCircle, Calendar,
} from 'lucide-react'
import { mockAlimonyConfig, mockChildren } from '../mocks'
import { useFinancialSummary } from '../hooks/useFinancialSummary'
import { useToast } from '../context/ToastContext'
import { format, subMonths, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ExpenseCategory, PaymentStatus, ExpenseStatus, Expense } from '../types'
import { FileUpload } from '../components/ui/FileUpload'

/* ─── Label maps ─── */
const categoryLabels: Record<ExpenseCategory, string> = {
  MEDICO:  '🏥 Médico',
  ESCOLAR: '📚 Escolar',
  ESPORTE: '⚽ Esporte',
  LAZER:   '🎡 Lazer',
  OUTROS:  '📦 Outros',
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; badgeClass: string; color: string }> = {
  PAGO:     { label: 'Pago',     badgeClass: 'badge badge-confirmado', color: 'var(--color-confirmado)' },
  PENDENTE: { label: 'Pendente', badgeClass: 'badge badge-pendente',   color: 'var(--color-pendente)'   },
  ATRASADO: { label: 'Atrasado', badgeClass: 'badge badge-cancelado',  color: 'var(--color-cancelado)'  },
  PARCIAL:  { label: 'Parcial',  badgeClass: 'badge badge-pendente',   color: 'var(--color-pendente)'   },
}

const expenseStatusConfig: Record<ExpenseStatus, { label: string; tokenVar: string; icon: React.ReactNode }> = {
  PENDENTE:   { label: 'Pendente',   tokenVar: 'var(--color-pendente)',   icon: <Clock size={14} aria-hidden="true" /> },
  APROVADO:   { label: 'Aprovado',   tokenVar: 'var(--color-confirmado)', icon: <CheckCircle size={14} aria-hidden="true" /> },
  CONTESTADO: { label: 'Contestado', tokenVar: 'var(--color-cancelado)',  icon: <AlertTriangle size={14} aria-hidden="true" /> },
  PAGO:       { label: 'Pago',       tokenVar: 'var(--color-confirmado)', icon: <CheckCircle size={14} aria-hidden="true" /> },
}

type ActionModal = { expense: Expense; action: 'approve' | 'contest' }
type FinancialTab = 'resumo' | 'pensao' | 'despesas' | 'inadimplencia'

/* ─── F-04.07: 12-month bar chart ─── */
function MonthlyBarChart({ months }: { months: { label: string; paid: number; pending: number; expenses: number }[] }) {
  const maxVal = Math.max(...months.map(m => m.paid + m.pending + m.expenses), 1)
  const chartH = 120

  return (
    <div className="relative">
      <div className="flex items-end gap-1.5 overflow-x-auto pb-2" style={{ height: chartH + 30 }} aria-label="Gráfico financeiro 12 meses">
        {months.map((m, i) => {
          const paidH    = Math.round((m.paid    / maxVal) * chartH)
          const pendH    = Math.round((m.pending / maxVal) * chartH)
          const expH     = Math.round((m.expenses/ maxVal) * chartH)
          const isLast   = i === months.length - 1
          return (
            <div key={m.label} className="flex flex-col items-center gap-0.5 flex-1 min-w-[30px] group" title={`${m.label}: Pago R$${m.paid.toLocaleString('pt-BR')}`}>
              <div className="flex flex-col-reverse items-center w-full" style={{ height: chartH }}>
                {paidH > 0 && (
                  <div
                    className="w-full rounded-t transition-all"
                    style={{ height: paidH, background: isLast ? 'var(--foursys-gradient)' : 'var(--color-confirmado)', opacity: 0.85, borderRadius: '4px 4px 0 0' }}
                  />
                )}
                {pendH > 0 && (
                  <div className="w-full" style={{ height: pendH, background: 'var(--color-pendente)', opacity: 0.7 }} />
                )}
                {expH > 0 && (
                  <div className="w-full" style={{ height: expH, background: 'var(--color-primary)', opacity: 0.4 }} />
                )}
              </div>
              <p className="text-xs font-semibold" style={{ color: isLast ? 'var(--color-primary)' : 'var(--color-text-tertiary)', fontSize: '10px' }}>{m.label}</p>
            </div>
          )
        })}
      </div>
      {/* Legend */}
      <div className="flex gap-3 mt-2 flex-wrap">
        {[
          { color: 'var(--color-confirmado)', label: 'Pago' },
          { color: 'var(--color-pendente)',   label: 'Pendente' },
          { color: 'var(--color-primary)',    label: 'Despesas extras' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} aria-hidden="true" />
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── F-04.10: Export CSV ─── */
function exportFinancialCSV(payments: ReturnType<typeof useFinancialSummary>['payments'], expenses: ReturnType<typeof useFinancialSummary>['expenses']) {
  const rows = [
    ['Tipo', 'Descrição', 'Competência', 'Vencimento', 'Valor', 'Status'],
    ...payments.map(p => [
      'Pensão', `Pensão alimentícia — ${p.month}`, p.month, p.dueDate,
      (p.amountPaid ?? p.amount).toFixed(2), p.status,
    ]),
    ...expenses.map(e => [
      'Despesa', e.description, format(parseISO(e.createdAt), 'yyyy-MM'),
      e.createdAt.slice(0, 10), e.amount.toFixed(2), e.status,
    ]),
  ]
  const csv  = rows.map(r => r.join(';')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `guarda360-financeiro-${format(new Date(), 'yyyyMM')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function FinancialPage() {
  const [activeTab, setActiveTab]         = useState<FinancialTab>('resumo')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [actionModal, setActionModal]     = useState<ActionModal | null>(null)
  const [contestReason, setContestReason] = useState('')
  const [alertDays, setAlertDays]         = useState(3)
  const [alertEnabled, setAlertEnabled]   = useState(true)
  const { toast } = useToast()

  const {
    totalPaid,
    totalPending,
    totalExpenses,
    myExpenseShare: myShare,
    payments: mockAlimonyPayments,
    expenses: mockExpenses,
  } = useFinancialSummary()

  /* ─── F-04.07: 12-month data ─── */
  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d    = subMonths(new Date(), 11 - i)
      const key  = format(d, 'yyyy-MM')
      const label = format(d, 'MMM', { locale: ptBR })
      const p    = mockAlimonyPayments.find(pay => pay.month === key)
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        paid:     p?.status === 'PAGO'     ? (p.amountPaid ?? p.amount) : 0,
        pending:  p?.status === 'PENDENTE' || p?.status === 'ATRASADO' ? p.amount : 0,
        expenses: mockExpenses.filter(e => e.createdAt.startsWith(key) && e.status !== 'CONTESTADO').reduce((s, e) => s + e.amount * 0.5, 0),
      }
    })
  }, [mockAlimonyPayments, mockExpenses])

  /* ─── F-04.09: Delinquency timeline ─── */
  const delinquencyTimeline = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const d     = subMonths(new Date(), 11 - i)
      const key   = format(d, 'yyyy-MM')
      const label = format(d, 'MMMM yyyy', { locale: ptBR })
      const p     = mockAlimonyPayments.find(pay => pay.month === key)

      if (!p) return { key, label, status: 'SEM_DADOS' as const, amount: 0, daysLate: 0, fine: 0, interest: 0 }

      const due  = new Date(p.dueDate)
      const paid = p.paymentDate ? new Date(p.paymentDate) : null

      let status: 'PAGO_PRAZO' | 'PAGO_ATRASO' | 'EM_ABERTO' | 'SEM_DADOS' = 'EM_ABERTO'
      let daysLate = 0

      if (paid) {
        daysLate = Math.max(0, differenceInDays(paid, due))
        status = daysLate > 0 ? 'PAGO_ATRASO' : 'PAGO_PRAZO'
      } else {
        daysLate = Math.max(0, differenceInDays(new Date(), due))
        status = daysLate > 0 ? 'EM_ABERTO' : 'PAGO_PRAZO'
      }

      const amount   = p.amountPaid ?? p.amount
      const fine     = daysLate > 0 ? +(amount * 0.02).toFixed(2) : 0
      const interest = daysLate > 0 ? +(amount * 0.01 * Math.ceil(daysLate / 30)).toFixed(2) : 0

      return { key, label, status, amount, daysLate, fine, interest }
    })
    return months
  }, [mockAlimonyPayments])

  const totalDelinquency = delinquencyTimeline
    .filter(m => m.status === 'EM_ABERTO')
    .reduce((s, m) => s + m.amount + m.fine + m.interest, 0)

  const totalFines = delinquencyTimeline.reduce((s, m) => s + m.fine + m.interest, 0)

  const tabs: { id: FinancialTab; label: string; icon: React.ReactNode }[] = [
    { id: 'resumo',        label: 'Resumo',       icon: <BarChart2 size={15} /> },
    { id: 'pensao',        label: 'Pensão',        icon: <DollarSign size={15} /> },
    { id: 'despesas',      label: 'Despesas',      icon: <Receipt size={15} /> },
    { id: 'inadimplencia', label: 'Inadimplência', icon: <TrendingDown size={15} /> },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ─── HERO ─── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #0ea5e9 100%)', boxShadow: '0 6px 24px rgba(5,150,105,0.28)' }}
      >
        <div className="px-5 pt-4 pb-3 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight">Gestão Financeira</h2>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Pensão alimentícia e despesas extraordinárias</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportFinancialCSV(mockAlimonyPayments, mockExpenses)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)' }}
              aria-label="Exportar relatório financeiro"
            >
              <Download size={14} aria-hidden="true" />
              Exportar relatório
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-px px-5 py-4">
          {[
            { label: 'Pago (ano)',     value: `R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,    color: 'rgba(255,255,255,0.9)' },
            { label: 'Pendente',      value: `R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,  color: '#fde68a' },
            { label: 'Despesas',      value: `R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'rgba(255,255,255,0.8)' },
            { label: 'Em atraso',     value: `R$ ${totalDelinquency.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: '#fca5a5' },
          ].map(k => (
            <div key={k.label} className="text-center">
              <p className="text-base font-extrabold leading-none" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── TABS ─── */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }} role="tablist">
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === t.id ? 'var(--color-primary)' : 'transparent',
              color: activeTab === t.id ? '#fff' : 'var(--color-text-secondary)',
              boxShadow: activeTab === t.id ? '0 2px 8px rgba(29,78,216,0.3)' : 'none',
            }}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════
          TAB: RESUMO (F-04.07)
      ══════════════════════════════════ */}
      {activeTab === 'resumo' && (
        <div className="space-y-4" role="tabpanel" aria-label="Resumo financeiro">

          {/* 12-month chart */}
          <div className="card p-5" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 size={18} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Movimentação — Últimos 12 meses</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
                {new Date().getFullYear()}
              </span>
            </div>
            <MonthlyBarChart months={monthlyData} />
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Pensão do mês */}
            <div className="card p-4 space-y-2" style={{ boxShadow: 'var(--shadow-soft)' }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>Pensão — Este mês</p>
                <TrendingUp size={14} style={{ color: 'var(--color-confirmado)' }} aria-hidden="true" />
              </div>
              {(() => {
                const currentKey = format(new Date(), 'yyyy-MM')
                const p = mockAlimonyPayments.find(pay => pay.month === currentKey)
                const cfg = p ? paymentStatusConfig[p.status] : null
                return (
                  <>
                    <p className="text-2xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                      R$ {mockAlimonyConfig.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Vence dia {mockAlimonyConfig.dueDay}</p>
                      {cfg && <span className={cfg.badgeClass}>{cfg.label}</span>}
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Despesas pendentes */}
            <div className="card p-4 space-y-2" style={{ boxShadow: 'var(--shadow-soft)' }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>Despesas Pendentes</p>
                <Clock size={14} style={{ color: 'var(--color-pendente)' }} aria-hidden="true" />
              </div>
              <p className="text-2xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                {mockExpenses.filter(e => e.status === 'PENDENTE').length}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {mockExpenses.filter(e => e.status === 'PENDENTE').length === 0
                  ? 'Nenhuma pendente'
                  : `R$ ${mockExpenses.filter(e => e.status === 'PENDENTE').reduce((s, e) => s + e.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em aprovação`
                }
              </p>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="card p-5" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>Despesas por categoria (ano)</h3>
            <div className="space-y-2.5">
              {(Object.keys(categoryLabels) as ExpenseCategory[]).map(cat => {
                const total = mockExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
                const pct   = totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0
                if (total === 0) return null
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{categoryLabels[cat]}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} · {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--color-border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--foursys-gradient)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          TAB: PENSÃO (F-04.01, F-04.02, F-04.08)
      ══════════════════════════════════ */}
      {activeTab === 'pensao' && (
        <div className="space-y-4" role="tabpanel" aria-label="Pensão Alimentícia">

          {/* Config */}
          <div className="card p-5" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Configuração da pensão</h3>
              <span className="badge badge-confirmado">Ativa</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Valor',      value: `R$ ${mockAlimonyConfig.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
                { label: 'Vencimento', value: `Dia ${mockAlimonyConfig.dueDay}` },
                { label: 'Pagador',    value: 'João Pereira' },
                { label: 'Recebedor',  value: 'Maria Silva'  },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-tertiary)' }}>{item.label}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* F-04.08: Alert configuration */}
          <div className="card p-5 space-y-3" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} style={{ color: alertEnabled ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }} aria-hidden="true" />
                <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Alertas de vencimento</h3>
              </div>
              <button
                onClick={() => setAlertEnabled(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: alertEnabled ? 'var(--color-confirmado-bg)' : 'var(--color-surface-alt)',
                  color: alertEnabled ? 'var(--color-confirmado)' : 'var(--color-text-tertiary)',
                  border: `1px solid ${alertEnabled ? 'var(--color-confirmado-border)' : 'var(--color-border)'}`,
                }}
                aria-pressed={alertEnabled}
              >
                {alertEnabled ? <Bell size={11} /> : <BellOff size={11} />}
                {alertEnabled ? 'Ativo' : 'Desativado'}
              </button>
            </div>
            {alertEnabled && (
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>Alertar quantos dias antes do vencimento?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 7].map(d => (
                    <button
                      key={d}
                      onClick={() => { setAlertDays(d); toast(`Alerta configurado para ${d} dia(s) antes do vencimento.`, 'success') }}
                      className="py-2 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: alertDays === d ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                        color: alertDays === d ? '#fff' : 'var(--color-text-secondary)',
                        border: alertDays === d ? 'none' : '1px solid var(--color-border)',
                      }}
                      aria-pressed={alertDays === d}
                    >
                      {d} {d === 1 ? 'dia' : 'dias'}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                  Você receberá alertas por push e e-mail {alertDays} dia(s) antes e no dia do vencimento.
                </p>
              </div>
            )}
          </div>

          {/* Payments list */}
          <div className="card p-5" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Histórico de pagamentos</h3>
              <button onClick={() => setShowPaymentModal(true)} className="btn-primary flex items-center gap-1.5 text-sm py-1.5">
                <Upload size={14} aria-hidden="true" />
                Registrar pagamento
              </button>
            </div>
            <ul className="space-y-2" aria-label="Histórico de pagamentos">
              {mockAlimonyPayments.map(payment => {
                const config = paymentStatusConfig[payment.status]
                return (
                  <li key={payment.id} className="flex items-center justify-between p-3 rounded-xl transition-all" style={{ border: '1px solid var(--color-border)', borderLeft: `4px solid ${config.color}` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-surface-alt)' }} aria-hidden="true">
                        <span className="text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                          {format(new Date(payment.month + '-01'), 'MMM', { locale: ptBR }).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {format(new Date(payment.month + '-01'), 'MMMM yyyy', { locale: ptBR })}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Vence: {format(new Date(payment.dueDate), 'dd/MM/yyyy')}
                          {payment.paymentDate && ` · Pago: ${format(new Date(payment.paymentDate), 'dd/MM/yyyy')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                          R$ {(payment.amountPaid ?? payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {payment.receiptUrl && (
                          <a href={payment.receiptUrl} className="text-xs hover:underline" style={{ color: 'var(--color-primary)' }}>
                            Ver comprovante
                          </a>
                        )}
                      </div>
                      <span className={config.badgeClass}>{config.label}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          TAB: DESPESAS (F-04.04, F-04.05)
      ══════════════════════════════════ */}
      {activeTab === 'despesas' && (
        <div className="space-y-4" role="tabpanel" aria-label="Despesas Extraordinárias">
          <div className="flex justify-between items-center">
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Minha participação estimada:{' '}
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                R$ {myShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
            <button onClick={() => setShowExpenseModal(true)} className="btn-primary flex items-center gap-1.5 text-sm py-1.5">
              <Plus size={14} aria-hidden="true" />
              Nova despesa
            </button>
          </div>

          {mockExpenses.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--color-surface-alt)', border: '1px dashed var(--color-border-dark)' }}>
              <Receipt size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Nenhuma despesa cadastrada</p>
            </div>
          ) : (
            <ul className="space-y-3" aria-label="Despesas extraordinárias">
              {mockExpenses.map(expense => {
                const statusInfo = expenseStatusConfig[expense.status]
                const isPending  = expense.status === 'PENDENTE'
                return (
                  <li key={expense.id} className="card p-4" style={{ borderLeft: `4px solid ${statusInfo.tokenVar}` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm">{categoryLabels[expense.category]}</span>
                          <div className="flex items-center gap-1" style={{ color: statusInfo.tokenVar }}>
                            {statusInfo.icon}
                            <span className="text-xs font-medium">{statusInfo.label}</span>
                          </div>
                        </div>
                        <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{expense.description}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                          {format(new Date(expense.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                          {' · '}Divisão: {expense.payer1Share}% / {expense.payer2Share}%
                        </p>
                        {expense.contestedReason && (
                          <div className="mt-2 p-2 rounded-lg" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
                            <p className="text-xs" style={{ color: 'var(--color-cancelado)' }}>
                              <span className="font-semibold">Contestação:</span> {expense.contestedReason}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                          R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Minha parte: R$ {(expense.amount * expense.payer1Share / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    {isPending && (
                      <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <button
                          className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl text-sm font-semibold"
                          style={{ background: 'var(--color-confirmado-bg)', color: 'var(--color-confirmado)', border: '1px solid var(--color-confirmado-border)' }}
                          onClick={() => setActionModal({ expense, action: 'approve' })}
                        >
                          <ThumbsUp size={14} />Aprovar
                        </button>
                        <button
                          className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl text-sm font-semibold"
                          style={{ background: 'var(--color-cancelado-bg)', color: 'var(--color-cancelado)', border: '1px solid var(--color-cancelado-border)' }}
                          onClick={() => setActionModal({ expense, action: 'contest' })}
                        >
                          <ThumbsDown size={14} />Contestar
                        </button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {/* ══════════════════════════════════
          TAB: INADIMPLÊNCIA (F-04.09)
      ══════════════════════════════════ */}
      {activeTab === 'inadimplencia' && (
        <div className="space-y-4" role="tabpanel" aria-label="Histórico de inadimplência">

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total em aberto',   value: `R$ ${totalDelinquency.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,  color: 'var(--color-cancelado)',  bg: 'var(--color-cancelado-bg)',  icon: <AlertCircle size={18} /> },
              { label: 'Multas e juros',     value: `R$ ${totalFines.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,         color: 'var(--color-pendente)',   bg: 'var(--color-pendente-bg)',   icon: <TrendingDown size={18} /> },
              { label: 'Meses inadimplentes', value: `${delinquencyTimeline.filter(m => m.status === 'EM_ABERTO').length}`,           color: 'var(--color-primary)',    bg: 'var(--color-primary-muted)', icon: <Calendar size={18} /> },
            ].map(k => (
              <div key={k.label} className="card p-4 flex flex-col gap-1.5" style={{ boxShadow: 'var(--shadow-soft)', borderLeft: `4px solid ${k.color}` }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: k.bg, color: k.color }} aria-hidden="true">
                    {k.icon}
                  </div>
                </div>
                <p className="text-lg font-extrabold leading-none" style={{ color: 'var(--color-text-primary)' }}>{k.value}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{k.label}</p>
              </div>
            ))}
          </div>

          {/* Fine/interest notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)' }} role="note">
            <AlertCircle size={14} style={{ color: 'var(--color-cancelado)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Multa de <strong>2%</strong> e juros de <strong>1% ao mês</strong> são informativos. O cálculo jurídico exato deve ser feito pelo advogado.
              Este histórico pode ser exportado como evidência em processos de execução de alimentos.
            </p>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)' }}>
            {/* Header */}
            <div className="grid grid-cols-6 px-4 py-2.5" style={{ background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
              {['Mês', 'Status', 'Valor', 'Atraso', 'Multa', 'Juros'].map(h => (
                <p key={h} className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>{h}</p>
              ))}
            </div>

            {delinquencyTimeline.map((row, idx) => {
              const statusInfo: Record<string, { label: string; color: string; bg: string }> = {
                PAGO_PRAZO:  { label: 'Pago no prazo',    color: 'var(--color-confirmado)', bg: 'var(--color-confirmado-bg)' },
                PAGO_ATRASO: { label: 'Pago com atraso',  color: 'var(--color-pendente)',   bg: 'var(--color-pendente-bg)'   },
                EM_ABERTO:   { label: 'Em aberto',        color: 'var(--color-cancelado)',  bg: 'var(--color-cancelado-bg)'  },
                SEM_DADOS:   { label: 'Sem dados',        color: 'var(--color-text-tertiary)', bg: 'var(--color-surface-alt)' },
              }
              const si = statusInfo[row.status]
              return (
                <div
                  key={row.key}
                  className="grid grid-cols-6 px-4 py-3 items-center"
                  style={{
                    borderBottom: idx < delinquencyTimeline.length - 1 ? '1px solid var(--color-border)' : 'none',
                    background: row.status === 'EM_ABERTO' ? 'rgba(220,38,38,0.03)' : idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-alt)',
                  }}
                >
                  <p className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text-primary)' }}>{row.label}</p>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center" style={{ background: si.bg, color: si.color }}>
                    {si.label}
                  </span>
                  <p className="text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>
                    {row.amount > 0 ? `R$ ${row.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                  </p>
                  <p className="text-sm" style={{ color: row.daysLate > 0 ? 'var(--color-cancelado)' : 'var(--color-text-tertiary)' }}>
                    {row.daysLate > 0 ? `${row.daysLate}d` : '—'}
                  </p>
                  <p className="text-sm font-mono" style={{ color: row.fine > 0 ? 'var(--color-pendente)' : 'var(--color-text-tertiary)' }}>
                    {row.fine > 0 ? `R$ ${row.fine.toFixed(2)}` : '—'}
                  </p>
                  <p className="text-sm font-mono" style={{ color: row.interest > 0 ? 'var(--color-pendente)' : 'var(--color-text-tertiary)' }}>
                    {row.interest > 0 ? `R$ ${row.interest.toFixed(2)}` : '—'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ══ MODAL: Nova Despesa ══ */}
      {showExpenseModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 fade-in" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} role="dialog" aria-modal="true" aria-labelledby="modal-despesa-title">
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div className="p-5 flex items-center justify-between" style={{ background: 'var(--foursys-gradient)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true"><DollarSign size={20} color="#fff" /></div>
                <h3 id="modal-despesa-title" className="text-lg font-bold text-white">Nova despesa extraordinária</h3>
              </div>
              <button onClick={() => setShowExpenseModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} aria-label="Fechar"><X size={16} /></button>
            </div>
            <div className="p-5 max-h-[80vh] overflow-y-auto" style={{ background: 'var(--color-surface)' }}>
              <form onSubmit={e => { e.preventDefault(); setShowExpenseModal(false); toast('Despesa registrada! Co-guardião será notificado para aprovar em até 72h.', 'success') }} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Filho</label>
                  <select className="input-field">{mockChildren.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}</select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Categoria</label>
                  <select className="input-field">{Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Descrição *</label>
                  <input type="text" className="input-field" placeholder="Ex: Consulta médica ortodontia" required autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Valor (R$) *</label>
                  <input type="number" step="0.01" min="0" className="input-field" placeholder="0,00" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Minha parte (%)</label>
                    <input type="number" min="0" max="100" className="input-field" defaultValue="50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Outra parte (%)</label>
                    <input type="number" min="0" max="100" className="input-field" defaultValue="50" />
                  </div>
                </div>
                <FileUpload label="Nota fiscal / Comprovante" accept="image/*,application/pdf" hint="PDF ou imagem · máx 10 MB" />
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowExpenseModal(false)} className="btn-secondary flex-1">Cancelar</button>
                  <button type="submit" className="btn-gradient flex-1">Registrar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Registrar Pagamento ══ */}
      {showPaymentModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 fade-in" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} role="dialog" aria-modal="true" aria-labelledby="modal-pagamento-title">
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div className="p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #16a34a, #0ea5e9)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true"><Receipt size={20} color="#fff" /></div>
                <h3 id="modal-pagamento-title" className="text-lg font-bold text-white">Registrar Pagamento</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} aria-label="Fechar"><X size={16} /></button>
            </div>
            <div className="p-5" style={{ background: 'var(--color-surface)' }}>
              <form onSubmit={e => { e.preventDefault(); setShowPaymentModal(false); toast('Pagamento registrado com sucesso!', 'success') }} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Mês de referência *</label>
                  <input type="month" className="input-field" required autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Valor pago (R$) *</label>
                  <input type="number" step="0.01" min="0" className="input-field" defaultValue="1800.00" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Data de pagamento *</label>
                  <input type="date" className="input-field" required />
                </div>
                <FileUpload label="Comprovante bancário" accept="image/*,application/pdf" hint="PDF ou imagem · máx 10 MB" />
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-secondary flex-1">Cancelar</button>
                  <button type="submit" className="btn-gradient flex-1">Registrar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Aprovar / Contestar ══ */}
      {actionModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 fade-in" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div className="p-5 flex items-center justify-between" style={{ background: actionModal.action === 'approve' ? 'linear-gradient(135deg, #16a34a, #0ea5e9)' : 'linear-gradient(135deg, #dc2626, #f59e0b)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true">
                  {actionModal.action === 'approve' ? <ThumbsUp size={20} color="#fff" /> : <ThumbsDown size={20} color="#fff" />}
                </div>
                <h3 className="text-lg font-bold text-white">{actionModal.action === 'approve' ? 'Aprovar Despesa' : 'Contestar Despesa'}</h3>
              </div>
              <button onClick={() => { setActionModal(null); setContestReason('') }} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} aria-label="Fechar"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4" style={{ background: 'var(--color-surface)' }}>
              <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{actionModal.expense.description}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{categoryLabels[actionModal.expense.category]} · R$ {actionModal.expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              {actionModal.action === 'contest' && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Motivo da contestação *</label>
                  <textarea className="input-field resize-none" rows={3} placeholder="Explique o motivo..." value={contestReason} onChange={e => setContestReason(e.target.value)} required autoFocus />
                </div>
              )}
              {actionModal.action === 'approve' && (
                <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: 'var(--color-confirmado-bg)', border: '1px solid var(--color-confirmado-border)' }}>
                  <CheckCircle size={15} style={{ color: 'var(--color-confirmado)', flexShrink: 0, marginTop: 1 }} />
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Ao aprovar, você confirma que reconhece esta despesa como legítima e concorda com a divisão proposta.</p>
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setActionModal(null); setContestReason('') }} className="btn-secondary flex-1">Cancelar</button>
                <button
                  type="button"
                  disabled={actionModal.action === 'contest' && !contestReason.trim()}
                  style={{ opacity: actionModal.action === 'contest' && !contestReason.trim() ? 0.5 : 1 }}
                  className={actionModal.action === 'approve' ? 'btn-success flex-1' : 'btn-danger flex-1'}
                  onClick={() => {
                    setActionModal(null); setContestReason('')
                    toast(actionModal.action === 'approve' ? 'Despesa aprovada! Co-guardião notificado.' : 'Contestação registrada.', actionModal.action === 'approve' ? 'success' : 'warning')
                  }}
                >
                  {actionModal.action === 'approve' ? 'Confirmar aprovação' : 'Confirmar contestação'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
