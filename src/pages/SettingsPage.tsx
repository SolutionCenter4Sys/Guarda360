import { useState } from 'react'
import {
  Settings, Shield, Bell, Lock, User, ChevronRight,
  Smartphone, Check, Eye, EyeOff, Globe, Moon, Sun,
  Save, AlertCircle, Info,
} from 'lucide-react'
import { useToast } from '../context/ToastContext'

/* ─── Permission matrix (F-01.05) ─── */
type Module = 'CALENDAR' | 'CHAT' | 'FINANCIAL' | 'HEALTH' | 'INCIDENTS' | 'REPORTS' | 'AUTHORIZED_PERSONS'
type Permission = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE'
type Profile = 'GUARDIAN_1' | 'GUARDIAN_2' | 'VIEWER'

const moduleLabels: Record<Module, string> = {
  CALENDAR:           'Calendário',
  CHAT:               'Chat Monitorado',
  FINANCIAL:          'Financeiro',
  HEALTH:             'Saúde & Escola',
  INCIDENTS:          'Ocorrências',
  REPORTS:            'Relatórios',
  AUTHORIZED_PERSONS: 'Terceiros Autorizados',
}

const permLabels: Record<Permission, string> = {
  VIEW: 'Visualizar', CREATE: 'Criar', EDIT: 'Editar', DELETE: 'Excluir',
}

type PermMatrix = Record<Module, Record<Permission, boolean>>

const defaultMatrix: Record<Profile, PermMatrix> = {
  GUARDIAN_1: {
    CALENDAR:           { VIEW: true, CREATE: true,  EDIT: true,  DELETE: true  },
    CHAT:               { VIEW: true, CREATE: true,  EDIT: false, DELETE: false },
    FINANCIAL:          { VIEW: true, CREATE: true,  EDIT: true,  DELETE: false },
    HEALTH:             { VIEW: true, CREATE: true,  EDIT: true,  DELETE: true  },
    INCIDENTS:          { VIEW: true, CREATE: true,  EDIT: true,  DELETE: false },
    REPORTS:            { VIEW: true, CREATE: true,  EDIT: false, DELETE: false },
    AUTHORIZED_PERSONS: { VIEW: true, CREATE: true,  EDIT: true,  DELETE: true  },
  },
  GUARDIAN_2: {
    CALENDAR:           { VIEW: true,  CREATE: true,  EDIT: false, DELETE: false },
    CHAT:               { VIEW: true,  CREATE: true,  EDIT: false, DELETE: false },
    FINANCIAL:          { VIEW: true,  CREATE: true,  EDIT: false, DELETE: false },
    HEALTH:             { VIEW: true,  CREATE: true,  EDIT: true,  DELETE: false },
    INCIDENTS:          { VIEW: true,  CREATE: true,  EDIT: false, DELETE: false },
    REPORTS:            { VIEW: true,  CREATE: false, EDIT: false, DELETE: false },
    AUTHORIZED_PERSONS: { VIEW: true,  CREATE: false, EDIT: false, DELETE: false },
  },
  VIEWER: {
    CALENDAR:           { VIEW: true,  CREATE: false, EDIT: false, DELETE: false },
    CHAT:               { VIEW: true,  CREATE: false, EDIT: false, DELETE: false },
    FINANCIAL:          { VIEW: true,  CREATE: false, EDIT: false, DELETE: false },
    HEALTH:             { VIEW: false, CREATE: false, EDIT: false, DELETE: false },
    INCIDENTS:          { VIEW: true,  CREATE: false, EDIT: false, DELETE: false },
    REPORTS:            { VIEW: true,  CREATE: false, EDIT: false, DELETE: false },
    AUTHORIZED_PERSONS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false },
  },
}

const profileLabels: Record<Profile, { label: string; desc: string; color: string }> = {
  GUARDIAN_1: { label: 'Guardião A',      desc: 'Responsável principal — acesso total',    color: '#1d4ed8' },
  GUARDIAN_2: { label: 'Guardião B',      desc: 'Co-guardião — acesso colaborativo',        color: '#7c3aed' },
  VIEWER:     { label: 'Visualizador',    desc: 'Terceiros/advogados — somente leitura',    color: '#059669' },
}

/* ─── Notification config ─── */
const notifOptions = [
  { id: 'visit_upcoming',   label: 'Visita próxima',          desc: 'Notificar 24h antes de cada visita' },
  { id: 'visit_missed',     label: 'Visita não realizada',     desc: 'Alerta quando check-in não ocorre' },
  { id: 'payment_due',      label: 'Pensão a vencer',         desc: 'Aviso 5 dias antes do vencimento' },
  { id: 'message_received', label: 'Nova mensagem no chat',   desc: 'Notificação instantânea' },
  { id: 'expense_pending',  label: 'Despesa para aprovação',  desc: 'Quando nova despesa for enviada' },
  { id: 'incident_created', label: 'Nova ocorrência',         desc: 'Registro de incidente feito pelo outro guardião' },
  { id: 'swap_request',     label: 'Pedido de troca',         desc: 'Solicitação de troca de visita recebida' },
  { id: 'judicial_event',   label: 'Evento judicial',         desc: 'Prazo ou audiência próximos' },
]

type SettingsTab = 'permissions' | 'notifications' | 'security' | 'profile'

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<SettingsTab>('permissions')
  const [selectedProfile, setSelectedProfile] = useState<Profile>('GUARDIAN_1')
  const [matrix, setMatrix] = useState<Record<Profile, PermMatrix>>(defaultMatrix)
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(notifOptions.map(n => [n.id, true]))
  )
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')
  const [language] = useState('pt-BR')
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd]         = useState(false)

  const togglePerm = (mod: Module, perm: Permission) => {
    setMatrix(prev => ({
      ...prev,
      [selectedProfile]: {
        ...prev[selectedProfile],
        [mod]: {
          ...prev[selectedProfile][mod],
          [perm]: !prev[selectedProfile][mod][perm],
        },
      },
    }))
  }

  const handleSave = () => toast('Configurações salvas com sucesso!', 'success')

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'permissions',    label: 'Permissões',     icon: <Shield size={16} /> },
    { id: 'notifications',  label: 'Notificações',   icon: <Bell size={16} /> },
    { id: 'security',       label: 'Segurança',      icon: <Lock size={16} /> },
    { id: 'profile',        label: 'Meu Perfil',     icon: <User size={16} /> },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ═══ HERO ═══ */}
      <div
        className="rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'var(--foursys-gradient)', boxShadow: '0 6px 24px rgba(124,58,237,0.28)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true">
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white leading-tight">Configurações</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Permissões, notificações e segurança</p>
          </div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
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
          TAB: PERMISSIONS (F-01.05)
      ══════════════════════════════════ */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {/* Info */}
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.2)' }} role="note">
            <Info size={15} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              As permissões definem o que cada perfil pode fazer na plataforma. Alterações entram em vigor imediatamente
              e são registradas no log de auditoria. <strong>O Guardião A não pode remover suas próprias permissões de administrador.</strong>
            </p>
          </div>

          {/* Profile selector */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Editar permissões do perfil</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(profileLabels) as [Profile, typeof profileLabels[Profile]][]).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => setSelectedProfile(key)}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    background: selectedProfile === key ? `${p.color}12` : 'var(--color-surface-alt)',
                    border: `2px solid ${selectedProfile === key ? p.color : 'var(--color-border)'}`,
                  }}
                >
                  <p className="text-sm font-bold" style={{ color: selectedProfile === key ? p.color : 'var(--color-text-primary)' }}>
                    {p.label}
                  </p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--color-text-tertiary)' }}>
                    {p.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Permission matrix */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)' }}>
            {/* Header */}
            <div className="grid grid-cols-5 gap-0 px-4 py-2.5" style={{ background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
              <div className="col-span-1">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>Módulo</p>
              </div>
              {(Object.entries(permLabels) as [Permission, string][]).map(([k, v]) => (
                <div key={k} className="text-center">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>{v}</p>
                </div>
              ))}
            </div>

            {/* Rows */}
            {(Object.entries(moduleLabels) as [Module, string][]).map(([mod, label], idx, arr) => (
              <div
                key={mod}
                className="grid grid-cols-5 gap-0 px-4 py-3 items-center"
                style={{
                  borderBottom: idx < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                  background: idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-alt)',
                }}
              >
                <div className="col-span-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
                </div>
                {(Object.keys(permLabels) as Permission[]).map(perm => {
                  const isOn = matrix[selectedProfile][mod][perm]
                  const isDisabled = selectedProfile === 'GUARDIAN_1' && perm === 'VIEW'
                  return (
                    <div key={perm} className="flex justify-center">
                      <button
                        onClick={() => !isDisabled && togglePerm(mod, perm)}
                        disabled={isDisabled}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                        style={{
                          background: isOn ? 'var(--color-confirmado-bg)' : 'var(--color-border)',
                          color: isOn ? 'var(--color-confirmado)' : 'transparent',
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                        aria-label={`${label} — ${permLabels[perm]}: ${isOn ? 'ativado' : 'desativado'}`}
                        aria-pressed={isOn}
                      >
                        {isOn && <Check size={13} aria-hidden="true" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <button onClick={handleSave} className="btn-gradient flex items-center gap-2 ml-auto">
            <Save size={15} aria-hidden="true" />
            Salvar permissões
          </button>
        </div>
      )}

      {/* ══════════════════════════════════
          TAB: NOTIFICATIONS
      ══════════════════════════════════ */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="card p-5 space-y-1" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
              Canais de notificação
            </p>
            {[
              { id: 'push',  label: 'Notificações Push',     desc: 'Alertas no navegador e aplicativo mobile' },
              { id: 'email', label: 'E-mail',                desc: 'Resumo diário de atividades' },
              { id: 'sms',   label: 'SMS',                   desc: 'Apenas eventos críticos (visita não cumprida, etc.)' },
            ].map(ch => (
              <label key={ch.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all" style={{ background: 'var(--color-surface-alt)' }}>
                <input
                  type="checkbox"
                  defaultChecked={ch.id !== 'sms'}
                  className="rounded"
                  aria-label={ch.label}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{ch.label}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{ch.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="card p-5" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
              Eventos para notificar
            </p>
            <div className="space-y-1">
              {notifOptions.map(opt => (
                <label key={opt.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all" style={{ background: notifs[opt.id] ? 'var(--color-primary-muted)' : 'var(--color-surface-alt)', border: `1px solid ${notifs[opt.id] ? 'var(--color-primary)' : 'transparent'}` }}>
                  <input
                    type="checkbox"
                    checked={notifs[opt.id]}
                    onChange={e => setNotifs(p => ({ ...p, [opt.id]: e.target.checked }))}
                    className="rounded"
                    aria-label={opt.label}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{opt.label}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{opt.desc}</p>
                  </div>
                  <Bell size={14} style={{ color: notifs[opt.id] ? 'var(--color-primary)' : 'var(--color-text-disabled)' }} aria-hidden="true" />
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleSave} className="btn-gradient flex items-center gap-2 ml-auto">
            <Save size={15} />Salvar notificações
          </button>
        </div>
      )}

      {/* ══════════════════════════════════
          TAB: SECURITY
      ══════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          {/* Change password */}
          <div className="card p-5 space-y-4" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Lock size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Alterar senha</h3>
            </div>
            <div>
              <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Senha atual *</label>
              <div className="relative">
                <input type={showCurrentPwd ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowCurrentPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-disabled)' }} aria-label="Mostrar/Ocultar">
                  {showCurrentPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Nova senha *</label>
              <div className="relative">
                <input type={showNewPwd ? 'text' : 'password'} className="input-field pr-10" placeholder="Mínimo 8 caracteres" />
                <button type="button" onClick={() => setShowNewPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-disabled)' }} aria-label="Mostrar/Ocultar">
                  {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Confirmar nova senha *</label>
              <input type="password" className="input-field" placeholder="Repita a nova senha" />
            </div>
            <button onClick={() => toast('Senha alterada com sucesso!', 'success')} className="btn-gradient flex items-center gap-2">
              <Save size={15} />Alterar senha
            </button>
          </div>

          {/* 2FA */}
          <div className="card p-5 space-y-3" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Verificação em dois fatores (2FA)</h3>
              </div>
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'var(--color-confirmado-bg)', color: 'var(--color-confirmado)' }}
              >
                <Check size={11} />Ativo
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              O 2FA adiciona uma camada extra de segurança exigindo um código adicional a cada login.
              Recomendamos manter ativado, especialmente por tratar-se de dados sensíveis sobre menores.
            </p>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)' }}>
              <div className="flex items-center gap-2">
                <AlertCircle size={14} style={{ color: '#dc2626' }} aria-hidden="true" />
                <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>Desativar o 2FA reduz a segurança da conta</p>
              </div>
            </div>
            <button
              onClick={() => toast('Para desativar o 2FA, confirme por e-mail. Um link foi enviado para maria@email.com', 'info')}
              className="text-sm font-semibold"
              style={{ color: 'var(--color-cancelado)' }}
            >
              Desativar 2FA
            </button>
          </div>

          {/* Active sessions */}
          <div className="card p-5 space-y-3" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Globe size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>Sessões ativas</h3>
            </div>
            {[
              { device: 'Chrome 121 · Windows 10', ip: '200.142.10.25', current: true,  lastSeen: 'Agora' },
              { device: 'Safari · iPhone 15',      ip: '200.142.10.25', current: false, lastSeen: 'Há 2 horas' },
              { device: 'Firefox · macOS',         ip: '187.33.20.5',   current: false, lastSeen: 'Há 3 dias' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl gap-3" style={{ background: 'var(--color-surface-alt)', border: s.current ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{s.device}</p>
                    {s.current && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'var(--color-primary)', color: '#fff' }}>Atual</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>IP {s.ip} · {s.lastSeen}</p>
                </div>
                {!s.current && (
                  <button
                    onClick={() => toast('Sessão encerrada.', 'warning')}
                    className="text-xs font-semibold"
                    style={{ color: 'var(--color-cancelado)' }}
                  >
                    Encerrar
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => toast('Todas as outras sessões foram encerradas.', 'warning')} className="text-sm font-semibold" style={{ color: 'var(--color-cancelado)' }}>
              Encerrar todas as outras sessões
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          TAB: PROFILE
      ══════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {/* Avatar */}
          <div className="card p-5 space-y-4" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0"
                style={{ background: 'var(--foursys-gradient)' }}
                aria-hidden="true"
              >
                M
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Maria Silva</p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Guardião A · Responsável principal</p>
                <button className="mt-1 text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>Alterar foto</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Nome completo</label>
                <input type="text" className="input-field" defaultValue="Maria Silva" />
              </div>
              <div>
                <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>CPF</label>
                <input type="text" className="input-field font-mono" defaultValue="123.456.789-00" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div>
                <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>E-mail</label>
                <input type="email" className="input-field" defaultValue="maria@email.com" />
              </div>
              <div>
                <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Telefone</label>
                <input type="tel" className="input-field" defaultValue="(11) 99999-8888" />
              </div>
              <div className="col-span-2">
                <label className="text-label block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Endereço</label>
                <input type="text" className="input-field" defaultValue="Rua das Flores, 123 — São Paulo, SP" />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="card p-5 space-y-3" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Aparência</h3>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'light', label: 'Claro',       icon: <Sun size={18} /> },
                { id: 'dark',  label: 'Escuro',      icon: <Moon size={18} /> },
                { id: 'auto',  label: 'Sistema',     icon: <Globe size={18} /> },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                  style={{
                    background: theme === t.id ? 'var(--color-primary-muted)' : 'var(--color-surface-alt)',
                    border: `1.5px solid ${theme === t.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    color: theme === t.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  {t.icon}
                  <span className="text-xs font-semibold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5 space-y-3" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Idioma</h3>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
              <Globe size={16} style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Português do Brasil</p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{language}</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
            </div>
          </div>

          <button onClick={handleSave} className="btn-gradient flex items-center gap-2 ml-auto">
            <Save size={15} />Salvar perfil
          </button>
        </div>
      )}
    </div>
  )
}
