// Autor: Mohamad Haj Ahmad
// src/utils/budgetSplit.ts — Splitwise-style settlement algorithm
import type { Expense, MemberBalance, Settlement } from '@/types/expense'
import type { Member } from '@/types/trip'

export function calcBalances(expenses: Expense[], members: Member[]): MemberBalance[] {
  const paid: Record<string, number> = {}
  const owes: Record<string, number> = {}

  members.forEach((m) => {
    paid[m.id] = 0
    owes[m.id] = 0
  })

  expenses.forEach((exp) => {
    paid[exp.paidBy] = (paid[exp.paidBy] ?? 0) + exp.amount
    const share = exp.amount / exp.splitAmong.length
    exp.splitAmong.forEach((mid) => {
      owes[mid] = (owes[mid] ?? 0) + share
    })
  })

  return members.map((m) => ({
    memberId: m.id,
    memberName: m.name,
    paid: paid[m.id] ?? 0,
    owes: owes[m.id] ?? 0,
    net: (paid[m.id] ?? 0) - (owes[m.id] ?? 0),
  }))
}

// Greedy algorithm: minimize number of transactions
export function calcSettlements(balances: MemberBalance[]): Settlement[] {
  const creditors = balances.filter((b) => b.net > 0.005).map((b) => ({ ...b }))
  const debtors = balances.filter((b) => b.net < -0.005).map((b) => ({ ...b }))
  const settlements: Settlement[] = []

  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci]
    const debt = debtors[di]
    const amount = Math.min(credit.net, -debt.net)

    if (amount > 0.005) {
      settlements.push({
        from: debt.memberId,
        fromName: debt.memberName,
        to: credit.memberId,
        toName: credit.memberName,
        amount: Math.round(amount * 100) / 100,
      })
    }

    credit.net -= amount
    debt.net += amount

    if (credit.net < 0.005) ci++
    if (debt.net > -0.005) di++
  }

  return settlements
}
