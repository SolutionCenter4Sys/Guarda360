import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFinancialSummary } from './useFinancialSummary'

describe('useFinancialSummary', () => {
  it('should return non-negative financial totals', () => {
    const { result } = renderHook(() => useFinancialSummary())
    expect(result.current.totalPaid).toBeGreaterThanOrEqual(0)
    expect(result.current.totalPending).toBeGreaterThanOrEqual(0)
    expect(result.current.totalExpenses).toBeGreaterThanOrEqual(0)
    expect(result.current.myExpenseShare).toBeGreaterThanOrEqual(0)
  })

  it('myExpenseShare should be <= totalExpenses', () => {
    const { result } = renderHook(() => useFinancialSummary())
    expect(result.current.myExpenseShare).toBeLessThanOrEqual(result.current.totalExpenses + 0.01)
  })

  it('should return non-negative pending and disputed expense counts', () => {
    const { result } = renderHook(() => useFinancialSummary())
    expect(result.current.pendingExpenses).toBeGreaterThanOrEqual(0)
    expect(result.current.disputedExpenses).toBeGreaterThanOrEqual(0)
  })

  it('should return payments and expenses arrays', () => {
    const { result } = renderHook(() => useFinancialSummary())
    expect(Array.isArray(result.current.payments)).toBe(true)
    expect(Array.isArray(result.current.expenses)).toBe(true)
  })

  it('totalPaid should equal sum of amountPaid for PAGO payments', () => {
    const { result } = renderHook(() => useFinancialSummary())
    const { payments, totalPaid } = result.current
    const expected = payments
      .filter(p => p.status === 'PAGO')
      .reduce((sum, p) => sum + (p.amountPaid ?? 0), 0)
    expect(totalPaid).toBeCloseTo(expected, 2)
  })

  it('totalExpenses should equal sum of all expense amounts', () => {
    const { result } = renderHook(() => useFinancialSummary())
    const { expenses, totalExpenses } = result.current
    const expected = expenses.reduce((sum, e) => sum + e.amount, 0)
    expect(totalExpenses).toBeCloseTo(expected, 2)
  })

  it('should be consistent across multiple renders (useMemo stability)', () => {
    const { result, rerender } = renderHook(() => useFinancialSummary())
    const first = result.current.totalPaid
    rerender()
    expect(result.current.totalPaid).toBe(first)
  })
})
