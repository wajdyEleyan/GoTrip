// Autor: Amal Najah
// src/pages/ActivitiesVoting.tsx — Screen 11: Aktivitäten-Voting
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { getTripActivities, saveActivity } from '@/utils/storage'
import { toast } from '@/components/shared/Toast'
import type { Activity } from '@/types/activity'

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
    <div className="app-shell flex flex-col min-h-svh bg-white">
      <PageHeader title="Activities Voting" />

      <main className="flex-1 px-4 py-5 overflow-y-auto flex flex-col gap-4 pb-8">
        <p className="text-sm text-gray-500">
          Was wollt ihr in <strong>{trip.name}</strong> unternehmen?
        </p>

        {sorted.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Noch keine Aktivitäten — sei der Erste!
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
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
            />
            <Button onClick={handleAdd} disabled={!newName.trim()}>
              <Plus size={16} />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-2 w-full p-4 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors"
          >
            <Plus size={18} />+ Aktivität hinzufügen
          </button>
        )}

        <Button onClick={() => navigate(`/trip/${id}/final`)} className="w-full mt-2">
          Zum Abschluss
        </Button>
      </main>
    </div>
  )
}
