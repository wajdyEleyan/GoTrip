// Autor: Mohamad Haj Ahmad, Eya Mathlouthi und Wajdy Eleyan
import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { TripScreen } from '@/components/shared/TripScreen'
import { Button } from '@/components/ui/button'
import { ExpenseCard } from '@/components/budget/ExpenseCard'
import { BalanceSummary } from '@/components/budget/BalanceSummary'
import { AddExpenseForm } from '@/components/budget/AddExpenseForm'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { getTripExpenses, saveExpense, deleteExpense } from '@/utils/storage'
import { calcBalances, calcSettlements } from '@/utils/budgetSplit'
import { toast } from '@/components/shared/Toast'
import type { Expense } from '@/types/expense'

export default function BudgetTracker() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { user } = useAuth()

  const trip = id ? getTripById(id) : undefined
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    if (id) setExpenses(getTripExpenses(id))
  }, [id])

  const totalSpent = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses]
  )

  const balances = useMemo(
    () => (trip ? calcBalances(expenses, trip.members) : []),
    [expenses, trip]
  )

  const settlements = useMemo(() => calcSettlements(balances), [balances])

  function handleAdd(description: string, amount: number, paidBy: string, splitAmong: string[]) {
    if (!id || !trip) return
    const payer = trip.members.find((m) => m.id === paidBy)
    if (!payer) return

    const exp: Expense = {
      id: crypto.randomUUID(),
      tripId: id,
      paidBy,
      paidByName: payer.name,
      amount,
      description,
      splitAmong,
      date: new Date().toISOString(),
    }
    saveExpense(exp)
    setExpenses((prev) => [...prev, exp])
    toast.success(`${amount.toFixed(2)} € hinzugefügt!`)
  }

  function handleDelete(expId: string) {
    deleteExpense(expId)
    setExpenses((prev) => prev.filter((e) => e.id !== expId))
    toast.success('Ausgabe gelöscht')
  }

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-white/70 mb-4">Reise nicht gefunden.</p>
        <Button variant="outline" onClick={() => navigate('/home')}>Zur Übersicht</Button>
      </div>
    )
  }

  return (
    <TripScreen title="Budget-Tracker" backTo={`/trip/${id}/dashboard`}>
      <main className="flex-1 px-4 py-5 overflow-y-auto flex flex-col gap-4 pb-28">

        {/* Total spending card */}
        <div className="bg-primary rounded-2xl p-4 text-white flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Wallet size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-white/70">Gesamt ausgegeben</p>
            <p className="text-2xl font-bold">{totalSpent.toFixed(2)} €</p>
            <p className="text-xs text-white/70">{expenses.length} Ausgaben · {trip.members.length} Personen</p>
          </div>
        </div>

        {/* Balance summary */}
        <BalanceSummary
          balances={balances}
          settlements={settlements}
          currentUserId={user?.id}
        />

        {/* Expense list */}
        {expenses.length > 0 && (
          <div className="glass-card px-4">
            <h3 className="text-sm font-semibold text-gray-700 py-3 border-b border-white/30">
              Alle Ausgaben
            </h3>
            {[...expenses].sort((a, b) => b.date.localeCompare(a.date)).map((exp) => (
              <ExpenseCard
                key={exp.id}
                expense={exp}
                currentUserId={user?.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Add expense */}
        {user && (
          <AddExpenseForm
            members={trip.members}
            currentUserId={user.id}
            onAdd={handleAdd}
          />
        )}

        <Button variant="outline" onClick={() => navigate(`/trip/${id}/final`)} className="w-full border-primary/30 text-primary hover:bg-primary-soft">
          Zurück zur Übersicht
        </Button>
      </main>
    </TripScreen>
  )
}
