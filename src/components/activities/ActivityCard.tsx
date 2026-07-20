// Autor: Amal Najah
import { ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Activity } from '@/types/activity'
import { destinationImage } from '@/utils/destinationImage'

interface ActivityCardProps {
  activity: Activity
  currentUserId?: string
  onVote: (id: string) => void
}

export function ActivityCard({ activity, currentUserId, onVote }: ActivityCardProps) {
  const hasVoted = currentUserId ? activity.votedBy.includes(currentUserId) : false

  return (
    <div className="flex items-center gap-3 py-3 last:border-0">
      {/* Activity thumbnail */}
      <div className="shrink-0 w-[50px] h-[40px] rounded-lg overflow-hidden bg-gray-100">
        <img
          src={destinationImage(activity.name, 100)}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{activity.name}</p>
        <p className="text-xs text-gray-400">von {activity.addedByName}</p>
      </div>

      <button
        onClick={() => onVote(activity.id)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] shrink-0',
          hasVoted
            ? 'bg-success text-white border border-success shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary border border-gray-200'
        )}
        aria-label={hasVoted ? 'Stimme zurückziehen' : 'Abstimmen'}
      >
        <ThumbsUp size={14} />
        <span>{activity.voteCount}</span>
      </button>
    </div>
  )
}
