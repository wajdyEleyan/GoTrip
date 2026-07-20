// Autor: Mohamad Haj Ahmad, Eya Mathlouthi und Wajdy Eleyan
import { Trash2, CreditCard } from 'lucide-react'
import type { Expense } from '@/types/expense'

interface ExpenseCardProps {
  expense: Expense
  currentUserId?: string
  onDelete: (id: string) => void
}

export function ExpenseCard({ expense, currentUserId, onDelete }: ExpenseCardProps) {
  const isOwn = expense.paidBy === currentUserId
  const shareCount = expense.splitAmong.length
  const perPerson = expense.amount / shareCount

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <CreditCard size={16} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {isOwn ? 'Du' : expense.paidByName} · {expense.amount.toFixed(2)} €
        </p>
        <p className="text-xs text-gray-400">
          {shareCount} Personen · {perPerson.toFixed(2)} € pro Person
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-sm font-semibold text-gray-900">{expense.amount.toFixed(2)} €</span>
        {isOwn && (
          <button
            onClick={() => onDelete(expense.id)}
            className="text-gray-300 hover:text-red-400 transition-colors"
            aria-label="Ausgabe löschen"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
