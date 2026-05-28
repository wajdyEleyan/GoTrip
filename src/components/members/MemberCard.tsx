// Autor: Amal Najah
// src/components/members/MemberCard.tsx
import { cn } from '@/lib/utils'
import type { Member } from '@/types/trip'

interface MemberCardProps {
  member: Member
}

export function MemberCard({ member }: MemberCardProps) {
  const initials = member.name.charAt(0).toUpperCase()
  const isAdmin = member.role === 'admin'

  return (
    <div className="flex items-center gap-3 py-3 min-h-[56px]" role="listitem">
      {/* Avatar */}
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-semibold shrink-0',
          member.avatarColor ?? 'bg-gray-400'
        )}
        aria-hidden="true"
      >
        {initials}
      </div>

      {/* Name */}
      <span className="flex-1 text-sm font-medium text-gray-900 truncate">{member.name}</span>

      {/* Badge */}
      <span
        className={cn(
          'shrink-0 text-xs font-medium px-2.5 py-1 rounded-full',
          isAdmin
            ? 'bg-admin/10 text-admin'
            : 'bg-success/10 text-success'
        )}
      >
        {isAdmin ? 'Admin' : 'Joined'}
      </span>
    </div>
  )
}
