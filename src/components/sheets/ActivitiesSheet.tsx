// src/components/sheets/ActivitiesSheet.tsx
import { useState, useEffect } from 'react'
import { Sparkles, ThumbsUp, RefreshCw } from 'lucide-react'
import {
  getItinerary, saveItinerary, updateItinerarySlot, getTripPreferences,
  getTripDestinations, getTripVotes, getItineraryDestination,
} from '@/utils/storage'
import { generateItinerary, tripDaysCount } from '@/services/activitiesService'
import { calcHybridScore } from '@/utils/scoring'
import { toast } from '@/components/shared/Toast'
import type { TripItinerary } from '@/types/itinerary'
import type { Trip } from '@/types/trip'
import type { StoredAuth } from '@/utils/storage'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Props {
  trip: Trip
  user: StoredAuth
  onNext: () => void
}

function fmtDate(dateStr: string): string {
  try { return format(parseISO(dateStr), 'EEE, d. MMM', { locale: de }) } catch { return dateStr }
}

function getWinnerDestination(tripId: string): string | null {
  const dests = getTripDestinations(tripId)
  if (dests.length === 0) return null
  const allVotes = getTripVotes(tripId)
  const ranked = dests.map(d => {
    const votes = allVotes.filter(v => v.destinationId === d.id)
    const starsAvg = votes.length > 0 ? votes.reduce((s, v) => s + v.stars, 0) / votes.length : 0
    return { name: d.name, hybridScore: calcHybridScore(d.llmAnalysis?.score ?? 50, starsAvg) }
  }).sort((a, b) => b.hybridScore - a.hybridScore)
  return ranked[0]?.name ?? null
}

export function ActivitiesSheet({ trip, user, onNext }: Props) {
  const [plan, setPlan] = useState<TripItinerary | null>(null)
  const [generating, setGenerating] = useState(false)
  const [currentDest, setCurrentDest] = useState<string>('')

  useEffect(() => {
    const winner = getWinnerDestination(trip.id) ?? trip.name
    const storedDest = getItineraryDestination(trip.id)
    const stored = getItinerary(trip.id)

    if (stored && storedDest === winner) {
      setPlan(stored)
      setCurrentDest(winner)
    } else {
      // Ziel hat sich geändert oder kein Plan → neu generieren
      generate(winner)
    }
  }, [trip.id])

  function generate(destination?: string) {
    const dest = destination ?? getWinnerDestination(trip.id) ?? trip.name
    setGenerating(true)
    setCurrentDest(dest)
    const prefs = getTripPreferences(trip.id)
    const allInterests = [...new Set(prefs.flatMap(p => p.interests))]
    const budgets = prefs.map(p => p.budgetPerPerson).filter(b => b > 0)
    const minBudget = budgets.length > 0 ? Math.min(...budgets) : 30

    const newPlan = generateItinerary({
      interests: allInterests,
      budgetPerPerson: minBudget,
      startDate: trip.startDate,
      endDate: trip.endDate,
      destination: dest,
    })
    saveItinerary(trip.id, newPlan, dest)
    setPlan(newPlan)
    setGenerating(false)
  }

  function handleRegenerate() {
    generate()
    toast.success('Neuer Plan generiert!')
  }

  function handleVote(dayNumber: number, slotId: string) {
    if (!plan) return
    const newPlan = plan.map(day => {
      if (day.dayNumber !== dayNumber) return day
      return {
        ...day,
        slots: day.slots.map(slot => {
          if (slot.id !== slotId) return slot
          const voted = slot.votedBy.includes(user.id)
          const updated = {
            ...slot,
            votedBy: voted
              ? slot.votedBy.filter(id => id !== user.id)
              : [...slot.votedBy, user.id],
          }
          updateItinerarySlot(trip.id, dayNumber, updated)
          return updated
        }),
      }
    })
    setPlan(newPlan)
  }

  const days = tripDaysCount(trip.startDate, trip.endDate)

  if (generating || !plan) {
    return (
      <div className="px-4 py-10 flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">KI erstellt deinen Reiseplan…</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-primary" />
          <div>
            <p className="text-sm font-bold text-gray-700">
              KI-Reiseplan · {days} {days === 1 ? 'Tag' : 'Tage'}
            </p>
            {currentDest && (
              <p className="text-xs text-gray-400 truncate max-w-[160px]">{currentDest}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleRegenerate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors active:scale-95"
        >
          <RefreshCw size={12} />
          Neu generieren
        </button>
      </div>

      {/* Tage */}
      {plan.map(day => (
        <div key={day.dayNumber} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-[11px] font-bold">{day.dayNumber}</span>
            </div>
            <p className="text-sm font-bold text-gray-800">
              Tag {day.dayNumber} · {fmtDate(day.date)}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {day.slots.map((slot, idx) => {
              const voted = slot.votedBy.includes(user.id)
              const isMeal = slot.type === 'meal'
              return (
                <div
                  key={slot.id}
                  className={`flex items-center gap-3 px-4 py-3 ${idx < day.slots.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <span className="text-xs font-bold text-gray-400 w-10 shrink-0">{slot.time}</span>
                  <span className="text-lg shrink-0">{slot.emoji}</span>
                  <span className={`flex-1 text-sm leading-tight ${isMeal ? 'text-gray-500 italic' : 'text-gray-800 font-medium'}`}>
                    {slot.activity}
                  </span>
                  <button
                    onClick={() => handleVote(day.dayNumber, slot.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors shrink-0 ${
                      voted ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <ThumbsUp size={11} />
                    {slot.votedBy.length > 0 && <span>{slot.votedBy.length}</span>}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <button
        onClick={onNext}
        className="mt-2 w-full h-12 rounded-xl bg-black text-white text-base font-semibold flex items-center justify-center active:scale-[0.98] transition-transform"
      >
        Fertig
      </button>
    </div>
  )
}
