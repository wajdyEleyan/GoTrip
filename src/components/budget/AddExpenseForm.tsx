// Autor: Mohamad Haj Ahmad und Wajdy Eleyan
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Member } from '@/types/trip'

interface AddExpenseFormProps {
  members: Member[]
  currentUserId: string
  onAdd: (description: string, amount: number, paidBy: string, splitAmong: string[]) => void
}

export function AddExpenseForm({ members, currentUserId, onAdd }: AddExpenseFormProps) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(currentUserId)
  const [splitAmong, setSplitAmong] = useState<string[]>(members.map((m) => m.id))

  function toggleMember(id: string) {
    setSplitAmong((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  function handleSubmit() {
    const parsed = parseFloat(amount)
    if (!description.trim() || isNaN(parsed) || parsed <= 0 || splitAmong.length === 0) return
    onAdd(description.trim(), parsed, paidBy, splitAmong)
    setDescription('')
    setAmount('')
    setPaidBy(currentUserId)
    setSplitAmong(members.map((m) => m.id))
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full p-4 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors"
      >
        <Plus size={18} /> Ausgabe hinzufügen
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-800">Neue Ausgabe</h3>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exp-desc">Beschreibung</Label>
        <Input
          id="exp-desc"
          placeholder="z.B. Hotel, Abendessen…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoFocus
        />
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col gap-1.5 flex-1">
          <Label htmlFor="exp-amount">Betrag (€)</Label>
          <Input
            id="exp-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <Label htmlFor="exp-payer">Bezahlt von</Label>
          <select
            id="exp-payer"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.id === currentUserId ? 'Du' : m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Aufteilen auf</Label>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const selected = splitAmong.includes(m.id)
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMember(m.id)}
                aria-pressed={selected}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selected
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m.id === currentUserId ? 'Du' : m.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setOpen(false)}
        >
          Abbrechen
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={!description.trim() || !amount || splitAmong.length === 0}
        >
          Hinzufügen
        </Button>
      </div>
    </div>
  )
}
