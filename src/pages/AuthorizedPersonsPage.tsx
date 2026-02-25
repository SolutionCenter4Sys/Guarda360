import { useState } from 'react'
import {
  Scale, UserPlus, X, Mail, Phone, Shield, Check,
  Clock, Ban, ChevronRight, Briefcase, Eye, AlertCircle,
} from 'lucide-react'
import { mockAuthorizedPersons, mockChildren } from '../mocks'
import { useToast } from '../context/ToastContext'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AuthorizedPerson, AuthorizedPersonRole, AccessLevel } from '../types'

/* ─── Label maps ─── */
const roleLabels: Record<AuthorizedPersonRole, { label: string; icon: React.ReactNode; color: string }> = {
  ADVOGADO:          { label: 'Advogado(a)',          icon: <Scale size={14} />,     color: '#7c3aed' },
  PSICOLOGO:         { label: 'Psicólogo(a)',         icon: <Briefcase size={14} />, color: '#0ea5e9' },
  ASSISTENTE_SOCIAL: { label: 'Assistente Social',    icon: <Shield size={14} />,    color: '#059669' },
  MEDIADOR:          { label: 'Mediador(a)',           icon: <Eye size={14} />,       color: '#d97706' },
  OUTRO:             { label: 'Outro',                 icon: <Briefcase size={14} />, color: '#6b7280' },
}

const accessLabels: Record<AccessLevel, string> = {
  LEITURA:             'Leitura geral',
  LEITURA_CHAT:        'Chat (somente leitura)',
  LEITURA_FINANCEIRO:  'Financeiro (somente leitura)',
  RELATORIOS:          'Relatórios e exportação',
  TOTAL:               'Acesso total',
}

const statusConfig: Record<AuthorizedPerson['status'], { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  ATIVO:    { label: 'Ativo',    bg: 'var(--color-confirmado-bg)', text: 'var(--color-confirmado)', icon: <Check size={12} /> },
  PENDENTE: { label: 'Pendente', bg: 'var(--color-pendente-bg)',   text: 'var(--color-pendente)',   icon: <Clock size={12} /> },
  INATIVO:  { label: 'Inativo',  bg: 'var(--color-cancelado-bg)',  text: 'var(--color-cancelado)',  icon: <Ban size={12} /> },
}

export default function AuthorizedPersonsPage() {
  const [persons, setPersons] = useState<AuthorizedPerson[]>(mockAuthorizedPersons)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [detailPerson, setDetailPerson]       = useState<AuthorizedPerson | null>(null)
  const [filterRole, setFilterRole]           = useState<AuthorizedPersonRole | 'ALL'>('ALL')
  const { toast } = useToast()

  const filtered = persons.filter(p => filterRole === 'ALL' || p.role === filterRole)

  const handleRevoke = (id: string) => {
    setPersons(prev => prev.map(p => p.id === id ? { ...p, status: 'INATIVO' } : p))
    setDetailPerson(null)
    toast('Acesso revogado com sucesso.', 'warning')
  }

  const handleReactivate = (id: string) => {
    setPersons(prev => prev.map(p => p.id === id ? { ...p, status: 'ATIVO' } : p))
    toast('Acesso reativado.', 'success')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ═══ HERO ═══ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #1d4ed8 100%)', boxShadow: '0 6px 24px rgba(124,58,237,0.28)' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-wrap gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true">
              <Scale size={20} color="#fff" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight">Terceiros Autorizados</h2>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Advogados, psicólogos, mediadores e assistentes com acesso controlado
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all"
            style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.35)' }}
          >
            <UserPlus size={14} aria-hidden="true" />
            Convidar profissional
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px px-5 py-4 text-white">
          {[
            { label: 'Ativos',   value: persons.filter(p => p.status === 'ATIVO').length },
            { label: 'Pendentes',value: persons.filter(p => p.status === 'PENDENTE').length },
            { label: 'Redes',    value: [...new Set(persons.flatMap(p => p.linkedChildIds))].length },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold leading-none">{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ LEGAL WARNING ═══ */}
      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }} role="note">
        <Shield size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Todos os acessos de terceiros são registrados em <strong>log de auditoria imutável</strong>. 
          O profissional tem acesso somente de leitura às informações autorizadas, sem capacidade de edição ou exclusão.
          O consentimento de ambos os guardiões é necessário para acesso completo.
        </p>
      </div>

      {/* ═══ FILTER ═══ */}
      <div className="flex gap-2 flex-wrap">
        {([['ALL', 'Todos'], ...Object.entries(roleLabels).map(([k, v]) => [k, v.label])] as [string, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterRole(key as AuthorizedPersonRole | 'ALL')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: filterRole === key ? 'var(--color-primary)' : 'var(--color-surface-alt)',
              color: filterRole === key ? '#fff' : 'var(--color-text-secondary)',
              border: filterRole === key ? 'none' : '1px solid var(--color-border)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ═══ LIST ═══ */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--color-surface-alt)', border: '1px dashed var(--color-border-dark)' }}>
          <Scale size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Nenhum profissional cadastrado</p>
          <button onClick={() => setShowInviteModal(true)} className="mt-3 text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
            + Convidar primeiro profissional
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(person => {
            const role = roleLabels[person.role]
            const st   = statusConfig[person.status]
            return (
              <div
                key={person.id}
                className="p-4 rounded-xl cursor-pointer transition-all"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-soft)',
                  borderLeft: `4px solid ${role.color}`,
                }}
                onClick={() => setDetailPerson(person)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') setDetailPerson(person) }}
                aria-label={`${person.name} — ${role.label}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${role.color}, ${role.color}99)` }}
                      aria-hidden="true"
                    >
                      {person.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{person.name}</p>
                        <div
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: `${role.color}15`, color: role.color }}
                        >
                          {role.icon}
                          {role.label}
                        </div>
                        {person.oabNumber && (
                          <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>{person.oabNumber}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          <Mail size={11} aria-hidden="true" />{person.email}
                        </span>
                        {person.phone && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                            <Phone size={11} aria-hidden="true" />{person.phone}
                          </span>
                        )}
                      </div>
                      {/* Linked children */}
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {person.linkedChildIds.map(cid => {
                          const child = mockChildren.find(c => c.id === cid)
                          return child ? (
                            <span
                              key={cid}
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
                            >
                              {child.fullName.split(' ')[0]}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: st.bg, color: st.text }}
                    >
                      {st.icon}{st.label}
                    </span>
                    {person.acceptedAt && (
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        Desde {format(parseISO(person.acceptedAt), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    )}
                    <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
                  </div>
                </div>

                {/* Access level chips */}
                <div className="flex gap-1.5 flex-wrap mt-2.5 pt-2.5" style={{ borderTop: '1px solid var(--color-border)' }}>
                  {person.accessLevel.map(al => (
                    <span
                      key={al}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
                    >
                      {accessLabels[al]}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ MODAL: DETAIL / ACTIONS ═══ */}
      {detailPerson && (() => {
        const role = roleLabels[detailPerson.role]
        const st   = statusConfig[detailPerson.status]
        return (
          <div className="fixed inset-0 flex items-center justify-center p-4 fade-in" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} role="dialog" aria-modal="true">
            <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div className="p-5 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${role.color}, ${role.color}99)` }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-xl" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true">
                    {detailPerson.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{detailPerson.name}</h3>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>{role.label} · {detailPerson.oabNumber ?? detailPerson.email}</p>
                  </div>
                </div>
                <button onClick={() => setDetailPerson(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} aria-label="Fechar">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4" style={{ background: 'var(--color-surface)' }}>
                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'E-mail', value: detailPerson.email },
                    { label: 'Telefone', value: detailPerson.phone ?? '—' },
                    { label: 'Status', value: st.label },
                    { label: 'Convidado em', value: format(parseISO(detailPerson.invitedAt), 'dd/MM/yyyy', { locale: ptBR }) },
                    detailPerson.acceptedAt ? { label: 'Aceito em', value: format(parseISO(detailPerson.acceptedAt), 'dd/MM/yyyy', { locale: ptBR }) } : null,
                  ].filter(Boolean).map((item, i) => item && (
                    <div key={i} className="p-2.5 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.label}</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Access levels */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Permissões de acesso</p>
                  <div className="space-y-1.5">
                    {(Object.entries(accessLabels) as [AccessLevel, string][]).map(([key, label]) => {
                      const active = detailPerson.accessLevel.includes(key)
                      return (
                        <div key={key} className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                            style={{
                              background: active ? 'var(--color-confirmado-bg)' : 'var(--color-border)',
                              color: active ? 'var(--color-confirmado)' : 'transparent',
                            }}
                            aria-hidden="true"
                          >
                            {active && <Check size={12} />}
                          </div>
                          <p className="text-xs" style={{ color: active ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>{label}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Linked children */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Filhos vinculados</p>
                  <div className="flex gap-2 flex-wrap">
                    {detailPerson.linkedChildIds.map(cid => {
                      const child = mockChildren.find(c => c.id === cid)
                      return child ? (
                        <span key={cid} className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
                          {child.fullName}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setDetailPerson(null)} className="btn-secondary flex-1">Fechar</button>
                  {detailPerson.status === 'PENDENTE' && (
                    <button
                      onClick={() => { toast(`Convite reenviado para ${detailPerson.email}`, 'info'); setDetailPerson(null) }}
                      className="btn-secondary flex-1 flex items-center justify-center gap-1.5"
                    >
                      <Mail size={14} />Reenviar convite
                    </button>
                  )}
                  {detailPerson.status === 'ATIVO' && (
                    <button
                      onClick={() => handleRevoke(detailPerson.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: 'var(--color-cancelado-bg)', color: 'var(--color-cancelado)', border: '1px solid var(--color-cancelado-border)' }}
                    >
                      <Ban size={14} />Revogar acesso
                    </button>
                  )}
                  {detailPerson.status === 'INATIVO' && (
                    <button
                      onClick={() => { handleReactivate(detailPerson.id); setDetailPerson(null) }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: 'var(--color-confirmado-bg)', color: 'var(--color-confirmado)', border: '1px solid var(--color-confirmado-border)' }}
                    >
                      <Check size={14} />Reativar acesso
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ═══ MODAL: INVITE ═══ */}
      {showInviteModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 fade-in" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} role="dialog" aria-modal="true" aria-labelledby="modal-invite-title">
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div className="p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #7c3aed, #1d4ed8)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true">
                  <UserPlus size={20} color="#fff" />
                </div>
                <h3 id="modal-invite-title" className="text-lg font-bold text-white">Convidar Profissional</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} aria-label="Fechar">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 max-h-[80vh] overflow-y-auto" style={{ background: 'var(--color-surface)' }}>
              {/* Warning */}
              <div className="p-3 rounded-xl flex items-start gap-2 mb-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <AlertCircle size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  O profissional receberá um convite por e-mail. Após aceitar, terá acesso somente às informações autorizadas abaixo. Todos os acessos são registrados em auditoria.
                </p>
              </div>
              <form
                onSubmit={async e => {
                  e.preventDefault()
                  await new Promise(r => setTimeout(r, 600))
                  setShowInviteModal(false)
                  toast('Convite enviado com sucesso! O profissional receberá o e-mail em breve.', 'success')
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Tipo de profissional *</label>
                  <select className="input-field">
                    {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Nome completo *</label>
                  <input type="text" className="input-field" placeholder="Dr(a). Nome Sobrenome" required autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>E-mail profissional *</label>
                  <input type="email" className="input-field" placeholder="profissional@exemplo.com.br" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Telefone</label>
                    <input type="tel" className="input-field" placeholder="(11) 99999-9999" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>OAB / CRP / CRESS</label>
                    <input type="text" className="input-field" placeholder="Número de registro" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Permissões de acesso *</label>
                  <div className="space-y-1.5">
                    {(Object.entries(accessLabels) as [AccessLevel, string][]).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer" style={{ background: 'var(--color-surface-alt)' }}>
                        <input type="checkbox" defaultChecked={key === 'LEITURA'} className="rounded" />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Filhos que pode acessar *</label>
                  <div className="space-y-1.5">
                    {mockChildren.map(c => (
                      <label key={c.id} className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer" style={{ background: 'var(--color-surface-alt)' }}>
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{c.fullName}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary flex-1">Cancelar</button>
                  <button type="submit" className="btn-gradient flex-1 flex items-center justify-center gap-1.5">
                    <Mail size={14} />Enviar convite
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
