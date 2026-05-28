// Autor: Amal Najah
// src/components/activities/ActivityCard.tsx
import { ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Activity } from '@/types/activity'

interface ActivityCardProps {
  activity: Activity
  currentUserId?: string
  onVote: (id: string) => void
}

export function ActivityCard({ activity, currentUserId, onVote }: ActivityCardProps) {
  const hasVoted = currentUserId ? activity.votedBy.includes(currentUserId) : false

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.name}</p>
        <p className="text-xs text-gray-400">von {activity.addedByName}</p>
      </div>
      <button
        onClick={() => onVote(activity.id)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all min-h-[36px]',
          hasVoted
            ? 'bg-success/10 text-success border border-success/20'
            : 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary border border-transparent'
        )}
        aria-label={hasVoted ? 'Stimme zurückziehen' : 'Abstimmen'}
      >
        <ThumbsUp size={14} />
        <span>{activity.voteCount}</span>
      </button>
    </div>
  )
}
