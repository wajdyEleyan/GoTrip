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
  // Start: KEIN Bild — wir zeigen erst, wenn das echte Ortsfoto feststeht.
  // So blitzt kein zufälliger Platzhalter auf und das alte Bild ist sofort weg.
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setSrc(null) // altes Bild sofort entfernen
    fetchPlaceImage(name, width)
      .then((real) => { if (active) setSrc(real ?? fallback) })
      .catch(() => { if (active) setSrc(fallback) })
    return () => { active = false }
    // fallback ist aus name/width abgeleitet → bewusst nicht in den Deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, width])

  if (!src) return null // während des Ladens: nur der Karten-Hintergrund

  return (
    <img
      src={src}
      alt={alt ?? name}
      className={className}
      onError={(e) => {
        const img = e.currentTarget
        // Echtes Foto fehlgeschlagen → einmal auf Notfall-Bild; sonst ausblenden.
        if (img.src !== fallback) img.src = fallback
        else img.style.display = 'none'
      }}
    />
  )
}
