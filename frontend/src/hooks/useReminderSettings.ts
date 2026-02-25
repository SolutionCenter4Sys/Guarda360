import { useState } from 'react'
import type { AppointmentType } from '../types'

export interface ReminderSettings {
  enabled: boolean
  days:    1 | 2 | 3 | 7
  email:   boolean
  push:    boolean
  sms:     boolean
  types:   Record<AppointmentType, boolean>
}

const INITIAL_SETTINGS: ReminderSettings = {
  enabled: true,
  days:    1,
  email:   true,
  push:    true,
  sms:     false,
  types: {
    CONSULTA:   true,
    EXAME:      true,
    VACINA:     true,
    EMERGENCIA: false,
    OUTRO:      false,
  },
}

/**
 * Manages appointment reminder configuration state (F-05.06).
 * Extracted from HealthPage to respect SRP — settings logic is independent of UI layout.
 */
export function useReminderSettings() {
  const [showReminderPanel, setShowReminderPanel] = useState(false)
  const [settings, setSettings] = useState<ReminderSettings>(INITIAL_SETTINGS)

  const updateField = <K extends keyof ReminderSettings>(
    key: K,
    value: ReminderSettings[K],
  ) => setSettings(prev => ({ ...prev, [key]: value }))

  const toggleType = (type: AppointmentType, value: boolean) =>
    setSettings(prev => ({ ...prev, types: { ...prev.types, [type]: value } }))

  const getSummaryText = () => {
    const channels = [
      settings.push  && 'Push',
      settings.email && 'E-mail',
      settings.sms   && 'SMS',
    ].filter(Boolean).join(', ')

    return `${settings.days} dia(s) antes, via ${channels || 'nenhum canal'}`
  }

  return {
    showReminderPanel,
    setShowReminderPanel,
    settings,
    updateField,
    toggleType,
    getSummaryText,
  }
}
