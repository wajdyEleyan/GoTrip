// Autor: Eya Mathlouthi
// src/components/recommendations/AddDestinationForm.tsx
import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AddDestinationFormProps {
  onAdd: (name: string, country: string) => Promise<void>
  isLoading?: boolean
}

export function AddDestinationForm({ onAdd, isLoading }: AddDestinationFormProps) {
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  async function handleSubmit() {
    const n = name.trim()
    const c = country.trim()
    if (!n) { setError('Bitte gib ein Reiseziel ein'); return }
    setError('')
    await onAdd(n, c)
    setName('')
    setCountry('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full p-4 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors"
      >
        <Plus size={18} />
        Ziel vorschlagen
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-900">Reiseziel vorschlagen</h3>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dest-name">Stadt / Region *</Label>
        <Input
          id="dest-name"
          placeholder="z.B. Barcelona"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          autoFocus
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dest-country">Land</Label>
        <Input
          id="dest-country"
          placeholder="z.B. Spanien"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Abbrechen</Button>
        <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
          {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          {isLoading ? 'Analysiere…' : 'Vorschlagen'}
        </Button>
      </div>
    </div>
  )
}
