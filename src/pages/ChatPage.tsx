import { useState, useRef, useEffect, type FormEvent } from 'react'
import {
  Send, Star, Paperclip, Lock, Info, Mic, X,
  AlertTriangle, CheckCheck, Check, Download,
  Eye, EyeOff, Filter, FileText, Clock,
} from 'lucide-react'
import { mockMessages, mockChildren, mockCurrentUser, mockAuthorizedPersons } from '../mocks'
import { format, parseISO, differenceInHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Message } from '../types'
import { HashBadge } from '../components/ui/Badge'
import { FileUpload } from '../components/ui/FileUpload'
import { useToast } from '../context/ToastContext'

/* ─── F-03.07: Lista de palavras ofensivas (MVP) ─── */
const OFFENSIVE_KEYWORDS = [
  'idiota', 'imbecil', 'burro', 'miserável', 'inútil',
  'incompetente', 'irresponsável', 'negligente', 'vagabundo',
  'louco', 'psicopata', 'mentiroso', 'manipulador',
]

const detectOffensive = (text: string): boolean => {
  const lower = text.toLowerCase()
  return OFFENSIVE_KEYWORDS.some(kw => lower.includes(kw))
}

/* ─── F-03.08: Mensagens não respondidas (>24h sem resposta) ─── */
const getUnansweredCount = (msgs: Message[], myId: string): number =>
  msgs.filter(m => {
    if (m.senderId === myId) return false
    const hoursSince = differenceInHours(new Date(), parseISO(m.createdAt))
    return !m.read && hoursSince >= 24
  }).length

type ChatFilter = 'ALL' | 'RELEVANT' | 'OFFENSIVE'
type ChatMode   = 'GUARDIAN' | 'VIEWER'

export default function ChatPage() {
  const [selectedChild, setSelectedChild]     = useState(mockChildren[0].id)
  const [messages, setMessages]               = useState<Message[]>(mockMessages)
  const [inputText, setInputText]             = useState('')
  const [chatFilter, setChatFilter]           = useState<ChatFilter>('ALL')
  const [showAttachModal, setShowAttachModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [chatMode, setChatMode]               = useState<ChatMode>('GUARDIAN')
  const [isRecording, setIsRecording]         = useState(false)
  const [recordingTime, setRecordingTime]     = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef    = useRef<HTMLTextAreaElement>(null)
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { toast } = useToast()

  const childMessages = messages.filter(m => m.childId === selectedChild)

  const filteredMessages = childMessages.filter(m => {
    if (chatFilter === 'RELEVANT')  return m.isLegallyRelevant
    if (chatFilter === 'OFFENSIVE') return m.offensiveDetected
    if (chatMode === 'VIEWER')      return m.isLegallyRelevant
    return true
  })

  const unansweredCount = getUnansweredCount(childMessages, mockCurrentUser.id)
  const offensiveCount  = childMessages.filter(m => m.offensiveDetected).length
  const relevantCount   = childMessages.filter(m => m.isLegallyRelevant).length

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [filteredMessages])

  /* ─── Mark messages as read on view ─── */
  useEffect(() => {
    setMessages(prev =>
      prev.map(m =>
        m.childId === selectedChild && m.senderId !== mockCurrentUser.id && !m.read
          ? { ...m, read: true }
          : m
      )
    )
  }, [selectedChild])

  const handleSend = (e?: FormEvent) => {
    e?.preventDefault()
    if (!inputText.trim()) return
    const text     = inputText.trim()
    const offensive = detectOffensive(text)
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      childId: selectedChild,
      senderId: mockCurrentUser.id,
      senderName: mockCurrentUser.fullName,
      senderRole: 'GUARDIAN_1',
      type: 'TEXT',
      content: text,
      isLegallyRelevant: false,
      offensiveDetected: offensive,
      createdAt: new Date().toISOString(),
      delivered: true,
      read: false,
    }
    setMessages(prev => [...prev, newMsg])
    setInputText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    if (offensive) {
      setTimeout(() => {
        toast('⚠️ Linguagem potencialmente ofensiva detectada. A mensagem foi registrada com marcação automática.', 'warning')
      }, 800)
    }
  }

  const handleMarkRelevant = (msgId: string) => {
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, isLegallyRelevant: !m.isLegallyRelevant } : m)
    )
  }

  /* ─── Recording (F-03.02 — simulated) ─── */
  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    recordTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
  }

  const stopRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current)
    setIsRecording(false)
    setRecordingTime(0)
    const audioMsg: Message = {
      id: `msg-${Date.now()}`,
      childId: selectedChild,
      senderId: mockCurrentUser.id,
      senderName: mockCurrentUser.fullName,
      senderRole: 'GUARDIAN_1',
      type: 'AUDIO',
      content: `[Mensagem de áudio — ${recordingTime}s]`,
      isLegallyRelevant: false,
      offensiveDetected: false,
      createdAt: new Date().toISOString(),
      delivered: true,
      read: false,
    }
    setMessages(prev => [...prev, audioMsg])
    toast('Áudio enviado com registro de integridade!', 'success')
  }

  /* ─── F-03.06: Export chat ─── */
  const exportChat = (filter: 'ALL' | 'RELEVANT', periodDays: number) => {
    const since = new Date()
    since.setDate(since.getDate() - periodDays)
    const toExport = childMessages
      .filter(m => {
        if (filter === 'RELEVANT' && !m.isLegallyRelevant) return false
        return parseISO(m.createdAt) >= since
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    const child = mockChildren.find(c => c.id === selectedChild)
    const lines = [
      `GUARDA360° — EXPORTAÇÃO DE CHAT`,
      `Filho(a): ${child?.fullName ?? selectedChild}`,
      `Período: últimos ${periodDays} dias`,
      `Tipo: ${filter === 'RELEVANT' ? 'Apenas mensagens relevantes' : 'Todas as mensagens'}`,
      `Data de exportação: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
      `Total de mensagens: ${toExport.length}`,
      ``,
      `ATENÇÃO: Este arquivo foi gerado pelo sistema Guarda360° e tem valor jurídico.`,
      `Hash de integridade calculado no servidor (SHA-256).`,
      `${'─'.repeat(60)}`,
      ``,
    ]

    toExport.forEach(m => {
      const ts     = format(parseISO(m.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })
      const role   = m.senderRole === 'GUARDIAN_1' ? '[Guardião A]' : '[Guardião B]'
      const flags  = [
        m.isLegallyRelevant  ? '★ RELEVANTE'  : '',
        m.offensiveDetected  ? '⚠ SINALIZADO' : '',
      ].filter(Boolean).join(' | ')
      lines.push(`${ts} ${role} ${m.senderName}`)
      lines.push(`${m.content}`)
      if (flags) lines.push(`  ${flags}`)
      lines.push('')
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `guarda360-chat-${child?.fullName.split(' ')[0]}-${format(new Date(), 'yyyyMMdd')}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast('Chat exportado com sucesso!', 'success')
    setShowExportModal(false)
  }

  /* ─── Helpers ─── */
  const formatTime = (iso: string) => {
    try { return format(parseISO(iso), 'HH:mm', { locale: ptBR }) } catch { return '' }
  }

  const isSameDate = (a: string, b: string) => {
    try { return format(parseISO(a), 'dd/MM') === format(parseISO(b), 'dd/MM') }
    catch { return false }
  }

  const authorizedForChild = mockAuthorizedPersons.filter(
    ap => ap.linkedChildIds.includes(selectedChild) && ap.status === 'ATIVO'
  )

  const isViewer = chatMode === 'VIEWER'

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-3">

      {/* ─── Header ─── */}
      <div className="card p-3 flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedChild}
            onChange={e => setSelectedChild(e.target.value)}
            className="input-field w-auto"
            style={{ minHeight: '36px', padding: '0 12px' }}
          >
            {mockChildren.map(c => (
              <option key={c.id} value={c.id}>{c.fullName.split(' ')[0]} {c.fullName.split(' ').slice(-1)[0]}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <span className="pulse w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-confirmado)' }} />
            <span className="text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>João Pereira online</span>
          </div>

          {/* F-03.09: Viewer mode toggle */}
          {authorizedForChild.length > 0 && (
            <button
              onClick={() => setChatMode(m => m === 'GUARDIAN' ? 'VIEWER' : 'GUARDIAN')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: isViewer ? 'rgba(124,58,237,0.1)' : 'var(--color-surface-alt)',
                color: isViewer ? '#7c3aed' : 'var(--color-text-secondary)',
                border: `1px solid ${isViewer ? 'rgba(124,58,237,0.3)' : 'var(--color-border)'}`,
              }}
              title={isViewer ? 'Sair do modo visualizador' : 'Simular visão de profissional'}
              aria-pressed={isViewer}
            >
              {isViewer ? <EyeOff size={12} /> : <Eye size={12} />}
              {isViewer ? 'Visão do profissional' : 'Visão profissional'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter chips */}
          <div className="flex gap-1 p-0.5 rounded-full" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
            {([
              ['ALL',       'Todos',       undefined],
              ['RELEVANT',  `★ ${relevantCount}`,  'var(--g-amber-600)'],
              ['OFFENSIVE', `⚠️ ${offensiveCount}`, 'var(--color-cancelado)'],
            ] as [ChatFilter, string, string | undefined][]).map(([key, label, color]) => (
              <button
                key={key}
                onClick={() => setChatFilter(key)}
                className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: chatFilter === key ? 'var(--color-surface)' : 'transparent',
                  color: chatFilter === key ? (color ?? 'var(--color-primary)') : 'var(--color-text-tertiary)',
                  boxShadow: chatFilter === key ? 'var(--shadow-soft)' : 'none',
                }}
                aria-pressed={chatFilter === key}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
            aria-label="Exportar chat"
          >
            <Download size={12} aria-hidden="true" />
            Exportar
          </button>
        </div>
      </div>

      {/* ─── F-03.08: Unanswered banner ─── */}
      {unansweredCount > 0 && !isViewer && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0 fade-in"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
          role="alert"
          aria-live="polite"
        >
          <Clock size={14} style={{ color: '#d97706', flexShrink: 0 }} aria-hidden="true" />
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <strong>{unansweredCount} {unansweredCount === 1 ? 'mensagem não respondida' : 'mensagens não respondidas'}</strong>{' '}
            há mais de 24 horas. Isso fica registrado no histórico para relatórios jurídicos.
          </p>
        </div>
      )}

      {/* ─── Imutabilidade banner ─── */}
      <div
        className="immutable-field flex-shrink-0 fade-in"
        role="note"
        aria-label="Aviso de comunicação monitorada"
      >
        <Lock size={13} style={{ color: 'var(--color-primary)', flexShrink: 0 }} aria-hidden="true" />
        <span>
          {isViewer ? (
            <span style={{ color: 'var(--color-text-secondary)' }}>
              <span className="font-semibold" style={{ color: '#7c3aed' }}>Modo visualizador ativo.</span>{' '}
              Exibindo apenas mensagens marcadas como juridicamente relevantes.
            </span>
          ) : (
            <span style={{ color: 'var(--color-text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Comunicação monitorada.</span>{' '}
              Todas as mensagens são registradas com valor jurídico e não podem ser excluídas.
            </span>
          )}
        </span>
      </div>

      {/* ─── Messages area ─── */}
      <div className="card flex-1 overflow-hidden flex flex-col p-0">
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          role="log"
          aria-label="Histórico de mensagens"
          aria-live="polite"
        >
          {filteredMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <Info size={32} style={{ color: 'var(--color-border-dark)' }} className="mb-2" aria-hidden="true" />
              <p className="text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                {chatFilter === 'OFFENSIVE' ? 'Nenhuma mensagem sinalizada' :
                 chatFilter === 'RELEVANT'  ? 'Nenhuma mensagem relevante' :
                 'Nenhuma mensagem ainda'}
              </p>
            </div>
          )}

          {filteredMessages.map((msg, idx) => {
            const isMe = msg.senderId === mockCurrentUser.id
            const showDateSep = idx === 0 || !isSameDate(msg.createdAt, filteredMessages[idx - 1].createdAt)
            const msgId = `msg-${msg.id}`
            const isLast = idx === filteredMessages.length - 1

            return (
              <div key={msg.id} className="fade-in">
                {/* ─── Date separator ─── */}
                {showDateSep && (
                  <div className="flex items-center gap-3 my-4" role="separator">
                    <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                    <span
                      className="text-label px-3 py-0.5 rounded-full border"
                      style={{
                        color: 'var(--color-text-tertiary)',
                        background: 'var(--color-surface-alt)',
                        borderColor: 'var(--color-border)',
                        fontSize: 'var(--text-xs)',
                      }}
                    >
                      {format(parseISO(msg.createdAt), "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                  </div>
                )}

                {/* ─── Message bubble ─── */}
                <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                    style={{ background: msg.senderRole === 'GUARDIAN_1' ? 'var(--color-guardian-a)' : 'var(--color-guardian-b)' }}
                    aria-hidden="true"
                  >
                    {msg.senderName.charAt(0)}
                  </div>

                  <div className="max-w-[75%] group">
                    {/* F-03.07: Offensive warning above bubble */}
                    {msg.offensiveDetected && (
                      <div
                        className={`flex items-center gap-1.5 mb-1 text-xs font-semibold ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                        style={{ color: 'var(--color-cancelado)' }}
                      >
                        <AlertTriangle size={12} aria-hidden="true" />
                        <span>Linguagem sinalizada automaticamente</span>
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={clsx(
                        'relative px-3 py-2',
                        isMe ? 'bubble-sent' : 'bubble-received',
                        msg.isLegallyRelevant && 'bubble-relevant',
                        msg.offensiveDetected && 'bubble-offensive',
                      )}
                      id={msgId}
                      aria-label={`Mensagem de ${msg.senderName}`}
                      style={msg.offensiveDetected ? {
                        borderLeft: '3px solid var(--color-cancelado)',
                      } : undefined}
                    >
                      {/* Audio message */}
                      {msg.type === 'AUDIO' ? (
                        <div className="flex items-center gap-2 py-1">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: isMe ? 'var(--color-primary)' : 'var(--color-border-dark)', color: '#fff' }}
                            aria-hidden="true"
                          >
                            <Mic size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 18 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-0.5 rounded-full"
                                  style={{
                                    height: `${6 + Math.sin(i * 0.8) * 6}px`,
                                    background: isMe ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                                    opacity: 0.7,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                            {msg.content.match(/\d+/)?.[0] ?? '0'}s
                          </span>
                        </div>
                      ) : (
                        <p
                          className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                          style={{ color: isMe ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
                        >
                          {msg.content}
                        </p>
                      )}
                    </div>

                    {/* Footer: timestamp + indicators */}
                    <div className={`flex items-center gap-2 mt-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <time dateTime={msg.createdAt} className="text-timestamp" aria-label={`Enviado às ${formatTime(msg.createdAt)}`}>
                        {formatTime(msg.createdAt)}
                      </time>

                      {/* F-03.08: ✓/✓✓ read indicators */}
                      {isMe && (
                        <span style={{ color: msg.read ? '#0ea5e9' : 'var(--color-text-disabled)' }} aria-label={msg.read ? 'Lida' : 'Entregue'}>
                          {msg.read ? <CheckCheck size={13} /> : <Check size={13} />}
                        </span>
                      )}

                      {/* Legally relevant */}
                      {msg.isLegallyRelevant && (
                        <span className="flex items-center gap-0.5 text-xs font-medium" style={{ color: 'var(--g-amber-600)' }} aria-label="Juridicamente relevante">
                          <Star size={11} fill="currentColor" aria-hidden="true" />
                          Relevante
                        </span>
                      )}

                      {/* Hash badge */}
                      {msg.isLegallyRelevant && (
                        <HashBadge hash={`sha256:${msg.id.slice(-8)}abcdef12`} />
                      )}

                      {/* Mark relevant button — hover only, not in viewer mode */}
                      {!isViewer && (
                        <button
                          onClick={() => handleMarkRelevant(msg.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                          style={{ color: msg.isLegallyRelevant ? 'var(--g-amber-600)' : 'var(--color-border-dark)' }}
                          aria-label={msg.isLegallyRelevant ? 'Remover marcação' : 'Marcar como relevante'}
                        >
                          <Star size={13} fill={msg.isLegallyRelevant ? 'currentColor' : 'none'} aria-hidden="true" />
                        </button>
                      )}

                      {/* F-03.08: "Not answered" indicator for last received msg */}
                      {!isMe && isLast && !msg.read && (
                        <span className="text-xs" style={{ color: 'var(--color-pendente)' }} aria-label="Aguardando resposta">
                          <Clock size={11} aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* ─── Input area (hidden in viewer mode) ─── */}
        {!isViewer && (
          <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>

            {/* Recording indicator */}
            {isRecording && (
              <div className="flex items-center gap-2 mb-2 px-2">
                <span className="pulse w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-cancelado)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-cancelado)' }}>
                  Gravando… {Math.floor(recordingTime / 60).toString().padStart(2,'0')}:{(recordingTime % 60).toString().padStart(2,'0')}
                </span>
                <button
                  onClick={stopRecording}
                  className="ml-auto text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: 'var(--color-cancelado-bg)', color: 'var(--color-cancelado)' }}
                >
                  Parar e enviar
                </button>
              </div>
            )}

            <form onSubmit={handleSend}>
              <div className="flex items-end gap-2">
                {/* Attachment */}
                <button
                  type="button"
                  onClick={() => setShowAttachModal(true)}
                  className="btn-ghost p-0 w-10 h-10 rounded-lg flex-shrink-0"
                  aria-label="Anexar arquivo"
                >
                  <Paperclip size={18} aria-hidden="true" />
                </button>

                {/* Audio */}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className="p-0 w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-all"
                  style={{
                    background: isRecording ? 'var(--color-cancelado-bg)' : 'transparent',
                    color: isRecording ? 'var(--color-cancelado)' : 'var(--color-text-tertiary)',
                    border: isRecording ? '1px solid var(--color-cancelado-border)' : 'none',
                  }}
                  aria-label={isRecording ? 'Parar gravação' : 'Gravar áudio'}
                >
                  <Mic size={18} aria-hidden="true" />
                </button>

                {/* Text input */}
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={e => {
                      setInputText(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                    }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Escreva uma mensagem… (Enter para enviar)"
                    className="input-field resize-none"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                    rows={1}
                    aria-label="Campo de mensagem"
                    aria-multiline="true"
                  />
                </div>

                {/* Send */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="btn-primary flex-shrink-0 p-0"
                  style={{ width: '40px', height: '40px', minHeight: 'unset', borderRadius: '0.5rem' }}
                  aria-label="Enviar mensagem"
                >
                  <Send size={16} aria-hidden="true" />
                </button>
              </div>

              <p className="text-caption mt-1.5 px-1 flex items-center gap-1" role="note">
                <Lock size={10} aria-hidden="true" />
                Esta mensagem será armazenada com registro imutável e valor jurídico.
              </p>
            </form>
          </div>
        )}

        {/* Viewer mode footer */}
        {isViewer && (
          <div className="p-3 flex-shrink-0 text-center" style={{ borderTop: '1px solid var(--color-border)', background: 'rgba(124,58,237,0.03)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              <Eye size={12} className="inline mr-1" aria-hidden="true" />
              Modo somente leitura — visualização do profissional autorizado
            </p>
          </div>
        )}
      </div>

      {/* ══ MODAL: Exportar Chat (F-03.06) ══ */}
      {showExportModal && <ExportChatModal onClose={() => setShowExportModal(false)} onExport={exportChat} childName={mockChildren.find(c => c.id === selectedChild)?.fullName ?? ''} relevantCount={relevantCount} totalCount={childMessages.length} />}

      {/* ══ MODAL: Anexar arquivo ══ */}
      {showAttachModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 fade-in" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div className="p-5 flex items-center justify-between" style={{ background: 'var(--foursys-gradient)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} aria-hidden="true">
                  <Paperclip size={20} color="#fff" />
                </div>
                <h3 className="text-lg font-bold text-white">Enviar Anexo</h3>
              </div>
              <button onClick={() => setShowAttachModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} aria-label="Fechar">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4" style={{ background: 'var(--color-surface)' }}>
              <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <Lock size={13} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }} />
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  O arquivo será registrado com <strong>timestamp imutável e hash SHA-256</strong>, com valor jurídico.
                </p>
              </div>
              <FileUpload label="Selecionar arquivo" accept="image/*,application/pdf,.doc,.docx,.mp3,.ogg" hint="Imagens, PDFs, documentos ou áudios · máx 20 MB" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAttachModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="button" className="btn-gradient flex-1" onClick={() => { setShowAttachModal(false); toast('Arquivo enviado com registro de integridade!', 'success') }}>Enviar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Export Chat Modal ─── */
function ExportChatModal({
  onClose, onExport, childName, relevantCount, totalCount,
}: {
  onClose: () => void
  onExport: (filter: 'ALL' | 'RELEVANT', periodDays: number) => void
  childName: string
  relevantCount: number
  totalCount: number
}) {
  const [filter, setFilter]   = useState<'ALL' | 'RELEVANT'>('ALL')
  const [period, setPeriod]   = useState(30)
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    onExport(filter, period)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 fade-in" style={{ zIndex: 'var(--z-modal)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} role="dialog" aria-modal="true" aria-labelledby="export-chat-title">
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div className="p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }} aria-hidden="true">
              <FileText size={20} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <h3 id="export-chat-title" className="text-base font-bold text-white">Exportar Chat</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{childName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4" style={{ background: 'var(--color-surface)' }}>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl text-center" style={{ background: 'var(--color-surface-alt)' }}>
              <p className="text-lg font-extrabold" style={{ color: 'var(--color-text-primary)' }}>{totalCount}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Total de mensagens</p>
            </div>
            <div className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(245,158,11,0.08)' }}>
              <p className="text-lg font-extrabold" style={{ color: 'var(--g-amber-600)' }}>{relevantCount}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Juridicamente relevantes</p>
            </div>
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Período</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[7, 30, 90, 365].map(d => (
                <button
                  key={d}
                  onClick={() => setPeriod(d)}
                  className="py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: period === d ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                    color: period === d ? '#fff' : 'var(--color-text-secondary)',
                    border: period === d ? 'none' : '1px solid var(--color-border)',
                  }}
                >
                  {d === 365 ? '1 ano' : `${d}d`}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Mensagens a incluir</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                ['ALL',      'Todas as mensagens',  totalCount],
                ['RELEVANT', 'Apenas relevantes',   relevantCount],
              ] as ['ALL' | 'RELEVANT', string, number][]).map(([key, label, count]) => (
                <label
                  key={key}
                  className="flex flex-col p-2.5 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: filter === key ? 'var(--color-primary-muted)' : 'var(--color-surface-alt)',
                    border: `1.5px solid ${filter === key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  }}
                >
                  <input type="radio" name="filter" value={key} className="sr-only" checked={filter === key} onChange={() => setFilter(key)} />
                  <span className="text-sm font-bold" style={{ color: filter === key ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{label}</span>
                  <span className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{count} msg</span>
                </label>
              ))}
            </div>
          </div>

          {/* Legal notice */}
          <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.15)' }}>
            <Lock size={13} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              O arquivo exportado contém metadados de integridade e pode ser usado como evidência em processos jurídicos.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="btn-gradient flex-1 flex items-center justify-center gap-2"
              aria-busy={loading}
            >
              {loading
                ? <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Gerando…</>
                : <><Download size={14} />Exportar</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* clsx inline */
function clsx(...c: (string | boolean | undefined)[]) { return c.filter(Boolean).join(' ') }
