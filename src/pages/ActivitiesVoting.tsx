// Autor: Amal Najah
// src/pages/ActivitiesVoting.tsx — Screen 11: Aktivitäten-Voting
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { TripScreen } from '@/components/shared/TripScreen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { getTripActivities, saveActivity } from '@/utils/storage'
import { toast } from '@/components/shared/Toast'
import type { Activity } from '@/types/activity'
import { StepNav } from '@/components/shared/StepNav'

export default function ActivitiesVoting() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { user } = useAuth()

  const trip = id ? getTripById(id) : undefined
  const [activities, setActivities] = useState<Activity[]>([])
  const [newName, setNewName] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    if (id) setActivities(getTripActivities(id))
  }, [id])

  function handleAdd() {
    const trimmed = newName.trim()
    if (!trimmed || !id || !user) return

    const act: Activity = {
      id: crypto.randomUUID(),
      tripId: id,
      name: trimmed,
      addedBy: user.id,
      addedByName: user.name,
      createdAt: new Date().toISOString(),
      voteCount: 0,
      votedBy: [],
    }
    saveActivity(act)
    setActivities((prev) => [...prev, act])
    setNewName('')
    setShowInput(false)
    toast.success('Aktivität hinzugefügt!')
  }

  function handleVote(activityId: string) {
    if (!user) return
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activityId) return a
        const alreadyVoted = a.votedBy.includes(user.id)
        const updated: Activity = {
          ...a,
          voteCount: alreadyVoted ? a.voteCount - 1 : a.voteCount + 1,
          votedBy: alreadyVoted
            ? a.votedBy.filter((uid) => uid !== user.id)
            : [...a.votedBy, user.id],
        }
        saveActivity(updated)
        return updated
      })
    )
  }

  const sorted = [...activities].sort((a, b) => b.voteCount - a.voteCount)

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">Reise nicht gefunden.</p>
        <Button variant="outline" onClick={() => navigate('/home')}>Zur Übersicht</Button>
      </div>
    )
  }

  return (
    <TripScreen title="Aktivitäten" backTo={`/trip/${id}/dashboard`} ambientName={trip.name}>
      <main className="flex-1 px-4 py-5 overflow-y-auto flex flex-col gap-4 pb-28">
        <p className="text-sm text-gray-700 font-medium">
          Was wollt ihr in <strong className="text-gray-900">{trip.name}</strong> unternehmen?
        </p>

        {sorted.length === 0 ? (
          <div className="glass-card text-center py-10 text-gray-500 text-sm rounded-2xl">
            Noch keine Aktivitäten — sei der Erste!
          </div>
        ) : (
          <div className="glass-card px-4 divide-y divide-gray-100 rounded-2xl">
            {sorted.map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                currentUserId={user?.id}
                onVote={handleVote}
              />
            ))}
          </div>
        )}

        {showInput ? (
          <div className="flex gap-2">
            <Input
              placeholder="z.B. Beach Day, Food Tour…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
              className="glass-field text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary"
            />
            <Button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="bg-primary hover:bg-primary/90 text-white shrink-0"
            >
              <Plus size={16} />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-2 w-full p-4 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors"
          >
            <Plus size={18} className="shrink-0" />
            + Aktivität hinzufügen
          </button>
        )}

        <StepNav tripId={id ?? ''} current="activities" />
      </main>
    </TripScreen>
  )
}
