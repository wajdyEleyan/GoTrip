// Autor: Mohamad Haj Ahmad
// Liefert ein stabiles Reiseziel-Foto (Unsplash) zu einem Namen.
// Bekannte Ziele werden gezielt gemappt, sonst deterministischer Fallback-Pool.

const KNOWN: Record<string, string> = {
  barcelona: 'photo-1583422409516-2895a77efded',
  lisbon: 'photo-1555881400-74d7acaacd8b',
  lissabon: 'photo-1555881400-74d7acaacd8b',
  athens: 'photo-1533105079780-92b9be482077',
  athen: 'photo-1533105079780-92b9be482077',
  greece: 'photo-1533105079780-92b9be482077',
  griechenland: 'photo-1533105079780-92b9be482077',
  paris: 'photo-1502602898657-3e91760cbb34',
  rome: 'photo-1552832230-c0197dd311b5',
  rom: 'photo-1552832230-c0197dd311b5',
  london: 'photo-1513635269975-59663e0ac1ad',
  berlin: 'photo-1560969184-10fe8719e047',
  amsterdam: 'photo-1534351590666-13e3e96b5017',
  tokyo: 'photo-1540959733332-eab4deabeeaf',
  newyork: 'photo-1496442226666-8d4d0e62e6e9',
  bali: 'photo-1537953773345-d172ccf13cf1',
  dubai: 'photo-1512453979798-5ea266f8880c',
  istanbul: 'photo-1524231757912-21f4fe3a7200',
  ski: 'photo-1551524559-8af4e6624178',
  alpen: 'photo-1469474968028-56623f02e42e',
  alps: 'photo-1469474968028-56623f02e42e',
  mountains: 'photo-1469474968028-56623f02e42e',
  berge: 'photo-1469474968028-56623f02e42e',
  beach: 'photo-1507525428034-b723cf961d3e',
  strand: 'photo-1507525428034-b723cf961d3e',
  summer: 'photo-1507525428034-b723cf961d3e',
  sommer: 'photo-1507525428034-b723cf961d3e',
}

// Fallback-Pool (schöne, generische Reisefotos)
const POOL = [
  'photo-1507525428034-b723cf961d3e', // beach
  'photo-1469474968028-56623f02e42e', // mountains
  'photo-1502602898657-3e91760cbb34', // paris/city
  'photo-1533105079780-92b9be482077', // greece
  'photo-1476514525535-07fb3b4ae5f1', // forest road
  'photo-1501785888041-af3ef285b470', // mountain lake
]

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function photoId(name: string): string {
  const key = (name || '').toLowerCase().replace(/[^a-z]/g, '')
  for (const k of Object.keys(KNOWN)) {
    if (key.includes(k)) return KNOWN[k]
  }
  return POOL[hash(key) % POOL.length]
}

/** Volle Unsplash-URL für eine Foto-Karte. */
export function destinationImage(name: string, width = 600): string {
  return `https://images.unsplash.com/${photoId(name)}?w=${width}&q=70&auto=format&fit=crop`
}

/** CSS-`url(...)` Wert für das Ambient-Hintergrund-Foto (--ambient). */
export function ambientImage(name: string, width = 600): string {
  return `url("${destinationImage(name, width)}")`
}
