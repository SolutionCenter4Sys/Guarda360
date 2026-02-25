import { useState, useRef, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Shield, AlertCircle, Lock, Smartphone, RotateCcw, Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type Step = 'credentials' | '2fa' | 'forgot-email' | 'forgot-code' | 'forgot-reset'

export default function LoginPage() {
  const [step, setStep]               = useState<Step>('credentials')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [remember, setRemember]       = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [otp, setOtp]                 = useState(['', '', '', '', '', ''])
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotCode, setForgotCode]   = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const forgotCodeRefs                = useRef<(HTMLInputElement | null)[]>([])
  const otpRefs                       = useRef<(HTMLInputElement | null)[]>([])
  const { login } = useAuth()
  const navigate  = useNavigate()

  /* Step 1: credentials → simulate 2FA required for demo */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      /* In demo: email containing "2fa" triggers the 2FA step */
      if (email.toLowerCase().includes('2fa') || password === '2fa') {
        await new Promise(r => setTimeout(r, 600))
        setStep('2fa')
      } else {
        await login(email, password)
        navigate('/dashboard', { replace: true })
      }
    } catch {
      setError('E-mail ou senha inválidos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  /* Step 2: OTP verification */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify2FA = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const code = otp.join('')
    if (code.length < 6) { setError('Digite o código completo de 6 dígitos.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    /* Demo: any 6-digit code works */
    await login(email, password).catch(() => {})
    navigate('/dashboard', { replace: true })
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-sm fade-in">

        {/* ─── Logo — Foursys gradient hero ─── */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'var(--foursys-gradient)',
              boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
            }}
            aria-hidden="true"
          >
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>
            Guarda
            <span style={{
              background: 'var(--foursys-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>360°</span>
          </h1>
          <p className="text-caption mt-1">Guarda Compartilhada · Plataforma Jurídica</p>
        </div>

        {/* ─── Card — Foursys: soft shadow + gradient top border ─── */}
        <div
          className="card p-6"
          style={{
            boxShadow: 'var(--shadow-soft)',
            borderTop: '3px solid transparent',
            borderImage: 'var(--foursys-gradient) 1',
          }}
        >
          {/* ════ FORGOT: Step 1 — email ════ */}
          {step === 'forgot-email' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--foursys-gradient)' }} aria-hidden="true">
                  <Mail size={26} className="text-white" />
                </div>
                <h2 className="text-h4" style={{ color: 'var(--color-text-primary)' }}>Recuperar senha</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Informe seu e-mail cadastrado
                </p>
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md text-sm fade-in" style={{ background: 'var(--color-cancelado-bg)', border: '1px solid var(--color-cancelado-border)', color: 'var(--color-cancelado)' }} role="alert">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}
              <form onSubmit={async (e) => {
                e.preventDefault(); setError(''); setLoading(true)
                await new Promise(r => setTimeout(r, 800))
                setLoading(false); setStep('forgot-code')
              }} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>E-mail *</label>
                  <input id="forgot-email" type="email" className="input-field" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="seu@email.com" required autoFocus />
                </div>
                <button type="submit" className="btn-gradient w-full flex items-center justify-center gap-2" disabled={loading || !forgotEmail} style={{ opacity: !forgotEmail || loading ? 0.55 : 1 }} aria-busy={loading}>
                  {loading ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Enviando…</> : 'Enviar código'}
                </button>
              </form>
              <button onClick={() => { setStep('credentials'); setError('') }} className="w-full text-sm flex items-center justify-center gap-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
                <RotateCcw size={13} />Voltar ao login
              </button>
            </div>
          )}

          {/* ════ FORGOT: Step 2 — code ════ */}
          {step === 'forgot-code' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--foursys-gradient)' }} aria-hidden="true">
                  <Smartphone size={26} className="text-white" />
                </div>
                <h2 className="text-h4" style={{ color: 'var(--color-text-primary)' }}>Código de verificação</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Enviamos um código para <strong>{forgotEmail}</strong>
                </p>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault(); setLoading(true)
                await new Promise(r => setTimeout(r, 700))
                setLoading(false); setStep('forgot-reset')
              }} className="space-y-5">
                <div>
                  <label className="text-label block text-center mb-3" style={{ color: 'var(--color-text-secondary)' }}>Código de 6 dígitos</label>
                  <div className="flex gap-2 justify-center">
                    {forgotCode.map((d, i) => (
                      <input key={i} ref={el => { forgotCodeRefs.current[i] = el }}
                        type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e => {
                          if (!/^\d?$/.test(e.target.value)) return
                          const n = [...forgotCode]; n[i] = e.target.value; setForgotCode(n)
                          if (e.target.value && i < 5) forgotCodeRefs.current[i+1]?.focus()
                        }}
                        onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) forgotCodeRefs.current[i-1]?.focus() }}
                        className="w-11 h-12 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none"
                        style={{ border: `2px solid ${d ? 'var(--color-primary)' : 'var(--color-border-dark)'}`, background: 'var(--color-surface-alt)', color: 'var(--color-text-primary)' }}
                        aria-label={`Dígito ${i+1}`}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-gradient w-full" disabled={loading || forgotCode.join('').length < 6} style={{ opacity: forgotCode.join('').length < 6 || loading ? 0.55 : 1 }} aria-busy={loading}>
                  {loading ? 'Verificando…' : 'Verificar código'}
                </button>
              </form>
              <p className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>💡 Demo: qualquer código funciona</p>
            </div>
          )}

          {/* ════ FORGOT: Step 3 — new password ════ */}
          {step === 'forgot-reset' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #0ea5e9)' }} aria-hidden="true">
                  <Lock size={26} className="text-white" />
                </div>
                <h2 className="text-h4" style={{ color: 'var(--color-text-primary)' }}>Nova senha</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Crie uma senha segura de pelo menos 8 caracteres</p>
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md text-sm fade-in" style={{ background: 'var(--color-cancelado-bg)', border: '1px solid var(--color-cancelado-border)', color: 'var(--color-cancelado)' }} role="alert">
                  <AlertCircle size={16} className="flex-shrink-0" />{error}
                </div>
              )}
              <form onSubmit={async (e) => {
                e.preventDefault(); setError('')
                if (newPassword !== confirmNewPassword) { setError('As senhas não coincidem.'); return }
                if (newPassword.length < 8) { setError('Mínimo 8 caracteres.'); return }
                setLoading(true)
                await new Promise(r => setTimeout(r, 800))
                setLoading(false)
                await login(forgotEmail, newPassword).catch(() => {})
                navigate('/dashboard', { replace: true })
              }} className="space-y-4">
                <div>
                  <label htmlFor="new-pwd" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Nova senha *</label>
                  <div className="relative">
                    <input id="new-pwd" type={showNewPassword ? 'text' : 'password'} className="input-field pr-10" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError('') }} placeholder="Mínimo 8 caracteres" required autoFocus />
                    <button type="button" onClick={() => setShowNewPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-disabled)' }} aria-label={showNewPassword ? 'Ocultar' : 'Mostrar'}>
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-new-pwd" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Confirmar nova senha *</label>
                  <input id="confirm-new-pwd" type="password" className={`input-field ${error ? 'input-error' : ''}`} value={confirmNewPassword} onChange={e => { setConfirmNewPassword(e.target.value); setError('') }} placeholder="Repita a nova senha" required />
                </div>
                <button type="submit" className="btn-gradient w-full flex items-center justify-center gap-2" disabled={loading} aria-busy={loading}>
                  {loading ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Salvando…</> : <><CheckCircle size={15} />Salvar nova senha</>}
                </button>
              </form>
            </div>
          )}

          {step === '2fa' ? (
            /* ════ STEP 2: 2FA ════ */
            <div className="space-y-5">
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'var(--foursys-gradient)' }}
                  aria-hidden="true"
                >
                  <Smartphone size={28} className="text-white" />
                </div>
                <h2 className="text-h4" style={{ color: 'var(--color-text-primary)' }}>Verificação em 2 etapas</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Insira o código de 6 dígitos do seu aplicativo autenticador
                </p>
              </div>

              {error && (
                <div
                  className="flex items-center gap-2 p-3 rounded-md text-sm fade-in"
                  style={{ background: 'var(--color-cancelado-bg)', border: '1px solid var(--color-cancelado-border)', color: 'var(--color-cancelado)' }}
                  role="alert"
                >
                  <AlertCircle size={16} className="flex-shrink-0" aria-hidden="true" />
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify2FA} className="space-y-5">
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
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-11 h-12 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none"
                        style={{
                          border: `2px solid ${digit ? 'var(--color-primary)' : 'var(--color-border-dark)'}`,
                          background: 'var(--color-surface-alt)',
                          color: 'var(--color-text-primary)',
                        }}
                        aria-label={`Dígito ${i + 1} do código`}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-gradient w-full flex items-center justify-center gap-2"
                  disabled={loading || otp.join('').length < 6}
                  aria-busy={loading}
                  style={loading || otp.join('').length < 6 ? { opacity: 0.55, cursor: 'not-allowed' } : {}}
                >
                  {loading
                    ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" aria-hidden="true" />Verificando…</>
                    : 'Verificar código'
                  }
                </button>
              </form>

              <div className="flex items-center justify-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setOtp(['','','','','','']); setError('') }}
                  className="flex items-center gap-1.5"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  Voltar ao login
                </button>
                <button
                  type="button"
                  className="font-semibold"
                  style={{ color: 'var(--color-primary)' }}
                  onClick={() => { setOtp(['','','','','','']); alert('Novo código enviado! (simulação)') }}
                >
                  Reenviar código
                </button>
              </div>

              <div
                className="p-3 rounded-xl text-center"
                style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
              >
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  💡 Demo: qualquer código de 6 dígitos funciona
                </p>
              </div>
            </div>
          ) : (
            /* ════ STEP 1: Credentials ════ */
            <>
          <h2 className="text-h4 mb-5" style={{ color: 'var(--color-text-primary)' }}>
            Entrar na conta
          </h2>

          {/* Error banner — DS: error color */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-md text-sm mb-4 fade-in"
              style={{
                background: 'var(--color-cancelado-bg)',
                border: '1px solid var(--color-cancelado-border)',
                color: 'var(--color-cancelado)',
              }}
              role="alert"
              aria-live="polite"
            >
              <AlertCircle size={16} className="flex-shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-label block mb-1.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`input-field ${error ? 'input-error' : ''}`}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                autoFocus
                aria-describedby={error ? 'error-msg' : undefined}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="text-label block mb-1.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`input-field pr-10 ${error ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  aria-describedby={error ? 'error-msg' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-disabled)' }}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword
                    ? <EyeOff size={16} aria-hidden="true" />
                    : <Eye size={16} aria-hidden="true" />
                  }
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="rounded"
                  aria-label="Manter-me conectado"
                />
                <span className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Lembrar-me
                </span>
              </label>
              <button
                type="button"
                className="text-body-sm font-medium"
                style={{ color: 'var(--color-primary)' }}
                onClick={() => { setError(''); setStep('forgot-email') }}
              >
                Esqueci a senha
              </button>
            </div>

            {/* Submit — Foursys gradient CTA */}
            <button
              type="submit"
              className="btn-gradient w-full flex items-center justify-center gap-2"
              disabled={loading || !email || !password}
              aria-busy={loading}
              style={loading || !email || !password ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {loading ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" aria-hidden="true" />
                  Entrando…
                </>
              ) : 'Entrar na plataforma'}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-body-sm mt-4" style={{ color: 'var(--color-text-tertiary)' }}>
            Não tem conta?{' '}
            <Link
              to="/register"
              className="font-semibold"
              style={{ color: 'var(--color-primary)' }}
            >
              Criar conta
            </Link>
          </p>
          </>
          )}
        </div>

        {/* ─── Demo hint ─── */}
        <div
          className="mt-4 p-3 rounded-lg text-sm fade-in"
          style={{
            background: 'var(--color-primary-muted)',
            border: '1px solid var(--color-primary-border)',
          }}
        >
          <p
            className="font-semibold mb-1 flex items-center gap-1.5"
            style={{ color: 'var(--color-primary)' }}
          >
            <Lock size={13} aria-hidden="true" />
            Credenciais de demonstração
          </p>
          <p className="text-caption">
            <span style={{ fontFamily: 'var(--font-mono)' }}>guardian1@guarda360.com</span>
            {' / '}
            <span style={{ fontFamily: 'var(--font-mono)' }}>password123</span>
          </p>
          <p className="text-caption mt-1">
            Para testar 2FA: use senha <span style={{ fontFamily: 'var(--font-mono)' }}>2fa</span>
          </p>
        </div>

        {/* ─── Imutability footer ─── */}
        <p className="text-center text-caption mt-4 px-4">
          Plataforma com registro imutável de dados jurídicos. LGPD compliant.
        </p>
      </div>
    </div>
  )
}
