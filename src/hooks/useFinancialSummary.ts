import { useMemo } from 'react'
import { mockAlimonyPayments, mockExpenses } from '../mocks'

export function useFinancialSummary() {
  return useMemo(() => {
    const totalPaid = mockAlimonyPayments
      .filter(p => p.status === 'PAGO')
      .reduce((sum, p) => sum + (p.amountPaid ?? 0), 0)

    const totalPending = mockAlimonyPayments
      .filter(p => p.status === 'PENDENTE')
      .reduce((sum, p) => sum + p.amount, 0)

    const totalOverdue = mockAlimonyPayments
      .filter(p => p.status === 'ATRASADO')
      .reduce((sum, p) => sum + p.amount, 0)

    const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0)

    const myExpenseShare = mockExpenses.reduce(
      (sum, e) => sum + e.amount * (e.payer1Share / 100),
      0,
    )

    const pendingExpenses  = mockExpenses.filter(e => e.status === 'PENDENTE').length
    const disputedExpenses = mockExpenses.filter(e => e.status === 'CONTESTADO').length

    return {
      totalPaid,
      totalPending,
      totalOverdue,
      totalExpenses,
      myExpenseShare,
      pendingExpenses,
      disputedExpenses,
      payments: mockAlimonyPayments,
      expenses: mockExpenses,
    }
  }, [])
}
