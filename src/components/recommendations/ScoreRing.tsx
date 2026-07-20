// Autor: Mohamad Haj Ahmad
interface ScoreRingProps {
  score: number   // 0–1
  size?: number
}

export function ScoreRing({ score, size = 64 }: ScoreRingProps) {
  const pct = Math.round(score * 100)
  const r = (size / 2) - 6
  const circumference = 2 * Math.PI * r
  const offset = circumference - (pct / 100) * circumference

  const color = pct >= 80 ? '#22C55E' : pct >= 60 ? '#6C63FF' : pct >= 40 ? '#F59E0B' : '#EF4444'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }} aria-label={`Score: ${pct}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={5} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>{pct}%</span>
    </div>
  )
}
