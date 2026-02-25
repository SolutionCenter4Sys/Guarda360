import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDashboardStats } from './useDashboardStats'

describe('useDashboardStats', () => {
  it('should return a visitCompliance value between 0 and 100', () => {
    const { result } = renderHook(() => useDashboardStats())
    expect(result.current.visitCompliance).toBeGreaterThanOrEqual(0)
    expect(result.current.visitCompliance).toBeLessThanOrEqual(100)
  })

  it('should return non-negative counts', () => {
    const { result } = renderHook(() => useDashboardStats())
    const { unreadMessages, openIncidents, criticalIncidents, overduePayments, pendingPayments } = result.current
    expect(unreadMessages).toBeGreaterThanOrEqual(0)
    expect(openIncidents).toBeGreaterThanOrEqual(0)
    expect(criticalIncidents).toBeGreaterThanOrEqual(0)
    expect(overduePayments).toBeGreaterThanOrEqual(0)
    expect(pendingPayments).toBeGreaterThanOrEqual(0)
  })

  it('criticalIncidents should be <= openIncidents', () => {
    const { result } = renderHook(() => useDashboardStats())
    expect(result.current.criticalIncidents).toBeLessThanOrEqual(result.current.openIncidents)
  })

  it('should return arrays for recentIncidents and recentPayments', () => {
    const { result } = renderHook(() => useDashboardStats())
    expect(Array.isArray(result.current.recentIncidents)).toBe(true)
    expect(Array.isArray(result.current.recentPayments)).toBe(true)
  })

  it('recentIncidents should have at most 3 items', () => {
    const { result } = renderHook(() => useDashboardStats())
    expect(result.current.recentIncidents.length).toBeLessThanOrEqual(3)
  })

  it('recentPayments should be sorted descending by dueDate', () => {
    const { result } = renderHook(() => useDashboardStats())
    const payments = result.current.recentPayments
    for (let i = 0; i < payments.length - 1; i++) {
      const a = new Date(payments[i].dueDate).getTime()
      const b = new Date(payments[i + 1].dueDate).getTime()
      expect(a).toBeGreaterThanOrEqual(b)
    }
  })

  it('nextVisit should be null or have required fields', () => {
    const { result } = renderHook(() => useDashboardStats())
    const { nextVisit } = result.current
    if (nextVisit !== null) {
      expect(nextVisit).toHaveProperty('id')
      expect(nextVisit).toHaveProperty('startAt')
      expect(nextVisit).toHaveProperty('status')
    }
  })
})
