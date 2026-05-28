// Autor: Amal Najah
// src/components/members/MemberList.tsx
import { MemberCard } from './MemberCard'
import type { Member } from '@/types/trip'

interface MemberListProps {
  members: Member[]
}

export function MemberList({ members }: MemberListProps) {
  if (members.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-8">Noch keine Mitglieder</p>
    )
  }

  return (
    <ul
      className="divide-y divide-gray-100"
      role="list"
      aria-label="Mitgliederliste"
    >
      {members.map((member) => (
        <li key={member.id}>
          <MemberCard member={member} />
        </li>
      ))}
    </ul>
  )
}
