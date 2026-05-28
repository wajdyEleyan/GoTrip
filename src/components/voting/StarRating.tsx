// Autor: Eya Mathlouthi
// src/components/voting/StarRating.tsx
// NON-NEGOTIABLE: 0.5–5.0 in 0.5-Schritten (aus constitution.md)
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number           // 0–5 in 0.5 steps
  onChange?: (v: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = { sm: 18, md: 24, lg: 32 }

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const starSize = SIZE_MAP[size]
  const display = hovered ?? value

  function handleClick(starIndex: number, isHalf: boolean) {
    if (readonly || !onChange) return
    const newVal = isHalf ? starIndex - 0.5 : starIndex
    onChange(newVal === value ? 0 : newVal)
  }

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>, starIndex: number) {
    if (readonly) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    setHovered(x < rect.width / 2 ? starIndex - 0.5 : starIndex)
  }

  return (
    <div
      className="flex items-center gap-0.5"
      role="group"
      aria-label={`Bewertung: ${value} von 5 Sternen`}
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const full = display >= star
        const half = !full && display >= star - 0.5

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              handleClick(star, x < rect.width / 2)
            }}
            onMouseMove={(e) => handleMouseMove(e, star)}
            className={cn(
              'relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded',
              !readonly && 'cursor-pointer'
            )}
            aria-label={`${star} Sterne`}
            style={{ width: starSize, height: starSize }}
          >
            <svg
              width={starSize}
              height={starSize}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {/* Background star (gray) */}
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="#E5E7EB"
              />
              {/* Filled portion */}
              <clipPath id={`half-${star}`}>
                <rect x="0" y="0" width={half ? '50%' : full ? '100%' : '0%'} height="100%" />
              </clipPath>
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="#F59E0B"
                clipPath={`url(#half-${star})`}
              />
            </svg>
          </button>
        )
      })}

      {!readonly && (
        <span className="ml-2 text-sm font-semibold text-gray-700 tabular-nums w-8">
          {display > 0 ? display.toFixed(1) : '–'}
        </span>
      )}
    </div>
  )
}
