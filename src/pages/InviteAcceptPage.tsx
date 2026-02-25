import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Shield, UserCheck, Users, CheckCircle, ChevronRight,
  Eye, EyeOff, AlertCircle,
} from 'lucide-react'

type InviteStep = 'preview' | 'register' | 'confirmed'

/* Simulated invite data (in real world fetched by token) */
const MOCK_INVITE = {
  token: 'demo-invite-token',
  inviterName: 'Maria Silva',
  childName: 'Lucas Pereira',
  childAge: 11,
  role: 'GUARDIAN_2' as const,
  expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
}

export default function InviteAcceptPage() {
  const [step, setStep]               = useState<InviteStep>('preview')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const navigate                      = useNavigate()
  const [searchParams]                = useSearchParams()

  const token = searchParams.get('token') ?? MOCK_INVITE.token
  const invite = MOCK_INVITE // In production: fetch by token

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200)) // Simulate API
    setLoading(false)
    setStep('confirmed')
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-sm w-full text-center space-y-3">
          <AlertCircle size={48} className="mx-auto" style={{ color: 'var(--color-cancelado)' }} aria-hidden="true" />
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Link inválido</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            Este link de convite é inválido ou já expirou.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary">Ir para o login</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-md fade-in">

        {/* Logo */}
        <div className="text-center mb-6">
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
        </div>

        {/* ══ STEP 1: Preview ══ */}
        {step === 'preview' && (
          <div className="card p-6 space-y-5" style={{ boxShadow: 'var(--shadow-soft)', borderTop: '3px solid transparent', borderImage: 'var(--foursys-gradient) 1' }}>
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(29,78,216,0.1), rgba(124,58,237,0.1))' }}
                aria-hidden="true"
              >
                <Users size={32} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Você foi convidado!
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{invite.inviterName}</span>{' '}
                convidou você para ser co-guardião(a) de:
              </p>
            </div>

            {/* Child info */}
            <div
              className="p-4 rounded-xl flex items-center gap-4"
              style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
                aria-hidden="true"
              >
                {invite.childName.charAt(0)}
              </div>
              <div>
                <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{invite.childName}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{invite.childAge} anos</p>
                <div
                  className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'var(--color-guardian-b-bg)', color: 'var(--color-guardian-b)' }}
                >
                  <Shield size={10} aria-hidden="true" />
                  Guardião B (Co-guardião)
                </div>
              </div>
            </div>

            {/* What you'll have access to */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>
                O que você poderá fazer
              </p>
              {[
                'Ver e gerenciar o calendário de visitas',
                'Comunicar-se pelo chat monitorado',
                'Acompanhar pagamentos de pensão',
                'Registrar consultas médicas e documentos',
                'Registrar ocorrências se necessário',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle size={14} style={{ color: 'var(--color-confirmado)', flexShrink: 0 }} aria-hidden="true" />
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => alert('Convite recusado (demo)')}
                className="btn-secondary flex-1"
              >
                Recusar convite
              </button>
              <button
                onClick={() => setStep('register')}
                className="btn-gradient flex-1 flex items-center justify-center gap-1.5"
              >
                Aceitar e criar conta
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <p className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              Convite expira em{' '}
              {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(invite.expiry))}
            </p>
          </div>
        )}

        {/* ══ STEP 2: Register ══ */}
        {step === 'register' && (
          <div className="card p-6 space-y-5" style={{ boxShadow: 'var(--shadow-soft)', borderTop: '3px solid transparent', borderImage: 'var(--foursys-gradient) 1' }}>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Criar sua conta</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                Preencha seus dados para aceitar o convite
              </p>
            </div>

            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm fade-in"
                style={{ background: 'var(--color-cancelado-bg)', border: '1px solid var(--color-cancelado-border)', color: 'var(--color-cancelado)' }}
                role="alert"
              >
                <AlertCircle size={16} className="flex-shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="invite-name" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Nome completo *
                </label>
                <input
                  id="invite-name"
                  type="text"
                  className="input-field"
                  placeholder="Seu nome completo"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="invite-cpf" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  CPF *
                </label>
                <input
                  id="invite-cpf"
                  type="text"
                  className="input-field"
                  placeholder="000.000.000-00"
                  required
                  maxLength={14}
                />
              </div>
              <div>
                <label htmlFor="invite-email" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  E-mail *
                </label>
                <input
                  id="invite-email"
                  type="email"
                  className="input-field"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="invite-phone" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Telefone
                </label>
                <input
                  id="invite-phone"
                  type="tel"
                  className="input-field"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label htmlFor="invite-password" className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Senha *
                </label>
                <div className="relative">
                  <input
                    id="invite-password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-text-disabled)' }}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" required className="rounded mt-0.5" />
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Aceito os{' '}
                  <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Termos de Uso</span>
                  {' '}e a{' '}
                  <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Política de Privacidade</span>
                  {' '}da plataforma, incluindo o registro imutável de comunicações para fins jurídicos.
                </p>
              </label>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('preview')} className="btn-secondary flex-1">Voltar</button>
                <button
                  type="submit"
                  className="btn-gradient flex-1 flex items-center justify-center gap-2"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading
                    ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" aria-hidden="true" />Criando conta…</>
                    : 'Criar conta e aceitar'
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══ STEP 3: Confirmed ══ */}
        {step === 'confirmed' && (
          <div className="card p-8 text-center space-y-5" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <div
              className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #059669, #0ea5e9)' }}
              aria-hidden="true"
            >
              <UserCheck size={40} className="text-white" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                Bem-vindo(a) ao Guarda360°!
              </h2>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Sua conta foi criada e você agora é co-guardião(a) de{' '}
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{invite.childName}</span>.
              </p>
            </div>

            {[
              { icon: '📅', text: 'Acesse o calendário de visitas' },
              { icon: '💬', text: 'Comunique-se pelo chat monitorado' },
              { icon: '🏥', text: 'Acompanhe saúde e escola' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.text}</p>
              </div>
            ))}

            <button
              onClick={() => navigate('/dashboard', { replace: true })}
              className="btn-gradient w-full flex items-center justify-center gap-2"
            >
              Acessar a plataforma
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        <p className="text-center text-xs mt-4" style={{ color: 'var(--color-text-tertiary)' }}>
          Plataforma com registro imutável de dados jurídicos. LGPD compliant.
        </p>
      </div>
    </div>
  )
}
