// src/components/sheets/PreferencesSheet.tsx
// Präferenzen-Popup: Interessen (Icons) + „Sonstiges" frei + Aktivitäten-Wünsche.
import { useState, useEffect } from 'react'
import { Plus, ThumbsUp } from 'lucide-react'
import { PreferencesForm } from '@/components/preferences/PreferencesForm'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  saveMemberPreferences, getMemberPreferences,
  getTripActivities, saveActivity,
} from '@/utils/storage'
import { toast } from '@/components/shared/Toast'
import type { MemberPreferences } from '@/types/preferences'
import type { Activity } from '@/types/activity'
import type { Trip } from '@/types/trip'
import type { StoredAuth } from '@/utils/storage'

interface Props {
  trip: Trip
  user: StoredAuth
  onNext: () => void
}

export function PreferencesSheet({ trip, user, onNext }: Props) {
  const existing = getMemberPreferences(trip.id, user.id)

  const [activities, setActivities] = useState<Activity[]>([])
  const [newActivity, setNewActivity] = useState('')

  useEffect(() => {
    setActivities(getTripActivities(trip.id))
  }, [trip.id])

  function handleSave(partial: Omit<MemberPreferences, 'memberId' | 'tripId'>) {
    saveMemberPreferences({ memberId: user.id, tripId: trip.id, ...partial })
    toast.success('Präferenzen gespeichert!')
    onNext()
  }

  function addActivity() {
    const name = newActivity.trim()
    if (!name) return
    const act: Activity = {
      id: crypto.randomUUID(),
      tripId: trip.id,
      name,
      addedBy: user.id,
      addedByName: user.name,
      createdAt: new Date().toISOString(),
      voteCount: 1,
      votedBy: [user.id],
    }
    saveActivity(act)
    setActivities(prev => [...prev, act])
    setNewActivity('')
    toast.success('Aktivität hinzugefügt!')
  }

  function toggleVote(id: string) {
    setActivities(prev => prev.map(a => {
      if (a.id !== id) return a
      const voted = a.votedBy.includes(user.id)
      const updated: Activity = {
        ...a,
        voteCount: voted ? a.voteCount - 1 : a.voteCount + 1,
        votedBy: voted ? a.votedBy.filter(u => u !== user.id) : [...a.votedBy, user.id],
      }
      saveActivity(updated)
      return updated
    }))
  }

  const sorted = [...activities].sort((a, b) => b.voteCount - a.voteCount)

  return (
    <div className="px-4 py-4 pb-6">
      <PreferencesForm initial={existing} onSave={handleSave}>
        {/* Aktivitäten-Wünsche — leben in der Gruppe, sofort gespeichert */}
        <section className="glass-card rounded-2xl px-4 py-4">
          <Label className="mb-3 block text-sm font-bold text-gray-700">Aktivitäten-Wünsche</Label>

          {sorted.length > 0 && (
            <div className="flex flex-col divide-y divide-gray-100 mb-3">
              {sorted.map(a => {
                const voted = a.votedBy.includes(user.id)
                return (
                  <div key={a.id} className="flex items-center gap-2 py-2 first:pt-0">
                    <span className="flex-1 text-sm text-gray-800 truncate">{a.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleVote(a.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                        voted ? 'bg-success text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                      aria-pressed={voted}
                    >
                      <ThumbsUp size={12} />{a.voteCount}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="z. B. Strandtag, Food-Tour…"
              value={newActivity}
              onChange={e => setNewActivity(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addActivity() } }}
            />
            <button
              type="button"
              onClick={addActivity}
              disabled={!newActivity.trim()}
              className="shrink-0 w-11 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
              aria-label="Aktivität hinzufügen"
            >
              <Plus size={18} />
            </button>
          </div>
        </section>
      </PreferencesForm>
    </div>
  )
}
