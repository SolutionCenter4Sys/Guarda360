import { useMemo } from 'react'
import { isAfter, isBefore, parseISO } from 'date-fns'
import {
  mockAppointments, mockVaccines, mockHealthDocuments,
  mockEmergencyContacts, mockSchoolReports, mockSchoolCommunications,
} from '../mocks'
import type { SchoolPeriod } from '../types'

export type HealthHistoryFilter = 'ALL' | 'CONSULTA' | 'VACINA' | 'DOCUMENTO' | 'BOLETIM'

export interface HealthTimelineItem {
  id:       string
  type:     string
  title:    string
  subtitle: string
  date:     string
  color:    string
}

export interface GradeEvolutionPoint {
  label: string
  avg:   number
}

export const PERIOD_LABELS: Record<SchoolPeriod, string> = {
  BIMESTRE_1: '1º Bimestre', BIMESTRE_2: '2º Bimestre',
  BIMESTRE_3: '3º Bimestre', BIMESTRE_4: '4º Bimestre',
  TRIMESTRE_1: '1º Trimestre', TRIMESTRE_2: '2º Trimestre', TRIMESTRE_3: '3º Trimestre',
  SEMESTRE_1: '1º Semestre', SEMESTRE_2: '2º Semestre', ANUAL: 'Anual',
}

/**
 * Aggregates and derives all health/school data for a given child (F-05.01–F-05.08).
 * Centralises child-scoped data access, relieving HealthPage of data fetching concerns (SRP/DIP).
 */
export function useHealthData(selectedChild: string, historyFilter: HealthHistoryFilter) {
  const childAppts    = useMemo(() => mockAppointments.filter(a => a.childId === selectedChild),    [selectedChild])
  const childVaccines = useMemo(() => mockVaccines.filter(v => v.childId === selectedChild),        [selectedChild])
  const childDocs     = useMemo(() => mockHealthDocuments.filter(d => d.childId === selectedChild), [selectedChild])
  const childContacts = useMemo(() => mockEmergencyContacts.filter(c => c.childId === selectedChild),[selectedChild])
  const childReports  = useMemo(() => mockSchoolReports.filter(r => r.childId === selectedChild),   [selectedChild])
  const childComms    = useMemo(() => mockSchoolCommunications.filter(c => c.childId === selectedChild), [selectedChild])

  const upcoming = useMemo(
    () => childAppts
      .filter(a => a.status === 'AGENDADO' && isAfter(parseISO(a.scheduledAt), new Date()))
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [childAppts],
  )

  const past = useMemo(
    () => childAppts
      .filter(a => a.status !== 'AGENDADO' || isBefore(parseISO(a.scheduledAt), new Date()))
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()),
    [childAppts],
  )

  const vacEmDia    = useMemo(() => childVaccines.filter(v => v.status === 'EM_DIA').length, [childVaccines])
  const vacPend     = useMemo(() => childVaccines.filter(v => v.status !== 'EM_DIA').length, [childVaccines])
  const unreadComms = useMemo(() => childComms.filter(c => !c.isRead).length, [childComms])

  const healthTimeline = useMemo((): HealthTimelineItem[] => {
    const events: HealthTimelineItem[] = []

    childAppts.forEach(a => events.push({
      id: a.id, type: 'CONSULTA', title: a.title,
      subtitle: [a.doctor, a.location].filter(Boolean).join(' · '),
      date: a.scheduledAt, color: 'var(--color-primary)',
    }))

    childVaccines
      .filter(v => v.appliedAt)
      .forEach(v => events.push({
        id: v.id, type: 'VACINA', title: v.name,
        subtitle: `Dose ${v.doseNumber}/${v.totalDoses}`,
        date: v.appliedAt!, color: 'var(--color-confirmado)',
      }))

    childDocs.forEach(d => events.push({
      id: d.id, type: 'DOCUMENTO', title: d.title,
      subtitle: d.description ?? '',
      date: d.uploadedAt, color: 'var(--color-pendente)',
    }))

    childReports.forEach(r => events.push({
      id: r.id, type: 'BOLETIM',
      title: `Boletim ${PERIOD_LABELS[r.period]} ${r.year}`,
      subtitle: r.school,
      date: r.uploadedAt, color: '#7c3aed',
    }))

    return events
      .filter(e => historyFilter === 'ALL' || e.type === historyFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [childAppts, childVaccines, childDocs, childReports, historyFilter])

  const gradeEvolution = useMemo((): GradeEvolutionPoint[] =>
    childReports
      .filter(r => r.grades?.length)
      .sort((a, b) => a.year !== b.year ? a.year - b.year : a.period.localeCompare(b.period))
      .map(r => ({
        label: `${PERIOD_LABELS[r.period].split(' ')[1] ?? PERIOD_LABELS[r.period]} ${r.year}`,
        avg: +(r.grades!.reduce((s, g) => s + g.grade / g.maxGrade * 10, 0) / r.grades!.length).toFixed(1),
      })),
    [childReports],
  )

  return {
    childAppts, childVaccines, childDocs, childContacts, childReports, childComms,
    upcoming, past,
    vacEmDia, vacPend, unreadComms,
    healthTimeline, gradeEvolution,
  }
}
