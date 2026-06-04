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
    <div className="flex items-center gap-2.5 py-2 min-h-[44px]" role="listitem">
      {/* Avatar */}
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-semibold shrink-0',
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
          'shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full',
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
