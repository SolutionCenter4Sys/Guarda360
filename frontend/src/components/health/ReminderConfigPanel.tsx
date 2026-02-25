/**
 * ReminderConfigPanel — Configuração de Lembretes de Consultas (F-05.06)
 *
 * Extracted from HealthPage to respect SRP:
 * HealthPage handles page layout; this component owns reminder UI only.
 * All state is managed by useReminderSettings hook and passed via props.
 */
import { Bell } from 'lucide-react'
import type { ReminderSettings } from '../../hooks/useReminderSettings'
import type { AppointmentType } from '../../types'

const ADVANCE_DAYS = [1, 2, 3, 7] as const

const CHANNEL_OPTIONS: { key: 'push' | 'email' | 'sms'; label: string }[] = [
  { key: 'push',  label: '🔔 Push'   },
  { key: 'email', label: '📧 E-mail' },
  { key: 'sms',   label: '📱 SMS'    },
]

const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  CONSULTA:   'Consulta',
  EXAME:      'Exame',
  VACINA:     'Vacina',
  EMERGENCIA: 'Emergência',
  OUTRO:      'Outro',
}

interface ActiveToggleProps {
  checked: boolean
  onChange: () => void
}

function ActiveToggle({ checked, onChange }: ActiveToggleProps) {
  return (
    <div
      onClick={onChange}
      className="relative w-10 h-5 rounded-full cursor-pointer transition-all"
      style={{ background: checked ? 'var(--color-primary)' : 'var(--color-border)' }}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') onChange() }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
        style={{ left: checked ? '22px' : '2px' }}
      />
    </div>
  )
}

interface ReminderConfigPanelProps {
  settings:     ReminderSettings
  onUpdateField: <K extends keyof ReminderSettings>(key: K, value: ReminderSettings[K]) => void
  onToggleType:  (type: AppointmentType, value: boolean) => void
  onSave:        () => void
}

export function ReminderConfigPanel({
  settings,
  onUpdateField,
  onToggleType,
  onSave,
}: ReminderConfigPanelProps) {
  return (
    <div
      className="card p-4 space-y-4 fade-in"
      style={{ border: '1.5px solid rgba(29,78,216,0.2)', background: 'rgba(29,78,216,0.03)' }}
      role="region"
      aria-label="Configuração de lembretes de consultas"
    >
      {/* Header + master toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Configuração de Lembretes
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Ativar</span>
          <ActiveToggle
            checked={settings.enabled}
            onChange={() => onUpdateField('enabled', !settings.enabled)}
          />
        </label>
      </div>

      {settings.enabled && (
        <>
          {/* Advance days */}
          <fieldset>
            <legend className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Avisar com antecedência de:
            </legend>
            <div className="flex gap-2 flex-wrap">
              {ADVANCE_DAYS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onUpdateField('days', d)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: settings.days === d ? 'var(--color-primary)' : 'var(--color-border)',
                    color:      settings.days === d ? '#fff' : 'var(--color-text-secondary)',
                  }}
                  aria-pressed={settings.days === d}
                >
                  {d === 1 ? '1 dia' : `${d} dias`}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Notification channels */}
          <fieldset>
            <legend className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Canais de notificação:
            </legend>
            <div className="flex gap-4 flex-wrap">
              {CHANNEL_OPTIONS.map(ch => (
                <label key={ch.key} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[ch.key]}
                    onChange={e => onUpdateField(ch.key, e.target.checked)}
                    className="rounded"
                    aria-label={ch.label}
                  />
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {ch.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Appointment types */}
          <fieldset>
            <legend className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Notificar para:
            </legend>
            <div className="flex gap-3 flex-wrap">
              {(Object.entries(settings.types) as [AppointmentType, boolean][]).map(([type, checked]) => (
                <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => onToggleType(type, e.target.checked)}
                    className="rounded"
                    aria-label={APPOINTMENT_TYPE_LABELS[type]}
                  />
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {APPOINTMENT_TYPE_LABELS[type]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={onSave}
            className="btn-gradient w-full flex items-center justify-center gap-2 text-sm"
          >
            <Bell size={14} aria-hidden="true" />
            Salvar configuração de lembretes
          </button>
        </>
      )}
    </div>
  )
}
