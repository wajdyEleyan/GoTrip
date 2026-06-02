// Autor: Eya Mathlouthi
// src/components/recommendations/AddDestinationForm.tsx
// Reiseziel vorschlagen: ERST Land, DANN Stadt. Die Stadt wird gegen echte
// Geocoding-Daten geprüft — sie muss wirklich im gewählten Land liegen.
import { useState } from 'react'
import { Plus, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { COUNTRIES, countryByCode, findCityInCountry, GeoNetworkError } from '@/utils/geo'

interface AddDestinationFormProps {
  onAdd: (name: string, country: string) => Promise<void>
  isLoading?: boolean
}

export function AddDestinationForm({ onAdd, isLoading }: AddDestinationFormProps) {
  const [countryCode, setCountryCode] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [open, setOpen] = useState(false)

  function reset() {
    setCountryCode('')
    setCity('')
    setError('')
    setOpen(false)
  }

  async function handleSubmit() {
    const country = countryByCode(countryCode)
    if (!country) { setError('Bitte wähle zuerst ein Land.'); return }
    const c = city.trim()
    if (!c) { setError('Bitte gib eine Stadt ein.'); return }

    setError('')
    setChecking(true)
    try {
      const match = await findCityInCountry(c, countryCode)
      if (!match) {
        setError(`„${c}" liegt nicht in ${country.name}. Bitte Stadt & Land prüfen.`)
        return
      }
      // Validierter, sauber benannter Ort (z. B. „Barcelona") + Land.
      await onAdd(match.name, country.name)
      reset()
    } catch (err) {
      if (err instanceof GeoNetworkError) {
        // Dienst nicht erreichbar → Eingabe trotzdem zulassen (Fallback).
        await onAdd(c, country.name)
        reset()
      } else {
        setError('Validierung fehlgeschlagen. Bitte erneut versuchen.')
      }
    } finally {
      setChecking(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full p-4 rounded-2xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors"
      >
        <Plus size={18} />
        Ziel vorschlagen
      </button>
    )
  }

  const busy = checking || isLoading
  const selectedCountry = countryByCode(countryCode)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
        <MapPin size={15} className="text-primary" /> Reiseziel vorschlagen
      </h3>

      {/* 1) Land */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dest-country" className="text-xs font-semibold text-gray-500">1 · Land</Label>
        <select
          id="dest-country"
          value={countryCode}
          onChange={(e) => { setCountryCode(e.target.value); setError('') }}
          className="h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-colors"
        >
          <option value="" disabled>Land wählen…</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
          ))}
        </select>
      </div>

      {/* 2) Stadt */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dest-city" className="text-xs font-semibold text-gray-500">2 · Stadt</Label>
        <Input
          id="dest-city"
          placeholder={selectedCountry ? `Stadt in ${selectedCountry.name}…` : 'Erst Land wählen'}
          value={city}
          disabled={!countryCode}
          onChange={(e) => { setCity(e.target.value); setError('') }}
          onKeyDown={(e) => { if (e.key === 'Enter' && !busy) handleSubmit() }}
        />
      </div>

      {error && <p className="text-xs text-red-500" role="alert">{error}</p>}

      <div className="flex gap-2">
        <Button variant="outline" onClick={reset} className="flex-1" disabled={busy}>Abbrechen</Button>
        <Button onClick={handleSubmit} disabled={busy || !countryCode || !city.trim()} className="flex-1">
          {busy && <Loader2 size={16} className="animate-spin mr-2" />}
          {checking ? 'Prüfe…' : isLoading ? 'Analysiere…' : 'Vorschlagen'}
        </Button>
      </div>
    </div>
  )
}
