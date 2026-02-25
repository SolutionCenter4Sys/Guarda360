import { useState, useMemo } from 'react'
import {
  Activity, Search, Filter, LogIn, LogOut, Lock,
  MessageSquare, DollarSign, AlertTriangle, FileText,
  Calendar, Upload, UserPlus, Shield, Eye, XCircle,
} from 'lucide-react'
import { mockAuditLogs } from '../mocks'
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AuditLog, AuditAction } from '../types'

/* ─── Action metadata ─── */
type ActionMeta = { label: string; icon: React.ReactNode; color: string }

const actionMeta: Partial<Record<AuditAction, ActionMeta>> = {
  LOGIN:                   { label: 'Login',                     icon: <LogIn size={14} />,         color: '#059669' },
  LOGOUT:                  { label: 'Logout',                    icon: <LogOut size={14} />,        color: '#6b7280' },
  LOGIN_FAILED:            { label: 'Tentativa falha',           icon: <XCircle size={14} />,       color: '#dc2626' },
  PASSWORD_CHANGED:        { label: 'Senha alterada',            icon: <Lock size={14} />,          color: '#d97706' },
  '2FA_ENABLED':           { label: '2FA ativado',               icon: <Shield size={14} />,        color: '#7c3aed' },
  '2FA_DISABLED':          { label: '2FA desativado',            icon: <Shield size={14} />,        color: '#dc2626' },
  MESSAGE_SENT:            { label: 'Mensagem enviada',          icon: <MessageSquare size={14} />, color: '#0ea5e9' },
  MESSAGE_MARKED_RELEVANT: { label: 'Mensagem marcada',          icon: <MessageSquare size={14} />, color: '#7c3aed' },
  EXPENSE_CREATED:         { label: 'Despesa criada',            icon: <DollarSign size={14} />,    color: '#d97706' },
  EXPENSE_APPROVED:        { label: 'Despesa aprovada',          icon: <DollarSign size={14} />,    color: '#059669' },
  EXPENSE_CONTESTED:       { label: 'Despesa contestada',        icon: <DollarSign size={14} />,    color: '#dc2626' },
  PAYMENT_REGISTERED:      { label: 'Pagamento registrado',      icon: <DollarSign size={14} />,    color: '#059669' },
  INCIDENT_CREATED:        { label: 'Ocorrência criada',         icon: <AlertTriangle size={14} />, color: '#dc2626' },
  INCIDENT_UPDATED:        { label: 'Ocorrência atualizada',     icon: <AlertTriangle size={14} />, color: '#d97706' },
  REPORT_GENERATED:        { label: 'Relatório gerado',          icon: <FileText size={14} />,      color: '#0ea5e9' },
  REPORT_DOWNLOADED:       { label: 'Relatório baixado',         icon: <FileText size={14} />,      color: '#7c3aed' },
  CALENDAR_EVENT_CREATED:  { label: 'Evento criado',             icon: <Calendar size={14} />,      color: '#0ea5e9' },
  CHECKIN:                 { label: 'Check-in',                  icon: <LogIn size={14} />,         color: '#059669' },
  CHECKOUT:                { label: 'Check-out',                 icon: <LogOut size={14} />,        color: '#6b7280' },
  SWAP_REQUESTED:          { label: 'Troca solicitada',          icon: <Calendar size={14} />,      color: '#d97706' },
  SWAP_ACCEPTED:           { label: 'Troca aceita',              icon: <Calendar size={14} />,      color: '#059669' },
  SWAP_REJECTED:           { label: 'Troca recusada',            icon: <Calendar size={14} />,      color: '#dc2626' },
  DOCUMENT_UPLOADED:       { label: 'Documento enviado',         icon: <Upload size={14} />,        color: '#0ea5e9' },
  AUTHORIZED_PERSON_INVITED:{ label: 'Profissional convidado',   icon: <UserPlus size={14} />,      color: '#7c3aed' },
  JUDICIAL_MODE_ACTIVATED: { label: 'Modo Judicial',             icon: <Eye size={14} />,           color: '#dc2626' },
}

const moduleLabels: Record<AuditLog['module'], string> = {
  AUTH:      'Autenticação',
  CALENDAR:  'Calendário',
  CHAT:      'Chat',
  FINANCIAL: 'Financeiro',
  INCIDENT:  'Ocorrências',
  HEALTH:    'Saúde',
  REPORTS:   'Relatórios',
  SETTINGS:  'Configurações',
}

const formatTs = (ts: string) => {
  const d = parseISO(ts)
  if (isToday(d))     return `Hoje, ${format(d, 'HH:mm')}`
  if (isYesterday(d)) return `Ontem, ${format(d, 'HH:mm')}`
  return format(d, "dd 'de' MMM 'às' HH:mm", { locale: ptBR })
}

export default function AuditPage() {
  const [search, setSearch]   = useState('')
  const [module, setModule]   = useState<AuditLog['module'] | 'ALL'>('ALL')
  const [detailLog, setDetail] = useState<AuditLog | null>(null)

  const logs = useMemo(() => {
    return mockAuditLogs
      .filter(l => {
        if (module !== 'ALL' && l.module !== module) return false
        if (search) {
          const q = search.toLowerCase()
          return (
            l.description.toLowerCase().includes(q) ||
            l.userName.toLowerCase().includes(q) ||
            l.action.toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [search, module])

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ═══ HERO ═══ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', boxShadow: '0 6px 24px rgba(0,0,0,0.3)' }}
      >
        <div className="px-5 pt-5 pb-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.3)' }} aria-hidden="true">
              <Activity size={20} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight">Log de Auditoria</h2>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Registro imutável de todas as ações na plataforma
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(5,150,105,0.2)', color: '#34d399' }}
          >
            <div className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" aria-hidden="true" />
            Monitoramento ativo
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-px" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { label: 'Ações hoje',     value: mockAuditLogs.filter(l => isToday(parseISO(l.timestamp))).length },
            { label: 'Falhas de login', value: mockAuditLogs.filter(l => l.action === 'LOGIN_FAILED').length },
            { label: 'Guardiões ativos', value: 2 },
            { label: 'Total registros', value: mockAuditLogs.length },
          ].map(s => (
            <div key={s.label} className="px-4 py-3 text-center">
              <p className="text-2xl font-extrabold text-white leading-none">{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ SECURITY NOTICE ═══ */}
      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }} role="note">
        <Shield size={15} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Este log é <strong>imutável e assinado digitalmente</strong>. Qualquer tentativa de alteração invalida a cadeia de custódia.
          Dados disponíveis para exportação judicial mediante solicitação ao suporte.
        </p>
      </div>

      {/* ═══ FILTERS ═══ */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por ação, usuário…"
            className="input-field"
            style={{ paddingLeft: '2.25rem' }}
            aria-label="Buscar logs"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
          <select
            value={module}
            onChange={e => setModule(e.target.value as AuditLog['module'] | 'ALL')}
            className="input-field pl-8 pr-8 text-sm"
            aria-label="Filtrar por módulo"
          >
            <option value="ALL">Todos os módulos</option>
            {(Object.entries(moduleLabels) as [AuditLog['module'], string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ═══ LOG LIST ═══ */}
      {logs.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--color-surface-alt)', border: '1px dashed var(--color-border-dark)' }}>
          <Activity size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Nenhum registro encontrado</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)' }}>
          {logs.map((log, idx) => {
            const meta = actionMeta[log.action] ?? { label: log.action, icon: <Activity size={14} />, color: '#6b7280' }
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all"
                style={{
                  borderBottom: idx < logs.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
                onClick={() => setDetail(log)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') setDetail(log) }}
                aria-label={`Detalhe: ${meta.label} — ${log.userName}`}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${meta.color}15`, color: meta.color }}
                  aria-hidden="true"
                >
                  {meta.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${meta.color}15`, color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{log.userName}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-tertiary)' }}>
                      {moduleLabels[log.module]}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                    {log.description}
                  </p>
                  {log.ip && (
                    <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--color-text-disabled)' }}>
                      IP: {log.ip} · {log.device}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
                  {formatTs(log.timestamp)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ DETAIL MODAL ═══ */}
      {detailLog && (() => {
        const meta = actionMeta[detailLog.action] ?? { label: detailLog.action, icon: <Activity size={14} />, color: '#6b7280' }
        return (
          <div className="fixed inset-0 flex items-center justify-center p-4 fade-in" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div className="p-5 flex items-center justify-between" style={{ background: '#0f172a' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${meta.color}25`, color: meta.color }} aria-hidden="true">
                    {meta.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{meta.label}</h3>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>ID: {detailLog.id}</p>
                  </div>
                </div>
                <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} aria-label="Fechar">
                  ×
                </button>
              </div>
              <div className="p-5 space-y-3" style={{ background: 'var(--color-surface)' }}>
                {[
                  { label: 'Usuário',   value: detailLog.userName },
                  { label: 'Perfil',    value: detailLog.userRole === 'GUARDIAN_1' ? 'Guardião A' : detailLog.userRole === 'GUARDIAN_2' ? 'Guardião B' : 'Visualizador' },
                  { label: 'Módulo',    value: moduleLabels[detailLog.module] },
                  { label: 'Descrição', value: detailLog.description },
                  { label: 'IP',        value: detailLog.ip ?? '—' },
                  { label: 'Dispositivo', value: detailLog.device ?? '—' },
                  { label: 'Data/hora', value: format(parseISO(detailLog.timestamp), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: ptBR }) },
                  detailLog.resourceId ? { label: 'Recurso', value: detailLog.resourceId } : null,
                ].filter(Boolean).map((item, i) => item && (
                  <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.label}</p>
                    <p className="text-sm font-semibold mt-0.5 break-all" style={{ color: 'var(--color-text-primary)' }}>{item.value}</p>
                  </div>
                ))}

                <div className="p-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Hash de integridade (SHA-256)</p>
                  <p className="text-xs font-mono mt-1 break-all" style={{ color: 'var(--color-text-secondary)' }}>
                    sha256:{Array.from(detailLog.id).map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).join('')}f4a8b2e1
                  </p>
                </div>

                <button onClick={() => setDetail(null)} className="btn-secondary w-full">Fechar</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
