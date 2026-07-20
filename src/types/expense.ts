// Autor: Mohamad Haj Ahmad, Eya Mathlouthi und Wajdy Eleyan

export interface Expense {
  id: string
  tripId: string
  paidBy: string          // memberId
  paidByName: string
  amount: number          // in EUR
  description: string
  splitAmong: string[]    // memberIds (default: all members)
  date: string            // ISO string
}

export interface MemberBalance {
  memberId: string
  memberName: string
  paid: number            // total paid
  owes: number            // total share of expenses
  net: number             // paid - owes (positive = is owed money)
}

export interface Settlement {
  from: string            // memberId
  fromName: string
  to: string              // memberId
  toName: string
  amount: number
}
