// Autor: Eya Mathlouthi
// src/components/shared/SkeletonCard.tsx — Reusable loading skeleton
import { cn } from '@/lib/utils'

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn('bg-gray-200 rounded-lg animate-pulse', className)}
      aria-hidden="true"
    />
  )
}

export function DestinationSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
      role="status"
      aria-label="Reiseziel wird analysiert…"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1 space-y-2">
          <Bone className="h-5 w-3/4" />
          <Bone className="h-3 w-1/2" />
          <Bone className="h-3 w-2/3" />
        </div>
        <Bone className="w-14 h-14 rounded-full shrink-0" />
      </div>
      <div className="space-y-2 border-t border-gray-100 pt-3">
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-5/6" />
        <Bone className="h-3 w-4/6" />
      </div>
      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        KI analysiert Reiseziel…
      </p>
    </div>
  )
}

export function TripCardSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
      role="status"
      aria-label="Wird geladen…"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <Bone className="h-5 w-2/3" />
          <Bone className="h-3 w-1/2" />
        </div>
        <Bone className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Bone className="h-3 w-24" />
        <Bone className="h-3 w-20" />
      </div>
    </div>
  )
}
