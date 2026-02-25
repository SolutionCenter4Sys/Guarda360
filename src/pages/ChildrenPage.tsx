import { useState } from 'react'
import {
  Users, Plus, GraduationCap, CalendarDays, UserPlus, X,
  Mail, Check, Shield, Baby, Heart, Star, ChevronRight, Settings,
} from 'lucide-react'
import { mockChildren, mockCalendarEvents, mockAlimonyPayments, mockGuardConfigs } from '../mocks'
import { useToast } from '../context/ToastContext'
import { useOnboarding } from '../context/OnboardingContext'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { EmptyState } from '../components/ui/EmptyState'
import type { Child, GuardType } from '../types'

/* ─── Per-child stats ─── */
function useChildStats(child: Child) {
  const events   = mockCalendarEvents.filter(e => e.childId === child.id)
  const done     = events.filter(e => e.status === 'CONFIRMADO').length
  const total    = events.length || 1
  const compliance = Math.round((done / total) * 100)
  const pending  = events.filter(e => e.status === 'PENDENTE').length
  const age      = Math.floor((Date.now() - new Date(child.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))
  const paidCount = mockAlimonyPayments.filter(p => p.status === 'PAGO').length
  return { compliance, done, pending, total: events.length, age, paidCount }
}

/* ─── Compliance mini-ring ─── */
function MiniRing({ pct, color }: { pct: number; color: string }) {
  const r = 16, circ = 2 * Math.PI * r, dash = (pct / 100) * circ
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
      <circle cx="20" cy="20" r={r} fill="none" stroke="var(--color-border)" strokeWidth="4" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  )
}

/* ─── Child card ─── */
function ChildCard({ child, onInvite }: { child: Child; onInvite: (id: string) => void }) {
  const { compliance, done, pending, total, age, paidCount } = useChildStats(child)
  const ringColor = compliance >= 75 ? 'var(--color-confirmado)' : compliance >= 50 ? 'var(--color-pendente)' : 'var(--color-cancelado)'

  /* alternating card accent colors */
  const idx = mockChildren.indexOf(child)
  const accentGradients = [
    'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
    'linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)',
    'linear-gradient(135deg, #059669 0%, #0ea5e9 100%)',
  ]
  const accent = accentGradients[idx % accentGradients.length]

  return (
    <article
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-soft)',
      }}
      aria-label={`Perfil de ${child.fullName}`}
    >
      {/* ── Card top banner ── */}
      <div
        className="relative px-5 pt-5 pb-14 overflow-hidden"
        style={{ background: accent }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-10"
          style={{ background: '#fff' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-2 left-8 w-16 h-16 rounded-full opacity-10"
          style={{ background: '#fff' }}
          aria-hidden="true"
        />

        {/* Age pill */}
        <div
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold mb-3"
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
        >
          <Baby size={11} aria-hidden="true" />
          {age} anos
        </div>

        <h3 className="text-lg font-extrabold text-white leading-tight">
          {child.fullName}
        </h3>
        <div className="flex items-center gap-1.5 mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
          <GraduationCap size={13} aria-hidden="true" />
          <span className="text-xs font-medium truncate">{child.schoolName}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <CalendarDays size={12} aria-hidden="true" />
          <time dateTime={child.birthDate} className="text-xs">
            {format(new Date(child.birthDate), 'dd/MM/yyyy', { locale: ptBR })}
          </time>
        </div>
      </div>

      {/* ── Avatar (floating overlap) ── */}
      <div className="relative -mt-10 px-5">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center font-extrabold text-white text-3xl border-4"
          style={{
            background: accent,
            borderColor: 'var(--color-surface)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}
          aria-hidden="true"
        >
          {child.fullName.charAt(0)}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="px-5 pt-3 pb-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Compliance */}
          <div
            className="rounded-xl p-2.5 flex flex-col items-center gap-1"
            style={{ background: 'var(--color-surface-alt)' }}
          >
            <div className="relative flex items-center justify-center w-10 h-10">
              <MiniRing pct={compliance} color={ringColor} />
              <span
                className="absolute text-xs font-extrabold"
                style={{ color: ringColor }}
              >
                {compliance}%
              </span>
            </div>
            <p className="text-xs font-medium text-center leading-tight" style={{ color: 'var(--color-text-tertiary)' }}>
              Cumprimento
            </p>
          </div>

          {/* Visits */}
          <div
            className="rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5"
            style={{ background: 'var(--color-surface-alt)' }}
          >
            <p className="text-2xl font-extrabold leading-none" style={{ color: 'var(--color-primary)' }}>
              {done}
            </p>
            <p className="text-xs font-medium text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              Visitas este mês
            </p>
            {pending > 0 && (
              <p className="text-xs font-semibold" style={{ color: 'var(--color-pendente)' }}>
                {pending} pendente{pending > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Payments */}
          <div
            className="rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5"
            style={{ background: 'var(--color-surface-alt)' }}
          >
            <p className="text-2xl font-extrabold leading-none" style={{ color: 'var(--color-confirmado)' }}>
              {paidCount}
            </p>
            <p className="text-xs font-medium text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              Pensões pagas
            </p>
          </div>
        </div>

        {/* ── Guardians ── */}
        <div className="mb-4">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2.5"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Responsáveis
          </p>
          <div className="grid grid-cols-2 gap-2">
            {child.guardians.map(g => {
              const isA = g.role === 'GUARDIAN_1'
              const color = isA ? 'var(--color-guardian-a)' : 'var(--color-guardian-b)'
              const bg    = isA ? 'var(--color-guardian-a-bg)' : 'var(--color-guardian-b-bg)'
              const border= isA ? 'var(--color-guardian-a-border)' : 'var(--color-guardian-b-border)'

              return (
                <div
                  key={g.userId}
                  className="rounded-xl p-2.5 flex flex-col gap-2"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                      style={{ background: color }}
                      aria-hidden="true"
                    >
                      {g.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-tight truncate" style={{ color }}>
                        {g.fullName.split(' ')[0]}
                      </p>
                      <p className="text-xs leading-tight" style={{ color }}>
                        {isA ? 'Guardião A' : 'Guardião B'}
                      </p>
                    </div>
                  </div>
                  <div
                    className="text-xs font-semibold text-center px-1.5 py-0.5 rounded-full"
                    style={{ background: color, color: '#fff' }}
                  >
                    {isA ? 'Responsável 1' : 'Responsável 2'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Action ── */}
        <button
          onClick={() => onInvite(child.id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'var(--color-surface-alt)',
            color: 'var(--color-primary)',
            border: '1.5px solid var(--color-border)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'var(--color-primary-muted)'
            el.style.borderColor = 'var(--color-primary)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'var(--color-surface-alt)'
            el.style.borderColor = 'var(--color-border)'
          }}
        >
          <UserPlus size={15} aria-hidden="true" />
          Convidar co-guardião
          <ChevronRight size={14} className="ml-auto" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

/* ─── Main page ─── */
export default function ChildrenPage() {
  const [showModal, setShowModal]             = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showGuardModal, setShowGuardModal]   = useState(false)
  const [guardChildId, setGuardChildId]       = useState(mockChildren[0]?.id ?? '')
  const [selectedChildId, setSelectedChildId] = useState('')
  const [inviteSent, setInviteSent]           = useState(false)
  const [newChild, setNewChild]               = useState({ fullName: '', birthDate: '', schoolName: '' })
  const [inviteEmail, setInviteEmail]         = useState('')
  const { toast } = useToast()
  const { openOnboarding } = useOnboarding()

  const selectedChild = mockChildren.find(c => c.id === selectedChildId)

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault()
    setShowModal(false)
    setNewChild({ fullName: '', birthDate: '', schoolName: '' })
    toast(`${newChild.fullName || 'Filho'} cadastrado com sucesso!`, 'success')
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    setInviteSent(true)
    toast(`Convite enviado para ${inviteEmail}`, 'success')
  }

  const handleCloseInvite = () => {
    setShowInviteModal(false)
    setInviteSent(false)
    setInviteEmail('')
  }

  const handleOpenInvite = (id: string) => {
    setSelectedChildId(id)
    setShowInviteModal(true)
  }

  /* aggregate stats */
  const totalGuardians = [...new Set(mockChildren.flatMap(c => c.guardians.map(g => g.userId)))].length
  const totalEvents    = mockCalendarEvents.length
  const totalDone      = mockCalendarEvents.filter(e => e.status === 'CONFIRMADO').length
  const overallCompliance = Math.round((totalDone / (totalEvents || 1)) * 100)

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ══════════ HERO BANNER ══════════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--foursys-gradient)',
          boxShadow: '0 6px 24px rgba(124,58,237,0.28)',
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-4 flex-wrap gap-3"
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
              <h2 className="text-xl font-extrabold text-white leading-tight">Meus Filhos</h2>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {mockChildren.length} filho{mockChildren.length !== 1 ? 's' : ''} cadastrado{mockChildren.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuardModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.25)',
              }}
            >
              <Settings size={14} aria-hidden="true" />
              Tipo de guarda
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.35)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Plus size={15} aria-hidden="true" />
              Adicionar filho
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-px px-5 py-4" style={{ color: '#fff' }}>
          {[
            { label: 'Filhos',       value: mockChildren.length,  icon: <Users size={16} aria-hidden="true" /> },
            { label: 'Responsáveis', value: totalGuardians,        icon: <Shield size={16} aria-hidden="true" /> },
            { label: 'Cumprimento',  value: `${overallCompliance}%`, icon: <Star size={16} aria-hidden="true" /> },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1 text-center">
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>{s.icon}</div>
              <p className="text-2xl font-extrabold leading-none text-white">{s.value}</p>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ EMPTY STATE ══════════ */}
      {mockChildren.length === 0 && (
        <div className="card">
          <EmptyState
            icon={<Users size={28} />}
            title="Nenhum filho cadastrado"
            description="Cadastre o primeiro filho para começar a organizar a guarda compartilhada."
            action={{ label: 'Configurar agora', onClick: openOnboarding, variant: 'gradient' }}
          />
        </div>
      )}

      {/* ══════════ CHILDREN GRID ══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mockChildren.map(child => (
          <ChildCard key={child.id} child={child} onInvite={handleOpenInvite} />
        ))}

        {/* Add child CTA card */}
        <button
          onClick={() => setShowModal(true)}
          className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 min-h-[320px] transition-all group"
          style={{
            borderColor: 'var(--color-border-dark)',
            background: 'transparent',
          }}
          aria-label="Adicionar novo filho"
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = 'var(--color-primary)'
            el.style.background  = 'rgba(29,78,216,0.03)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = 'var(--color-border-dark)'
            el.style.background  = 'transparent'
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all"
            style={{
              background: 'var(--color-surface-alt)',
              border: '2px solid var(--color-border)',
              color: 'var(--color-text-tertiary)',
            }}
            aria-hidden="true"
          >
            <Plus size={28} />
          </div>
          <div className="text-center px-6">
            <p className="text-base font-bold" style={{ color: 'var(--color-text-secondary)' }}>
              Adicionar filho
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Cadastre mais filhos para organizar a guarda compartilhada
            </p>
          </div>
        </button>
      </div>

      {/* ══════════ MODAL: ADD CHILD ══════════ */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 fade-in"
          style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-child-title"
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            {/* Modal hero */}
            <div
              className="p-5 flex items-center justify-between"
              style={{ background: 'var(--foursys-gradient)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                  aria-hidden="true"
                >
                  <Baby size={20} color="#fff" />
                </div>
                <h3 id="modal-add-child-title" className="text-lg font-bold text-white">
                  Cadastrar filho
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                aria-label="Fechar modal"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5" style={{ background: 'var(--color-surface)' }}>
              <form onSubmit={handleAddChild} className="space-y-4">
                <div>
                  <label
                    htmlFor="child-name"
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Nome completo *
                  </label>
                  <input
                    id="child-name"
                    type="text"
                    className="input-field"
                    value={newChild.fullName}
                    onChange={e => setNewChild(p => ({ ...p, fullName: e.target.value }))}
                    placeholder="Nome completo da criança"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    htmlFor="child-birth"
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Data de nascimento *
                  </label>
                  <input
                    id="child-birth"
                    type="date"
                    className="input-field"
                    value={newChild.birthDate}
                    onChange={e => setNewChild(p => ({ ...p, birthDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="child-school"
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Escola
                  </label>
                  <input
                    id="child-school"
                    type="text"
                    className="input-field"
                    value={newChild.schoolName}
                    onChange={e => setNewChild(p => ({ ...p, schoolName: e.target.value }))}
                    placeholder="Nome da escola ou creche"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-gradient flex-1">
                    Cadastrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL: INVITE CO-GUARDIAN ══════════ */}
      {showInviteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 fade-in"
          style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-invite-title"
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            {!inviteSent ? (
              <>
                {/* Modal hero */}
                <div
                  className="p-5 flex items-center justify-between"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.2)' }}
                      aria-hidden="true"
                    >
                      <UserPlus size={20} color="#fff" />
                    </div>
                    <h3 id="modal-invite-title" className="text-lg font-bold text-white">
                      Convidar co-guardião
                    </h3>
                  </div>
                  <button
                    onClick={handleCloseInvite}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                    aria-label="Fechar modal"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>

                <div className="p-5 space-y-4" style={{ background: 'var(--color-surface)' }}>
                  {/* Child preview */}
                  {selectedChild && (
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-lg"
                        style={{ background: 'var(--foursys-gradient)' }}
                        aria-hidden="true"
                      >
                        {selectedChild.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                          {selectedChild.fullName}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Vinculando novo co-guardião
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Info notice */}
                  <div
                    className="p-3 rounded-xl flex items-start gap-2.5 text-sm"
                    style={{
                      background: 'var(--color-guardian-b-bg)',
                      border: '1px solid var(--color-guardian-b-border)',
                    }}
                  >
                    <Shield size={16} style={{ color: 'var(--color-guardian-b)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      O co-guardião receberá um link para <strong>criar conta</strong> e se vincular automaticamente.
                    </span>
                  </div>

                  {/* Email form */}
                  <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                      <label
                        htmlFor="invite-email"
                        className="block text-sm font-semibold mb-1.5"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        E-mail do co-guardião *
                      </label>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--color-text-tertiary)' }}
                          aria-hidden="true"
                        />
                        <input
                          id="invite-email"
                          type="email"
                          className="input-field"
                          style={{ paddingLeft: '2.25rem' }}
                          value={inviteEmail}
                          onChange={e => setInviteEmail(e.target.value)}
                          placeholder="email@exemplo.com"
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={handleCloseInvite} className="btn-secondary flex-1">
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn-gradient flex-1 flex items-center justify-center gap-2"
                        disabled={!inviteEmail.includes('@')}
                        style={{ opacity: !inviteEmail.includes('@') ? 0.55 : 1 }}
                      >
                        <Mail size={14} aria-hidden="true" />
                        Enviar convite
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              /* ─── Invite sent ─── */
              <div style={{ background: 'var(--color-surface)' }}>
                <div
                  className="p-8 text-center"
                  style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.08) 0%, rgba(22,163,74,0.02) 100%)' }}
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'var(--color-confirmado-bg)', border: '3px solid var(--color-confirmado)' }}
                    aria-hidden="true"
                  >
                    <Check size={36} style={{ color: 'var(--color-confirmado)' }} />
                  </div>
                  <h3 className="text-xl font-extrabold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Convite enviado!
                  </h3>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    E-mail enviado para
                  </p>
                  <p
                    className="text-base font-bold mb-4 px-4 py-2 rounded-xl inline-block"
                    style={{
                      color: 'var(--color-primary)',
                      background: 'var(--color-primary-muted)',
                    }}
                  >
                    {inviteEmail}
                  </p>
                  <p className="text-sm mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
                    O co-guardião receberá as instruções para criar conta e se vincular automaticamente.
                  </p>
                  <button onClick={handleCloseInvite} className="btn-gradient w-full">
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ MODAL: CONFIGURAÇÃO DE GUARDA ══ */}
      {showGuardModal && (() => {
        const guardChild = mockChildren.find(c => c.id === guardChildId)
        const currentConfig = mockGuardConfigs.find(g => g.childId === guardChildId)
        const guardTypeLabels: Record<GuardType, { label: string; desc: string }> = {
          COMPARTILHADA_ALTERNADA: {
            label: 'Compartilhada Alternada',
            desc: 'Criança alterna residência entre os guardiões conforme calendário definido',
          },
          COMPARTILHADA_EXCLUSIVA: {
            label: 'Compartilhada Exclusiva (física)',
            desc: 'Residência fixa com um guardião; o outro tem direito a visitas regulares',
          },
          UNILATERAL: {
            label: 'Unilateral',
            desc: 'Guarda exclusiva com um dos guardiões; visitação conforme decisão judicial',
          },
        }
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
        return (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 fade-in"
            style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            role="dialog" aria-modal="true" aria-label="Configuração de guarda"
          >
            <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div className="p-5 flex items-center justify-between" style={{ background: 'var(--foursys-gradient)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true">
                    <Shield size={20} color="#fff" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Tipo de Guarda</h3>
                    {guardChild && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{guardChild.fullName}</p>}
                  </div>
                </div>
                <button onClick={() => setShowGuardModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} aria-label="Fechar">
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5" style={{ background: 'var(--color-surface)' }}>
                {/* Child selector */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Filho</label>
                  <select className="input-field" value={guardChildId} onChange={e => setGuardChildId(e.target.value)}>
                    {mockChildren.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                  </select>
                </div>

                {/* Guard type selection */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Modalidade de guarda *
                  </label>
                  <div className="space-y-2">
                    {(Object.entries(guardTypeLabels) as [GuardType, { label: string; desc: string }][]).map(([type, info]) => {
                      const isSelected = currentConfig?.type === type
                      return (
                        <label
                          key={type}
                          className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: isSelected ? 'var(--color-primary-muted)' : 'var(--color-surface-alt)',
                            border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          }}
                        >
                          <input type="radio" name="guardType" value={type} defaultChecked={isSelected} className="mt-0.5" />
                          <div>
                            <p className="text-sm font-bold" style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                              {info.label}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{info.desc}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Weekly schedule */}
                {currentConfig && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      Dias de convivência
                    </label>
                    <div className="space-y-2.5">
                      {(['GUARDIAN_1', 'GUARDIAN_2'] as const).map(role => {
                        const isA = role === 'GUARDIAN_1'
                        const days = isA ? currentConfig.guardian1Weekdays : currentConfig.guardian2Weekdays
                        const color = isA ? 'var(--color-guardian-a)' : 'var(--color-guardian-b)'
                        const bg    = isA ? 'var(--color-guardian-a-bg)' : 'var(--color-guardian-b-bg)'
                        return (
                          <div key={role}>
                            <p className="text-xs font-bold mb-1.5" style={{ color }}>
                              {isA ? 'Guardião A' : 'Guardião B'}
                            </p>
                            <div className="flex gap-1.5 flex-wrap">
                              {weekDays.map((d, i) => {
                                const active = days.includes(i)
                                return (
                                  <div
                                    key={i}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                                    style={{
                                      background: active ? bg : 'var(--color-surface-alt)',
                                      color: active ? color : 'var(--color-text-tertiary)',
                                      border: `1.5px solid ${active ? color : 'var(--color-border)'}`,
                                    }}
                                  >
                                    {d}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                      Vigência a partir de{' '}
                      {format(new Date(currentConfig.startDate), 'dd/MM/yyyy', { locale: ptBR })}
                      {currentConfig.notes && ` · ${currentConfig.notes}`}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowGuardModal(false)} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-gradient flex-1"
                    onClick={() => { setShowGuardModal(false); toast('Configuração de guarda atualizada!', 'success') }}
                  >
                    Salvar configuração
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
