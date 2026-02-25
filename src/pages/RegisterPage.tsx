import { useState, useRef, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield, Eye, EyeOff, CheckCircle, AlertCircle,
  User, Mail, Lock, CreditCard, Phone, ChevronRight,
} from 'lucide-react'

/* ─── CPF helpers ─── */
const formatCpf = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

const validateCpf = (cpf: string): boolean => {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(d[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === parseInt(d[10])
}

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim()
}

const strengthLabel = (pwd: string) => {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return [
    { label: '', color: 'var(--color-border)' },
    { label: 'Fraca',  color: 'var(--color-cancelado)' },
    { label: 'Média',  color: 'var(--color-pendente)' },
    { label: 'Boa',    color: '#0ea5e9' },
    { label: 'Forte',  color: 'var(--color-confirmado)' },
  ][score]
}

type Step = 'form' | 'verify-email' | 'done'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep]             = useState<Step>('form')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [cpfError, setCpfError]     = useState('')
  const [pwdError, setPwdError]     = useState('')
  const [otp, setOtp]               = useState(['', '', '', '', '', ''])
  const otpRefs                     = useRef<(HTMLInputElement | null)[]>([])

  const [form, setForm] = useState({
    fullName: '', cpf: '', email: '', phone: '',
    password: '', confirmPassword: '', role: 'GUARDIAN_1' as 'GUARDIAN_1' | 'GUARDIAN_2',
    termsAccepted: false,
  })

  const strength = strengthLabel(form.password)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setCpfError('')
    setPwdError('')

    if (!validateCpf(form.cpf)) {
      setCpfError('CPF inválido. Verifique os dígitos.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setPwdError('As senhas não coincidem.')
      return
    }
    if (form.password.length < 8) {
      setPwdError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setStep('verify-email')
  }

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]
    next[i] = v
    setOtp(next)
    if (v && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setStep('done')
  }

  /* ══ STEP: verify-email ══ */
  if (step === 'verify-email') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
        <div className="w-full max-w-sm fade-in space-y-5">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'var(--foursys-gradient)', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }} aria-hidden="true">
              <Mail size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
              Verifique seu e-mail
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
              Enviamos um código de 6 dígitos para{' '}
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{form.email}</span>
            </p>
          </div>

          <div className="card p-6 space-y-5" style={{ boxShadow: 'var(--shadow-soft)', borderTop: '3px solid transparent', borderImage: 'var(--foursys-gradient) 1' }}>
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="text-label block text-center mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  Código de verificação
                </label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      className="w-11 h-12 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none"
                      style={{
                        border: `2px solid ${digit ? 'var(--color-primary)' : 'var(--color-border-dark)'}`,
                        background: 'var(--color-surface-alt)',
                        color: 'var(--color-text-primary)',
                      }}
                      aria-label={`Dígito ${i + 1}`}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn-gradient w-full flex items-center justify-center gap-2"
                disabled={loading || otp.join('').length < 6}
                style={{ opacity: loading || otp.join('').length < 6 ? 0.55 : 1 }}
                aria-busy={loading}
              >
                {loading
                  ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Verificando…</>
                  : 'Verificar e ativar conta'
                }
              </button>
            </form>

            <div className="text-center space-y-1">
              <button
                type="button"
                className="text-sm font-semibold"
                style={{ color: 'var(--color-primary)' }}
                onClick={() => { setOtp(['','','','','','']) }}
              >
                Reenviar código
              </button>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                💡 Demo: qualquer código de 6 dígitos funciona
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ══ STEP: done ══ */
  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
        <div className="w-full max-w-sm text-center space-y-5 fade-in">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-2"
            style={{ background: 'linear-gradient(135deg, #059669, #0ea5e9)' }}
            aria-hidden="true"
          >
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
            Conta ativada com sucesso!
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            Bem-vindo(a) ao Guarda360°. Sua identidade foi verificada e sua conta está pronta.
          </p>
          <div className="p-4 rounded-xl space-y-2" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{form.fullName}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{form.email}</p>
            <p className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>{form.cpf}</p>
          </div>
          <button onClick={() => navigate('/login', { replace: true })} className="btn-gradient w-full flex items-center justify-center gap-2">
            Acessar a plataforma
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  }

  /* ══ STEP: form ══ */
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm fade-in">

        {/* Logo */}
        <div className="text-center mb-7">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3"
            style={{ background: 'var(--foursys-gradient)', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}
            aria-hidden="true"
          >
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
            Guarda<span style={{ background: 'var(--foursys-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>360°</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Crie sua conta gratuitamente</p>
        </div>

        <div className="card p-6" style={{ boxShadow: 'var(--shadow-soft)', borderTop: '3px solid transparent', borderImage: 'var(--foursys-gradient) 1' }}>
          <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--color-text-primary)' }}>Cadastro</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Nome */}
            <div>
              <label htmlFor="reg-name" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Nome completo *
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                <input
                  id="reg-name" type="text" required autoFocus
                  value={form.fullName}
                  onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                  className="input-field" style={{ paddingLeft: '2.25rem' }}
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            {/* CPF */}
            <div>
              <label htmlFor="reg-cpf" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                CPF *
              </label>
              <div className="relative">
                <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                <input
                  id="reg-cpf" type="text" required maxLength={14}
                  value={form.cpf}
                  onChange={e => {
                    setForm(p => ({ ...p, cpf: formatCpf(e.target.value) }))
                    setCpfError('')
                  }}
                  className={`input-field font-mono ${cpfError ? 'input-error' : ''}`}
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="000.000.000-00"
                  aria-describedby={cpfError ? 'cpf-error' : undefined}
                />
              </div>
              {cpfError && (
                <p id="cpf-error" className="flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--color-cancelado)' }}>
                  <AlertCircle size={12} aria-hidden="true" />
                  {cpfError}
                </p>
              )}
            </div>

            {/* E-mail */}
            <div>
              <label htmlFor="reg-email" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                E-mail *
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                <input
                  id="reg-email" type="email" required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input-field" style={{ paddingLeft: '2.25rem' }}
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="reg-phone" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Telefone
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                <input
                  id="reg-phone" type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: formatPhone(e.target.value) }))}
                  className="input-field" style={{ paddingLeft: '2.25rem' }}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Papel */}
            <div>
              <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Meu papel na guarda *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'GUARDIAN_1', label: 'Guardião A', desc: 'Responsável principal' },
                  { value: 'GUARDIAN_2', label: 'Guardião B', desc: 'Co-guardião' },
                ] as const).map(r => (
                  <label
                    key={r.value}
                    className="flex flex-col gap-0.5 p-2.5 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: form.role === r.value ? 'var(--color-primary-muted)' : 'var(--color-surface-alt)',
                      border: `1.5px solid ${form.role === r.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    }}
                  >
                    <input
                      type="radio" name="role" value={r.value} className="sr-only"
                      checked={form.role === r.value}
                      onChange={() => setForm(p => ({ ...p, role: r.value }))}
                    />
                    <span className="text-sm font-bold" style={{ color: form.role === r.value ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                      {r.label}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{r.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="reg-password" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Senha *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                <input
                  id="reg-password" type={showPassword ? 'text' : 'password'} required minLength={8}
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setPwdError('') }}
                  className={`input-field ${pwdError ? 'input-error' : ''}`}
                  style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-disabled)' }}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength bar */}
              {form.password && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map(s => (
                      <div
                        key={s}
                        className="h-1 flex-1 rounded-full transition-all"
                        style={{
                          background: ['Fraca','Média','Boa','Forte'].indexOf(strength.label) + 1 >= s
                            ? strength.color
                            : 'var(--color-border)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirmar senha */}
            <div>
              <label htmlFor="reg-confirm" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Confirmar senha *
              </label>
              <input
                id="reg-confirm" type="password" required
                value={form.confirmPassword}
                onChange={e => { setForm(p => ({ ...p, confirmPassword: e.target.value })); setPwdError('') }}
                className={`input-field ${pwdError ? 'input-error' : ''}`}
                placeholder="Repita a senha"
                autoComplete="new-password"
              />
              {pwdError && (
                <p className="flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--color-cancelado)' }}>
                  <AlertCircle size={12} aria-hidden="true" />
                  {pwdError}
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={form.termsAccepted}
                onChange={e => setForm(p => ({ ...p, termsAccepted: e.target.checked }))}
                className="rounded mt-0.5"
              />
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Aceito os{' '}
                <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Termos de Uso</span>
                {' '}e a{' '}
                <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Política de Privacidade (LGPD)</span>,
                incluindo o registro imutável de comunicações para fins jurídicos.
              </p>
            </label>

            <button
              type="submit"
              disabled={loading || !form.termsAccepted}
              className="btn-gradient w-full flex items-center justify-center gap-2"
              style={{ opacity: loading || !form.termsAccepted ? 0.55 : 1 }}
              aria-busy={loading}
            >
              {loading
                ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Criando conta…</>
                : 'Criar conta'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: 'var(--color-text-tertiary)' }}>
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
