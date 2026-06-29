// src/components/sheets/ActivitiesSheet.tsx
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getTripActivities, saveActivity } from '@/utils/storage'
import { toast } from '@/components/shared/Toast'
import type { Activity } from '@/types/activity'
import type { Trip } from '@/types/trip'
import type { StoredAuth } from '@/utils/storage'

interface Props {
  trip: Trip
  user: StoredAuth
  onNext: () => void
}

export function ActivitiesSheet({ trip, user, onNext }: Props) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [newName, setNewName] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    setActivities(getTripActivities(trip.id))
  }, [trip.id])

  function handleAdd() {
    const trimmed = newName.trim()
    if (!trimmed) return
    const act: Activity = {
      id: crypto.randomUUID(),
      tripId: trip.id,
      name: trimmed,
      addedBy: user.id,
      addedByName: user.name,
      createdAt: new Date().toISOString(),
      voteCount: 0,
      votedBy: [],
    }
    saveActivity(act)
    setActivities(prev => [...prev, act])
    setNewName('')
    setShowInput(false)
    toast.success('Aktivität hinzugefügt!')
  }

  function handleVote(activityId: string) {
    setActivities(prev =>
      prev.map(a => {
        if (a.id !== activityId) return a
        const alreadyVoted = a.votedBy.includes(user.id)
        const updated: Activity = {
          ...a,
          voteCount: alreadyVoted ? a.voteCount - 1 : a.voteCount + 1,
          votedBy: alreadyVoted ? a.votedBy.filter(uid => uid !== user.id) : [...a.votedBy, user.id],
        }
        saveActivity(updated)
        return updated
      })
    )
  }

  const sorted = [...activities].sort((a, b) => b.voteCount - a.voteCount)

  return (
    <div className="px-4 py-4 flex flex-col gap-4 pb-6">
      <p className="text-sm text-gray-700">
        Was wollt ihr in <strong className="text-gray-900">{trip.name}</strong> unternehmen?
      </p>

      {sorted.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-2xl">
          Noch keine Aktivitäten — sei der Erste!
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 px-4 divide-y divide-gray-100">
          {sorted.map(act => (
            <ActivityCard key={act.id} activity={act} currentUserId={user.id} onVote={handleVote} />
          ))}
        </div>
      )}

      {showInput ? (
        <div className="flex gap-2">
          <Input
            placeholder="z.B. Beach Day, Food Tour…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <Button onClick={handleAdd} disabled={!newName.trim()} className="shrink-0">
            <Plus size={16} />
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-2 w-full p-4 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors"
        >
          <Plus size={18} />
          + Aktivität hinzufügen
        </button>
      )}

      <button
        onClick={onNext}
        className="mt-2 w-full h-12 rounded-xl bg-black text-white text-base font-semibold flex items-center justify-center active:scale-[0.98] transition-transform"
      >
        Fertig
      </button>
    </div>
  )
}
