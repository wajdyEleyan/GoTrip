const memCache = new Map<string, string | null>()
const LS_KEY = 'gotrip_place_img'

function lsGet(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') as Record<string, string> } catch { return {} }
}
function lsSet(key: string, base: string) {
  const m = lsGet(); m[key] = base
  try { localStorage.setItem(LS_KEY, JSON.stringify(m)) } catch { /* Quota egal */ }
}

/** Nur der Ort vor dem Komma: „Venedig, Italien" → „Venedig". */
function cityPart(name: string): string {
  return (name || '').split(',')[0].trim()
}

// Dateinamen, die KEIN Stimmungsfoto sind (Karten, Wappen, Flaggen, Logos …).
const SKIP = /(map|karte|stemma|wappen|coat|flag|locator|seal|logo|blason|escudo|bandera|mapa|orthographic|location)/i

function withWidth(base: string, width: number): string {
  return `${base}?width=${width}`
}

/** Liefert die URL eines echten Ortsfotos (oder null, wenn keins gefunden wurde). */
export async function fetchPlaceImage(name: string, width = 800): Promise<string | null> {
  const city = cityPart(name)
  if (!city) return null
  const key = city.toLowerCase()

  if (memCache.has(key)) {
    const base = memCache.get(key)!
    return base ? withWidth(base, width) : null
  }
  const persisted = lsGet()[key]
  if (persisted) { memCache.set(key, persisted); return withWidth(persisted, width) }

  for (const lang of ['de', 'en']) {
    try {
      const resp = await fetch(
        `https://${lang}.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(city)}`,
        { signal: AbortSignal.timeout(8000) },
      )
      if (!resp.ok) continue
      const data = (await resp.json()) as { items?: { type?: string; title?: string }[] }
      const hit = (data.items ?? []).find((it) => {
        if (it.type !== 'image' || !it.title) return false
        const file = it.title.replace(/^(Datei|File|Bild):/i, '')
        return /\.jpe?g$/i.test(file) && !SKIP.test(file)
      })
      if (hit?.title) {
        const file = hit.title.replace(/^(Datei|File|Bild):/i, '')
        const base = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`
        memCache.set(key, base)
        lsSet(key, base)
        return withWidth(base, width)
      }
    } catch { /* nächste Sprache / Fallback */ }
  }
  memCache.set(key, null) // nichts gefunden → nicht erneut versuchen
  return null
}
