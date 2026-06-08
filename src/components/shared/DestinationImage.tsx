// src/components/shared/DestinationImage.tsx
// Zeigt ein echtes Foto des Reiseziels: sofort ein Platzhalter (Unsplash), dann
// wird – sobald geladen – das echte Ortsfoto (Wikipedia/Commons) eingetauscht.
import { useEffect, useState } from 'react'
import { destinationImage } from '@/utils/destinationImage'
import { fetchPlaceImage } from '@/utils/placeImage'

interface Props {
  name: string
  width?: number
  className?: string
  alt?: string
}

export function DestinationImage({ name, width = 800, className, alt }: Props) {
  const fallback = destinationImage(name, width)
  const [src, setSrc] = useState(fallback)

  useEffect(() => {
    let active = true
    setSrc(destinationImage(name, width))
    fetchPlaceImage(name, width)
      .then((real) => { if (active && real) setSrc(real) })
      .catch(() => { /* Platzhalter bleibt */ })
    return () => { active = false }
  }, [name, width])

  return (
    <img
      src={src}
      alt={alt ?? name}
      className={className}
      loading="lazy"
      onError={(e) => {
        const img = e.currentTarget
        // Echtes Foto fehlgeschlagen → zurück auf Platzhalter; sonst ausblenden.
        if (img.src !== fallback) img.src = fallback
        else img.style.display = 'none'
      }}
    />
  )
}
