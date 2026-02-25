import {
  Calendar, MessageSquare, AlertTriangle, DollarSign,
  Clock, CheckCircle2, ChevronRight, Shield, TrendingUp,
  TrendingDown, GraduationCap, ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { StatusBadge, SeverityBadge, PaymentBadge, HashBadge } from '../components/ui/Badge'
import { mockCalendarEvents, mockChildren } from '../mocks'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/* ── Circular progress ring ── */
function ComplianceRing({ pct }: { pct: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const color = pct >= 80 ? 'var(--color-confirmado)' : pct >= 50 ? 'var(--color-pendente)' : 'var(--color-cancelado)'

  return (
    <div className="relative flex items-center justify-center" style={{ width: 88, height: 88 }} aria-hidden="true">
      <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="7" />
        <circle
          cx="44" cy="44" r={r} fill="none"
          stroke="#fff" strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-extrabold text-white leading-none">{pct}%</span>
        <span className="text-xs text-white/70 font-medium mt-0.5">visitas</span>
      </div>
    </div>
  )
}

/* ── KPI card redesenhado ── */
interface KpiProps {
  label: string
  value: string | number
  sub: string
  icon: React.ReactNode
  accent: string
  accentBg: string
  trend?: { up: boolean; text: string }
  progress?: number
}
function KpiCard({ label, value, sub, icon, accent, accentBg, trend, progress }: KpiProps) {
  return (
    <div
      className="card p-4 flex flex-col gap-3 relative overflow-hidden"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {/* Icon */}
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: accentBg, color: accent }}
          aria-hidden="true"
        >
          {icon}
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: trend.up ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
              color: trend.up ? 'var(--color-confirmado)' : 'var(--color-cancelado)',
            }}
          >
            {trend.up ? <TrendingUp size={11} aria-hidden="true" /> : <TrendingDown size={11} aria-hidden="true" />}
            {trend.text}
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-3xl font-extrabold leading-none" style={{ color: accent }}>{value}</p>
        <p className="text-label mt-1" style={{ color: 'var(--color-text-tertiary)' }}>{label}</p>
        <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-text-tertiary)' }}>{sub}</p>
      </div>

      {/* Progress bar (optional) */}
      {progress !== undefined && (
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: accent }}
          />
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const {
    visitCompliance,
    unreadMessages,
    openIncidents,
    nextVisit,
    recentIncidents,
    recentPayments,
  } = useDashboardStats()

  const daysToNextVisit = nextVisit
    ? Math.max(0, differenceInDays(parseISO(nextVisit.startAt), new Date()))
    : null

  const visitEvents = mockCalendarEvents.slice(0, 14)
  const guardianName = user?.role === 'GUARDIAN_1' ? 'Responsável 1' : 'Responsável 2'

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ══════════════ HERO HEADER ══════════════ */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap overflow-hidden relative"
        style={{
          background: 'var(--foursys-gradient)',
          boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
          minHeight: 140,
        }}
        role="banner"
      >
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', right: -40, top: -40,
            width: 200, height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', right: 60, bottom: -60,
            width: 160, height: 160,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />

        {/* Left: greeting */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
          >
            <Shield size={12} color="#fff" aria-hidden="true" />
            <span className="text-xs font-semibold text-white">{guardianName}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white leading-tight">
            Olá, {user?.fullName?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>

          {/* Quick stats row */}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            {[
              { icon: <CheckCircle2 size={13} aria-hidden="true" />, text: `${visitCompliance}% visitas cumpridas` },
              { icon: <MessageSquare size={13} aria-hidden="true" />, text: `${unreadMessages} msg não lida(s)` },
              { icon: <AlertTriangle size={13} aria-hidden="true" />, text: `${openIncidents} ocorrência(s) abertas` },
            ].map(s => (
              <div
                key={s.text}
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: 'rgba(255,255,255,0.85)' }}
              >
                {s.icon}
                {s.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right: compliance ring */}
        <div style={{ position: 'relative', zIndex: 1 }} aria-label={`Cumprimento de visitas: ${visitCompliance}%`}>
          <ComplianceRing pct={visitCompliance} />
        </div>
      </div>

      {/* ══════════════ KPI GRID ══════════════ */}
      <section aria-label="Métricas principais">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Cumprimento de visitas"
            value={`${visitCompliance}%`}
            sub="Este mês"
            icon={<Calendar size={20} />}
            accent="var(--color-primary)"
            accentBg="rgba(29,78,216,0.08)"
            trend={{ up: true, text: '+5%' }}
            progress={visitCompliance}
          />
          <KpiCard
            label="Mensagens não lidas"
            value={unreadMessages}
            sub="Aguardando resposta"
            icon={<MessageSquare size={20} />}
            accent="var(--color-confirmado)"
            accentBg="rgba(22,163,74,0.08)"
          />
          <KpiCard
            label="Ocorrências abertas"
            value={openIncidents}
            sub="Requerem atenção"
            icon={<AlertTriangle size={20} />}
            accent="var(--color-pendente)"
            accentBg="rgba(217,119,6,0.08)"
            trend={{ up: false, text: '−1 resolvida' }}
          />
          <KpiCard
            label="Pensão alimentícia"
            value="R$ 1.200"
            sub="Venc. 05/03 · Em dia"
            icon={<DollarSign size={20} />}
            accent="var(--color-confirmado)"
            accentBg="rgba(22,163,74,0.08)"
            trend={{ up: true, text: 'Em dia' }}
          />
        </div>
      </section>

      {/* ══════════════ MIDDLE ROW ══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ─── Next Visit (3 cols) ─── */}
        <section className="lg:col-span-3 card p-5" aria-label="Próxima visita">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h4" style={{ color: 'var(--color-text-primary)' }}>Próxima visita</h3>
            <button
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: 'var(--color-primary)' }}
            >
              Ver calendário <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>

          {nextVisit ? (
            <div
              className="rounded-xl p-4 mb-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, var(--color-guardian-a-bg) 0%, rgba(255,255,255,0) 100%)',
                border: '1px solid var(--color-guardian-a-border)',
              }}
            >
              {/* Countdown chip */}
              {daysToNextVisit !== null && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3"
                  style={{
                    background: daysToNextVisit === 0 ? 'var(--color-confirmado)' : 'var(--color-guardian-a)',
                    color: '#fff',
                  }}
                >
                  <Clock size={11} aria-hidden="true" />
                  {daysToNextVisit === 0 ? 'Hoje!' : `Em ${daysToNextVisit} dia(s)`}
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
                    {nextVisit.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Clock size={13} style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                    <time dateTime={nextVisit.startAt} className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {format(parseISO(nextVisit.startAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </time>
                  </div>
                </div>
                <StatusBadge status={nextVisit.status} />
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  className="btn-gradient flex-1"
                  onClick={() => toast('Check-in registrado com sucesso!', 'success')}
                >
                  Check-in
                </button>
                <button className="btn-secondary">Detalhes</button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl p-6 text-center mb-4"
              style={{ background: 'var(--color-surface-alt)', border: '1px dashed var(--color-border-dark)' }}
            >
              <Calendar size={28} className="mx-auto mb-2" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                Nenhuma visita agendada
              </p>
            </div>
          )}

          {/* ─── Visit heatmap ─── */}
          <div>
            <p className="text-label mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
              Histórico do mês
            </p>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
              {visitEvents.map((evt, i) => {
                const status = evt.status
                const bg =
                  status === 'CONFIRMADO' ? 'var(--color-confirmado)' :
                  status === 'FALTA'      ? 'var(--color-cancelado)'  :
                  status === 'ATRASO'     ? 'var(--color-atraso)'     :
                  status === 'CANCELADO'  ? 'var(--color-cancelado)'  :
                  'var(--color-border)'
                return (
                  <div
                    key={evt.id}
                    className="rounded-lg flex items-center justify-center text-white"
                    style={{ aspectRatio: '1', background: bg, fontSize: 11, fontWeight: 700 }}
                    title={`${evt.title} — ${status}`}
                    aria-label={`Visita ${i + 1}: ${status}`}
                  >
                    {status === 'CONFIRMADO'
                      ? <CheckCircle2 size={14} aria-hidden="true" />
                      : <span style={{ color: status === 'PENDENTE' ? 'var(--color-text-tertiary)' : '#fff' }}>{i + 1}</span>
                    }
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 mt-2.5 flex-wrap">
              {[
                { color: 'var(--color-confirmado)', label: 'Cumprida' },
                { color: 'var(--color-cancelado)',  label: 'Falta' },
                { color: 'var(--color-atraso)',     label: 'Atraso' },
                { color: 'var(--color-border)',     label: 'Pendente' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: color }} aria-hidden="true" />
                  <span className="text-caption">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Children (2 cols) ─── */}
        <section className="lg:col-span-2 card p-5 flex flex-col" aria-label="Filhos cadastrados">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h4" style={{ color: 'var(--color-text-primary)' }}>Filhos</h3>
            <button
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: 'var(--color-primary)' }}
            >
              Ver todos <ArrowRight size={13} aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {mockChildren.map((child, idx) => {
              const age = Math.floor((Date.now() - new Date(child.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))
              const childCompliance = idx === 0 ? 80 : 60
              const compColor = childCompliance >= 75 ? 'var(--color-confirmado)' : 'var(--color-pendente)'

              return (
                <div
                  key={child.id}
                  className="rounded-xl p-3 cursor-pointer card-hover"
                  style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center font-bold text-white text-base"
                      style={{
                        width: 44, height: 44,
                        borderRadius: '50%',
                        background: idx === 0 ? 'var(--foursys-gradient)' : 'linear-gradient(135deg, #DB2777 0%, #9A1BFF 100%)',
                        boxShadow: '0 3px 8px rgba(124,58,237,0.25)',
                      }}
                      aria-hidden="true"
                    >
                      {child.fullName.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {child.fullName.split(' ')[0]} {child.fullName.split(' ').slice(-1)[0]}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-xs font-medium px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(29,78,216,0.08)', color: 'var(--color-primary)' }}
                        >
                          {age} anos
                        </span>
                        <div className="flex items-center gap-1 min-w-0">
                          <GraduationCap size={11} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} aria-hidden="true" />
                          <span className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                            {child.schoolName.split(' ').slice(0, 2).join(' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mini compliance bar */}
                  <div className="mt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Cumprimento</span>
                      <span className="text-xs font-bold" style={{ color: compColor }}>{childCompliance}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${childCompliance}%`, background: compColor }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick action */}
          <button
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2 text-sm"
          >
            <Shield size={14} aria-hidden="true" />
            Registrar ocorrência
          </button>
        </section>
      </div>

      {/* ══════════════ BOTTOM ROW ══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ─── Alimony payments ─── */}
        <section className="card p-5" aria-label="Pagamentos de pensão alimentícia">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h4" style={{ color: 'var(--color-text-primary)' }}>Pensão alimentícia</h3>
            <button className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
              Ver extrato →
            </button>
          </div>
          <div className="space-y-1">
            {recentPayments.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
                style={{
                  background: i % 2 === 0 ? 'var(--color-surface-alt)' : 'transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(29,78,216,0.07)', color: 'var(--color-primary)' }}
                    aria-hidden="true"
                  >
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      R$ {p.amount.toFixed(2).replace('.', ',')}
                    </p>
                    <time dateTime={p.paymentDate ?? p.dueDate} className="text-timestamp">
                      {format(parseISO(p.paymentDate ?? p.dueDate), 'MMM/yyyy', { locale: ptBR }).toUpperCase()}
                    </time>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.receiptUrl && <HashBadge hash={`sha256:${p.id.slice(-8)}abc`} />}
                  <PaymentBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Recent incidents ─── */}
        <section className="card p-5" aria-label="Ocorrências recentes">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h4" style={{ color: 'var(--color-text-primary)' }}>Ocorrências recentes</h3>
            <button className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
              Ver todas →
            </button>
          </div>
          <div className="space-y-2.5">
            {recentIncidents.map(inc => {
              const sevColor =
                inc.severity === 'CRITICAL' ? 'var(--color-severity-critical)' :
                inc.severity === 'HIGH'     ? 'var(--color-severity-high)'     :
                inc.severity === 'MEDIUM'   ? 'var(--color-severity-medium)'   :
                                              'var(--color-severity-low)'
              const sevBg =
                inc.severity === 'CRITICAL' ? 'var(--color-severity-critical-bg)' :
                inc.severity === 'HIGH'     ? 'var(--color-severity-high-bg)'     :
                inc.severity === 'MEDIUM'   ? 'var(--color-severity-medium-bg)'   :
                                              'var(--color-severity-low-bg)'
              return (
                <div
                  key={inc.id}
                  className="flex items-start gap-3 p-3 rounded-xl cursor-pointer card-hover"
                  style={{
                    background: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    borderLeft: `4px solid ${sevColor}`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: sevBg, color: sevColor }}
                    aria-hidden="true"
                  >
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {inc.title}
                      </p>
                      <SeverityBadge severity={inc.severity} />
                    </div>
                    <time dateTime={inc.reportedAt} className="text-timestamp mt-0.5 block">
                      {format(parseISO(inc.reportedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </time>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
