// Autor: Mohamad Haj Ahmad, Eya Mathlouthi und Wajdy Eleyan
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MemberBalance, Settlement } from '@/types/expense'

interface BalanceSummaryProps {
  balances: MemberBalance[]
  settlements: Settlement[]
  currentUserId?: string
}

export function BalanceSummary({ balances, settlements, currentUserId }: BalanceSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Per-member net balance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Salden</h3>
        <div className="flex flex-col gap-2">
          {balances.map((b) => {
            const isMe = b.memberId === currentUserId
            const positive = b.net >= 0
            return (
              <div key={b.memberId} className="flex items-center gap-2">
                <span className={cn('text-sm flex-1', isMe && 'font-semibold text-gray-900')}>
                  {isMe ? 'Du' : b.memberName}
                </span>
                <span className={cn(
                  'text-sm font-semibold tabular-nums',
                  positive ? 'text-success' : 'text-red-500'
                )}>
                  {positive ? '+' : ''}{b.net.toFixed(2)} €
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Settlements */}
      {settlements.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Wer schuldet wem?</h3>
          <div className="flex flex-col gap-2.5">
            {settlements.map((s, i) => {
              const isMeFrom = s.from === currentUserId
              const isMeTo = s.to === currentUserId
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl text-sm',
                    isMeFrom ? 'bg-red-50' : isMeTo ? 'bg-green-50' : 'bg-gray-50'
                  )}
                >
                  <span className={cn('font-medium', isMeFrom && 'text-red-700')}>
                    {isMeFrom ? 'Du' : s.fromName}
                  </span>
                  <ArrowRight size={14} className="text-gray-400 shrink-0" />
                  <span className={cn('font-medium flex-1', isMeTo && 'text-success')}>
                    {isMeTo ? 'Du' : s.toName}
                  </span>
                  <span className="font-semibold tabular-nums text-gray-800">
                    {s.amount.toFixed(2)} €
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {settlements.length === 0 && balances.length > 0 && (
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-sm font-medium text-success">Alles ausgeglichen!</p>
        </div>
      )}
    </div>
  )
}
