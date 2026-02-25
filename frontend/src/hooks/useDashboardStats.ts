import { useMemo } from 'react'
import { mockCalendarEvents, mockMessages, mockIncidents, mockAlimonyPayments } from '../mocks'

export function useDashboardStats() {
  return useMemo(() => {
    const confirmedVisits = mockCalendarEvents.filter(e => e.status === 'CONFIRMADO').length
    const decidedVisits   = mockCalendarEvents.filter(e => e.status !== 'PENDENTE').length
    const visitCompliance = Math.round((confirmedVisits / (decidedVisits || 1)) * 100)

    const unreadMessages   = mockMessages.filter(m => !m.read).length
    const legalMessages    = mockMessages.filter(m => m.isLegallyRelevant).length
    const openIncidents    = mockIncidents.length
    const criticalIncidents = mockIncidents.filter(i => i.severity === 'CRITICAL').length

    const overduePayments = mockAlimonyPayments.filter(p => p.status === 'ATRASADO').length
    const pendingPayments = mockAlimonyPayments.filter(p => p.status === 'PENDENTE').length

    const nextVisit = mockCalendarEvents
      .filter(e => e.status === 'PENDENTE' || e.status === 'CONFIRMADO')
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0] ?? null

    const recentIncidents = [...mockIncidents]
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
      .slice(0, 3)

    const recentPayments = [...mockAlimonyPayments]
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      .slice(0, 3)

    return {
      visitCompliance,
      confirmedVisits,
      unreadMessages,
      legalMessages,
      openIncidents,
      criticalIncidents,
      overduePayments,
      pendingPayments,
      nextVisit,
      recentIncidents,
      recentPayments,
    }
  }, [])
}
