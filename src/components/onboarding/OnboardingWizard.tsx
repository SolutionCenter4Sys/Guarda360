import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  Shield, Users, DollarSign, Mail, ChevronRight, ChevronLeft,
  Check, X, Star, Lock, FileText, Calendar,
} from 'lucide-react'
import { useOnboarding } from '../../context/OnboardingContext'
import { useToast } from '../../context/ToastContext'

/* ─── Steps definition ─── */
const STEPS = ['Bem-vindo', 'Seu filho', 'Pensão', 'Co-guardião'] as const
type StepKey = typeof STEPS[number]

/* ─── Feature highlights for step 1 ─── */
const features = [
  { icon: <Lock size={20} aria-hidden="true" />, label: 'Registros imutáveis com SHA-256', color: 'var(--color-primary)' },
  { icon: <Calendar size={20} aria-hidden="true" />, label: 'Calendário de visitas e check-in', color: 'var(--color-guardian-a)' },
  { icon: <FileText size={20} aria-hidden="true" />, label: 'Relatórios jurídicos exportáveis', color: 'var(--color-severity-high)' },
  { icon: <DollarSign size={20} aria-hidden="true" />, label: 'Controle de pensão e despesas', color: 'var(--color-confirmado)' },
]

/* ─── Progress bar ─── */
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total - 1)) * 100)
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={{
                background: i < step ? 'var(--foursys-gradient)' :
                            i === step ? 'var(--foursys-gradient)' : 'var(--color-surface-alt)',
                color: i <= step ? '#fff' : 'var(--color-text-tertiary)',
                border: i <= step ? 'none' : '2px solid var(--color-border)',
                boxShadow: i === step ? '0 0 0 3px rgba(154,27,255,0.2)' : 'none',
              }}
              aria-current={i === step ? 'step' : undefined}
            >
              {i < step ? <Check size={14} aria-hidden="true" /> : i + 1}
            </div>
            <span
              className="text-xs font-medium hidden sm:block"
              style={{ color: i === step ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--color-surface-alt)' }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso do onboarding: ${pct}%`}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'var(--foursys-gradient)' }}
        />
      </div>
    </div>
  )
}

/* ─── Step 1: Welcome ─── */
function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      {/* Logo hero */}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: 'var(--foursys-gradient)', boxShadow: '0 8px 24px rgba(154,27,255,0.35)' }}
        aria-hidden="true"
      >
        <Shield size={40} color="#fff" />
      </div>
      <h2 className="text-h3 mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Bem-vindo ao{' '}
        <span style={{ background: 'var(--foursys-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Guarda360°
        </span>
      </h2>
      <p className="text-body-sm mb-6" style={{ color: 'var(--color-text-tertiary)', maxWidth: '360px', margin: '0 auto 1.5rem' }}>
        A plataforma jurídica de guarda compartilhada que protege os direitos da criança e dos responsáveis com registros imutáveis.
      </p>

      {/* Features */}
      <ul className="space-y-3 mb-8 text-left" aria-label="Funcionalidades principais">
        {features.map(f => (
          <li key={f.label} className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `color-mix(in srgb, ${f.color} 12%, transparent)`, color: f.color }}
              aria-hidden="true"
            >
              {f.icon}
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      <button onClick={onNext} className="btn-gradient w-full flex items-center justify-center gap-2 text-base">
        Começar configuração
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </div>
  )
}

/* ─── Step 2: Add child ─── */
function StepChild({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [form, setForm] = useState({ fullName: '', birthDate: '', schoolName: '' })
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.fullName.trim() || !form.birthDate) {
      setError('Preencha o nome e a data de nascimento.')
      return
    }
    onNext()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--foursys-gradient)' }}
          aria-hidden="true"
        >
          <Users size={20} color="#fff" />
        </div>
        <div>
          <h2 className="text-h4" style={{ color: 'var(--color-text-primary)' }}>Cadastrar filho</h2>
          <p className="text-caption">Você pode adicionar mais filhos depois.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="ob-child-name"
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Nome completo da criança *
          </label>
          <input
            id="ob-child-name"
            type="text"
            className="input-field"
            placeholder="Ex: Lucas Pereira Silva"
            value={form.fullName}
            onChange={e => { setForm(p => ({ ...p, fullName: e.target.value })); setError('') }}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="ob-child-birth"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Data de nascimento *
            </label>
            <input
              id="ob-child-birth"
              type="date"
              className="input-field"
              value={form.birthDate}
              onChange={e => { setForm(p => ({ ...p, birthDate: e.target.value })); setError('') }}
              required
            />
          </div>
          <div>
            <label
              htmlFor="ob-child-school"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Escola
            </label>
            <input
              id="ob-child-school"
              type="text"
              className="input-field"
              placeholder="Nome da escola"
              value={form.schoolName}
              onChange={e => setForm(p => ({ ...p, schoolName: e.target.value }))}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm" style={{ color: 'var(--color-cancelado)' }} role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <ChevronLeft size={16} aria-hidden="true" /> Voltar
          </button>
          <button type="submit" className="btn-gradient flex-1 flex items-center justify-center gap-2">
            Continuar <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="w-full text-sm text-center"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Pular por agora →
        </button>
      </form>
    </div>
  )
}

/* ─── Step 3: Pension config ─── */
function StepPension({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [form, setForm] = useState({ amount: '', dueDay: '5', payerName: '', receiverName: '' })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--foursys-gradient)' }}
          aria-hidden="true"
        >
          <DollarSign size={20} color="#fff" />
        </div>
        <div>
          <h2 className="text-h4" style={{ color: 'var(--color-text-primary)' }}>Pensão alimentícia</h2>
          <p className="text-caption">Configure para receber alertas de pagamento.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="ob-pension-amount"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Valor mensal (R$)
            </label>
            <input
              id="ob-pension-amount"
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              placeholder="0,00"
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
            />
          </div>
          <div>
            <label
              htmlFor="ob-pension-due"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Dia de vencimento
            </label>
            <select
              id="ob-pension-due"
              className="input-field"
              value={form.dueDay}
              onChange={e => setForm(p => ({ ...p, dueDay: e.target.value }))}
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>Dia {d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="ob-pension-payer"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Quem paga
            </label>
            <input
              id="ob-pension-payer"
              type="text"
              className="input-field"
              placeholder="Nome do pagador"
              value={form.payerName}
              onChange={e => setForm(p => ({ ...p, payerName: e.target.value }))}
            />
          </div>
          <div>
            <label
              htmlFor="ob-pension-receiver"
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Quem recebe
            </label>
            <input
              id="ob-pension-receiver"
              type="text"
              className="input-field"
              placeholder="Nome do recebedor"
              value={form.receiverName}
              onChange={e => setForm(p => ({ ...p, receiverName: e.target.value }))}
            />
          </div>
        </div>

        {/* Info note */}
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            background: 'var(--color-primary-muted)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <Star size={14} className="inline mr-1.5" aria-hidden="true" style={{ color: 'var(--color-primary)' }} />
          Você receberá alertas <strong>3 dias antes</strong> do vencimento e quando houver atraso.
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <ChevronLeft size={16} aria-hidden="true" /> Voltar
          </button>
          <button type="submit" className="btn-gradient flex-1 flex items-center justify-center gap-2">
            Continuar <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="w-full text-sm text-center"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Pular por agora →
        </button>
      </form>
    </div>
  )
}

/* ─── Step 4: Invite co-guardian ─── */
function StepInvite({ onComplete }: { onComplete: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return
    setSent(true)
    toast(`Convite enviado para ${email}`, 'success')
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--color-confirmado-bg)', color: 'var(--color-confirmado)' }}
          aria-hidden="true"
        >
          <Check size={32} />
        </div>
        <h2 className="text-h4 mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Tudo pronto!
        </h2>
        <p className="text-body-sm mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
          O convite foi enviado para <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>.
        </p>
        <p className="text-caption mb-8" style={{ color: 'var(--color-text-tertiary)' }}>
          O co-guardião receberá um link para criar a conta e sincronizar com você.
        </p>
        <button onClick={onComplete} className="btn-gradient w-full flex items-center justify-center gap-2 text-base">
          <Shield size={18} aria-hidden="true" />
          Acessar o Guarda360°
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--foursys-gradient)' }}
          aria-hidden="true"
        >
          <Mail size={20} color="#fff" />
        </div>
        <div>
          <h2 className="text-h4" style={{ color: 'var(--color-text-primary)' }}>Convidar co-guardião</h2>
          <p className="text-caption">Envie um convite para o outro responsável.</p>
        </div>
      </div>

      {/* Explanation */}
      <div
        className="p-4 rounded-xl mb-5"
        style={{
          background: 'var(--color-guardian-b-bg, rgba(219,39,119,0.06))',
          border: '1px solid var(--color-guardian-b)',
        }}
      >
        <div className="flex items-start gap-2">
          <Users size={16} style={{ color: 'var(--color-guardian-b)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-guardian-b)' }}>
              Por que convidar?
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Com ambos os guardiões no sistema, todos os eventos, mensagens e ocorrências ficam visíveis para os dois lados com registros auditáveis.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="ob-invite-email"
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            E-mail do co-guardião
          </label>
          <input
            id="ob-invite-email"
            type="email"
            className="input-field"
            placeholder="email@exemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={!email.includes('@')}
          className="btn-gradient w-full flex items-center justify-center gap-2"
          style={{ opacity: !email.includes('@') ? 0.6 : 1, cursor: !email.includes('@') ? 'not-allowed' : 'pointer' }}
        >
          <Mail size={16} aria-hidden="true" />
          Enviar convite
        </button>
      </form>

      <button
        type="button"
        onClick={onComplete}
        className="w-full text-sm text-center mt-4"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        Pular e acessar o sistema →
      </button>
    </div>
  )
}

/* ─── Main Wizard ─── */
export function OnboardingWizard() {
  const { isOnboardingOpen, completeOnboarding } = useOnboarding()
  const [step, setStep] = useState(0)

  if (!isOnboardingOpen) return null

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-label={`Configuração inicial — Passo ${step + 1} de ${STEPS.length}: ${STEPS[step]}`}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 relative"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Close button */}
        <button
          onClick={completeOnboarding}
          className="absolute top-4 right-4 p-1.5 rounded-lg"
          style={{ color: 'var(--color-text-tertiary)', background: 'var(--color-surface-alt)' }}
          aria-label="Fechar configuração inicial"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <ProgressBar step={step} total={STEPS.length} />

        {/* Step content */}
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          {step === 0 && <StepWelcome onNext={next} />}
          {step === 1 && <StepChild onNext={next} onBack={back} />}
          {step === 2 && <StepPension onNext={next} onBack={back} />}
          {step === 3 && <StepInvite onComplete={completeOnboarding} />}
        </div>
      </div>
    </div>,
    document.body,
  )
}
