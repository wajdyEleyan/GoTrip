import type { InterestType } from '@/types/preferences'
import type { TripItinerary, ItinerarySlot } from '@/types/itinerary'
import { generateUUID } from '@/utils/uuid'

// ─── Mahlzeiten nach Budget ──────────────────────────────────────────────────
function breakfast(budget: number): { activity: string; emoji: string } {
  if (budget < 20) return { activity: 'Frühstück im Hostel-Café', emoji: '🥐' }
  if (budget < 60) return { activity: 'Frühstück im lokalen Café', emoji: '☕' }
  return { activity: 'Frühstück im Hotelrestaurant', emoji: '🍳' }
}

function lunch(budget: number, day: number): { activity: string; emoji: string } {
  const options = budget < 20
    ? [
        { activity: 'Mittagessen am Streetfood-Stand', emoji: '🌮' },
        { activity: 'Picknick im Park', emoji: '🧺' },
        { activity: 'Imbiss in der Fußgängerzone', emoji: '🥙' },
      ]
    : budget < 60
    ? [
        { activity: 'Mittagessen im lokalen Restaurant', emoji: '🍽️' },
        { activity: 'Lunch im Bistro', emoji: '🥗' },
        { activity: 'Mittagessen auf dem Markt', emoji: '🍱' },
      ]
    : [
        { activity: 'Mittagessen im Gourmet-Restaurant', emoji: '🍷' },
        { activity: 'Lunch im Panorama-Restaurant', emoji: '🌅' },
        { activity: 'Mittagessen mit Stadtblick', emoji: '🏙️' },
      ]
  return options[(day - 1) % options.length]
}

function dinner(budget: number, day: number): { activity: string; emoji: string } {
  const options = budget < 20
    ? [
        { activity: 'Abendessen beim Streetfood-Markt', emoji: '🌯' },
        { activity: 'Abendessen im günstigen Restaurant', emoji: '🍜' },
        { activity: 'Gemeinsames Kochen im Hostel', emoji: '🍝' },
      ]
    : budget < 60
    ? [
        { activity: 'Abendessen im traditionellen Restaurant', emoji: '🥘' },
        { activity: 'Abendessen mit lokaler Küche', emoji: '🍛' },
        { activity: 'Dinner im Stadtrestaurant', emoji: '🍽️' },
      ]
    : [
        { activity: 'Fine Dining im Spitzenrestaurant', emoji: '🥂' },
        { activity: 'Abendessen mit Live-Musik', emoji: '🎶' },
        { activity: 'Rooftop-Dinner mit Aussicht', emoji: '🌆' },
      ]
  return options[(day - 1) % options.length]
}

// ─── Destination-spezifische Highlights ──────────────────────────────────────
function getDestinationHighlights(destination: string): Array<{ activity: string; emoji: string }> {
  const city = destination.toLowerCase()

  if (city.includes('tokio') || city.includes('tokyo') || city.includes('japan')) return [
    { activity: 'Tsukiji Außenmarkt erkunden', emoji: '🐟' },
    { activity: 'Shibuya Crossing besichtigen', emoji: '🚶' },
    { activity: 'Meiji-Schrein besuchen', emoji: '⛩️' },
    { activity: 'Harajuku Takeshita Street', emoji: '🛍️' },
    { activity: 'Akihabara Electronics District', emoji: '🎮' },
    { activity: 'Shinjuku Gyoen Parkspaziergang', emoji: '🌸' },
    { activity: 'Asakusa Senso-ji Tempel', emoji: '🏯' },
    { activity: 'Teamlab Digital Art Museum', emoji: '🎨' },
  ]

  if (city.includes('paris') || city.includes('frankreich')) return [
    { activity: 'Eiffelturm besichtigen', emoji: '🗼' },
    { activity: 'Louvre Museum besuchen', emoji: '🖼️' },
    { activity: 'Montmartre Spaziergang', emoji: '🎨' },
    { activity: 'Seine-Bootsfahrt', emoji: '⛵' },
    { activity: 'Champs-Élysées bummeln', emoji: '🛍️' },
    { activity: 'Musée d\'Orsay besuchen', emoji: '🏛️' },
    { activity: 'Sacré-Cœur Basilika', emoji: '⛪' },
    { activity: 'Marché d\'Aligre Besuch', emoji: '🥖' },
  ]

  if (city.includes('barcelona') || city.includes('spanien')) return [
    { activity: 'Sagrada Família besichtigen', emoji: '⛪' },
    { activity: 'La Boqueria Markt besuchen', emoji: '🍅' },
    { activity: 'Barceloneta Strand', emoji: '🏖️' },
    { activity: 'Park Güell erkunden', emoji: '🌿' },
    { activity: 'Gothic Quarter Stadtführung', emoji: '🏛️' },
    { activity: 'Passeig de Gràcia bummeln', emoji: '🏛️' },
    { activity: 'Camp Nou besichtigen', emoji: '⚽' },
    { activity: 'Tibidabo Vergnügungspark', emoji: '🎡' },
  ]

  if (city.includes('rom') || city.includes('rome') || city.includes('italien') || city.includes('italy')) return [
    { activity: 'Kolosseum besichtigen', emoji: '🏟️' },
    { activity: 'Vatikan & Sixtinische Kapelle', emoji: '⛪' },
    { activity: 'Trevi-Brunnen besuchen', emoji: '⛲' },
    { activity: 'Via Condotti Shopping', emoji: '🛍️' },
    { activity: 'Borghese-Galerie besuchen', emoji: '🖼️' },
    { activity: 'Trastevere Stadtviertel', emoji: '🍕' },
    { activity: 'Pantheon besichtigen', emoji: '🏛️' },
    { activity: 'Forum Romanum erkunden', emoji: '🗿' },
  ]

  if (city.includes('frankfurt') || city.includes('berlin') || city.includes('münchen') || city.includes('deutschland')) return [
    { activity: 'Altstadt & Römerberg erkunden', emoji: '🏛️' },
    { activity: 'Lokalen Wochenmarkt besuchen', emoji: '🥨' },
    { activity: 'Museumsufer entlang schlendern', emoji: '🎭' },
    { activity: 'Biergarten-Besuch', emoji: '🍺' },
    { activity: 'Stadtrundfahrt mit Audioguide', emoji: '🚌' },
    { activity: 'Historisches Museum besuchen', emoji: '🏰' },
    { activity: 'Mainufer Spaziergang', emoji: '🌊' },
    { activity: 'Sachsenhausen Apfelwein-Tour', emoji: '🍎' },
  ]

  if (city.includes('dubai') || city.includes('emirate') || city.includes('abu dhabi')) return [
    { activity: 'Burj Khalifa Aussichtsplattform', emoji: '🏙️' },
    { activity: 'Dubai Mall besuchen', emoji: '🛍️' },
    { activity: 'Wüstensafari', emoji: '🐪' },
    { activity: 'Dubai Creek Abra-Fahrt', emoji: '⛵' },
    { activity: 'Gold Souk & Gewürzsouk', emoji: '🌶️' },
    { activity: 'Palm Jumeirah erkunden', emoji: '🌴' },
    { activity: 'Jumeirah Strand', emoji: '🏖️' },
    { activity: 'Dubai Frame besichtigen', emoji: '🖼️' },
  ]

  if (city.includes('new york') || city.includes('usa') || city.includes('manhattan')) return [
    { activity: 'Central Park Spaziergang', emoji: '🌳' },
    { activity: 'Brooklyn Bridge überqueren', emoji: '🌉' },
    { activity: 'Times Square erleben', emoji: '🗽' },
    { activity: 'Metropolitan Museum of Art', emoji: '🏛️' },
    { activity: '5th Avenue Shopping', emoji: '🛍️' },
    { activity: 'High Line Park entlang laufen', emoji: '🌿' },
    { activity: 'Staten Island Ferry fahren', emoji: '⛴️' },
    { activity: 'Chelsea Market besuchen', emoji: '🥐' },
  ]

  // Generische Highlights für unbekannte Städte
  return [
    { activity: 'Historisches Stadtzentrum erkunden', emoji: '🏛️' },
    { activity: 'Lokalen Markt besuchen', emoji: '🛒' },
    { activity: 'Hauptsehenswürdigkeit besichtigen', emoji: '📍' },
    { activity: 'Stadtpark Spaziergang', emoji: '🌳' },
    { activity: 'Lokale Museen entdecken', emoji: '🎭' },
    { activity: 'Aussichtspunkt aufsuchen', emoji: '🔭' },
    { activity: 'Souvenirs kaufen', emoji: '🎁' },
    { activity: 'Hafen- oder Flusspromenade', emoji: '🌊' },
  ]
}

// ─── Aktivitäten nach Interesse & Tageszeit ──────────────────────────────────
type TimeOfDay = 'morning' | 'afternoon' | 'evening'

const INTEREST_ACTIVITIES: Record<InterestType, Record<TimeOfDay, Array<{ activity: string; emoji: string }>>> = {
  beach: {
    morning: [
      { activity: 'Morgenspaziergang am Strand', emoji: '🌊' },
      { activity: 'Frühmorgens schwimmen gehen', emoji: '🏊' },
      { activity: 'Strand-Yoga bei Sonnenaufgang', emoji: '🧘' },
    ],
    afternoon: [
      { activity: 'Schnorcheln & Tauchen', emoji: '🤿' },
      { activity: 'Beachvolleyball spielen', emoji: '🏐' },
      { activity: 'Bootsausflug zur Insel', emoji: '⛵' },
      { activity: 'Surfen lernen', emoji: '🏄' },
    ],
    evening: [
      { activity: 'Sonnenuntergang am Strand', emoji: '🌅' },
      { activity: 'Strandparty & Bonfire', emoji: '🔥' },
      { activity: 'Sunset-Cocktails am Meer', emoji: '🍹' },
    ],
  },
  city: {
    morning: [
      { activity: 'Frühmorgens Stadtspaziergang', emoji: '🚶' },
      { activity: 'Wochenmarkt besuchen', emoji: '🥦' },
      { activity: 'Café-Hopping durch die Altstadt', emoji: '☕' },
    ],
    afternoon: [
      { activity: 'Street-Art-Tour durch Viertel', emoji: '🎨' },
      { activity: 'Shopping-Tour in der City', emoji: '🛍️' },
      { activity: 'Fotorunde durch die Stadt', emoji: '📸' },
    ],
    evening: [
      { activity: 'Nachtleben erkunden', emoji: '🌆' },
      { activity: 'Rooftop-Bar mit Stadtpanorama', emoji: '🏙️' },
      { activity: 'Nachtmarkt besuchen', emoji: '🏮' },
    ],
  },
  nature: {
    morning: [
      { activity: 'Morgen-Wanderung im Wald', emoji: '🥾' },
      { activity: 'Vogelbeobachtung im Nationalpark', emoji: '🦜' },
      { activity: 'Fahrradtour durch die Natur', emoji: '🚴' },
    ],
    afternoon: [
      { activity: 'Botanischen Garten erkunden', emoji: '🌺' },
      { activity: 'Wasserfälle besichtigen', emoji: '💧' },
      { activity: 'Picknick am See', emoji: '🧺' },
      { activity: 'Naturpark-Wanderung', emoji: '🌿' },
    ],
    evening: [
      { activity: 'Sternenhimmel beobachten', emoji: '⭐' },
      { activity: 'Abendspaziergang im Park', emoji: '🌙' },
      { activity: 'Lagerfeuer in der Natur', emoji: '🔥' },
    ],
  },
  adventure: {
    morning: [
      { activity: 'Klettern / Bouldern', emoji: '🧗' },
      { activity: 'Mountainbike-Tour', emoji: '🚵' },
      { activity: 'Morgen-Kajak-Tour', emoji: '🛶' },
    ],
    afternoon: [
      { activity: 'Zip-Line-Abenteuer', emoji: '🪂' },
      { activity: 'Quad-Tour durch die Region', emoji: '🏍️' },
      { activity: 'Rafting im Fluss', emoji: '🌊' },
    ],
    evening: [
      { activity: 'Paragliding bei Sonnenuntergang', emoji: '🪁' },
      { activity: 'Abenteuersport-Abschlussfeier', emoji: '🎉' },
      { activity: 'Nachtwanderung mit Taschenlampe', emoji: '🔦' },
    ],
  },
  culture: {
    morning: [
      { activity: 'Historisches Museum besuchen', emoji: '🏛️' },
      { activity: 'Geführte Altstadttour', emoji: '🗺️' },
      { activity: 'Archäologische Stätten erkunden', emoji: '🏺' },
    ],
    afternoon: [
      { activity: 'Kunstgalerie besuchen', emoji: '🖼️' },
      { activity: 'Kulturzentrum erkunden', emoji: '🎭' },
      { activity: 'Historische Kirche / Moschee besichtigen', emoji: '⛪' },
    ],
    evening: [
      { activity: 'Konzert oder Oper besuchen', emoji: '🎻' },
      { activity: 'Kulturabend mit lokalem Tanz', emoji: '💃' },
      { activity: 'Open-Air-Kino', emoji: '🎬' },
    ],
  },
  nightlife: {
    morning: [
      { activity: 'Ausschlafen & gemütliches Frühstück', emoji: '😴' },
      { activity: 'Spätes Brunch in der Stadt', emoji: '🥞' },
      { activity: 'Stadtbummel am Vormittag', emoji: '🚶' },
    ],
    afternoon: [
      { activity: 'Happy Hour in der Cocktailbar', emoji: '🍸' },
      { activity: 'Craft-Beer-Verkostung', emoji: '🍺' },
      { activity: 'Weinkeller-Besichtigung', emoji: '🍷' },
    ],
    evening: [
      { activity: 'Club-Nacht im angesagten Viertel', emoji: '🎉' },
      { activity: 'Live-Musik-Bar', emoji: '🎸' },
      { activity: 'Bar-Hopping durch die Innenstadt', emoji: '🍹' },
    ],
  },
  relaxation: {
    morning: [
      { activity: 'Yoga & Meditation am Morgen', emoji: '🧘' },
      { activity: 'Ruhiger Spa-Morgen', emoji: '🧖' },
      { activity: 'Entspannter Parkspaziergang', emoji: '🌸' },
    ],
    afternoon: [
      { activity: 'Massage & Wellness', emoji: '💆' },
      { activity: 'Pool-Entspannung', emoji: '🏊' },
      { activity: 'Lesetag auf der Terrasse', emoji: '📖' },
    ],
    evening: [
      { activity: 'Thermalbad & Sauna', emoji: '♨️' },
      { activity: 'Abend-Yoga bei Kerzenlicht', emoji: '🕯️' },
      { activity: 'Entspannter Sonnenuntergang', emoji: '🌄' },
    ],
  },
  food: {
    morning: [
      { activity: 'Lokaler Lebensmittelmarkt-Besuch', emoji: '🥩' },
      { activity: 'Bäckereibesuch & Spezialitäten probieren', emoji: '🥐' },
      { activity: 'Frühstücks-Tour durch Lokale', emoji: '🍳' },
    ],
    afternoon: [
      { activity: 'Kochkurs mit lokaler Küche', emoji: '👨‍🍳' },
      { activity: 'Streetfood-Tour durch die Stadt', emoji: '🌮' },
      { activity: 'Weinverkostung im Weingut', emoji: '🍇' },
    ],
    evening: [
      { activity: 'Restaurant-Tour durch 3 Lokale', emoji: '🍽️' },
      { activity: 'Tapas / Meze-Abend', emoji: '🫒' },
      { activity: 'Lokales Food-Festival', emoji: '🎪' },
    ],
  },
  shopping: {
    morning: [
      { activity: 'Flohmarkt & Antiquitäten', emoji: '🪙' },
      { activity: 'Lokale Boutiquen erkunden', emoji: '👗' },
      { activity: 'Handwerksmarkt besuchen', emoji: '🎨' },
    ],
    afternoon: [
      { activity: 'Shopping-Center-Tour', emoji: '🏬' },
      { activity: 'Outlet-Park besuchen', emoji: '🛒' },
      { activity: 'Souvenir-Shopping in der Altstadt', emoji: '🎁' },
    ],
    evening: [
      { activity: 'Nachtmarkt-Shopping', emoji: '🏮' },
      { activity: 'Duty-Free-Einkauf', emoji: '✈️' },
      { activity: 'Abendlicher Stadtbummel', emoji: '🌃' },
    ],
  },
}

// ─── Geografische Prüfung ────────────────────────────────────────────────────
function isCoastalDestination(destination: string): boolean {
  const d = destination.toLowerCase()
  const coastal = [
    'barcelona', 'dubai', 'miami', 'sydney', 'bali', 'ibiza', 'mallorca',
    'istanbul', 'nice', 'cannes', 'rio', 'athen', 'griechenland', 'kroatien',
    'türkei', 'portugal', 'sizilien', 'sardinien', 'malta', 'zypern', 'marokko',
    'ägypten', 'thailand', 'spanien', 'italien', 'frankreich', 'teneriffa',
    'fuerteventura', 'lanzarote', 'gran canaria', 'kreta', 'rhodos', 'korfu',
    'mykonos', 'santorini', 'singapur', 'hong kong', 'hawaii', 'cancun',
    'phuket', 'ko samui', 'malediven', 'seychellen', 'mauritius', 'lissabon',
    'algarve', 'valencia', 'malaga', 'palma', 'split', 'dubrovnik', 'zadar',
    'antalya', 'bodrum', 'izmir', 'hurghada', 'sharm', 'agadir', 'tunis',
  ]
  return coastal.some(c => d.includes(c))
}

// ─── Plan generieren ──────────────────────────────────────────────────────────
export interface GeneratePlanParams {
  interests: InterestType[]
  budgetPerPerson: number
  startDate: string
  endDate: string
  destination: string
}

export function generateItinerary(params: GeneratePlanParams): TripItinerary {
  const { interests, budgetPerPerson, startDate, endDate, destination } = params
  const days = tripDaysCount(startDate, endDate)
  const highlights = getDestinationHighlights(destination)
  const coastal = isCoastalDestination(destination)

  // Beach-Aktivitäten nur bei Küstenzielen erlauben
  const effectiveInterests = coastal
    ? interests
    : interests.filter(i => i !== 'beach')

  const usedHighlights = new Set<string>()
  const usedActivities = new Set<string>()

  function nextHighlight(): { activity: string; emoji: string } | null {
    for (const h of highlights) {
      if (!usedHighlights.has(h.activity)) {
        usedHighlights.add(h.activity)
        return h
      }
    }
    return null
  }

  function nextActivity(time: TimeOfDay, preferredIdx: number): { activity: string; emoji: string } {
    const base = effectiveInterests.length > 0 ? effectiveInterests : (['city', 'culture'] as InterestType[])
    for (let i = 0; i < base.length; i++) {
      const interest = base[(preferredIdx + i) % base.length]
      const pool = INTEREST_ACTIVITIES[interest]?.[time] ?? []
      for (const act of pool) {
        if (!usedActivities.has(act.activity)) {
          usedActivities.add(act.activity)
          return act
        }
      }
    }
    // Fallback
    return { activity: 'Freie Zeit & Entspannung', emoji: '🌿' }
  }

  const plan: TripItinerary = []

  for (let dayNum = 1; dayNum <= days; dayNum++) {
    const date = addDays(startDate, dayNum - 1)
    const interestRotation = (dayNum - 1) % Math.max(interests.length, 1)

    // Erster Tag: Ankunft + Highlight
    // Letzter Tag: Abreisevorbereitung
    const isFirst = dayNum === 1
    const isLast = dayNum === days

    const slots: ItinerarySlot[] = []

    const mkSlot = (time: string, act: { activity: string; emoji: string }, type: 'meal' | 'activity'): ItinerarySlot => ({
      id: generateUUID(),
      time,
      activity: act.activity,
      emoji: act.emoji,
      type,
      votedBy: [],
    })

    if (isFirst) {
      slots.push(mkSlot('10:00', { activity: 'Ankunft & Einchecken', emoji: '🏨' }, 'activity'))
      slots.push(mkSlot('12:30', lunch(budgetPerPerson, dayNum), 'meal'))
      const hl = nextHighlight()
      slots.push(mkSlot('14:00', hl ?? nextActivity('afternoon', interestRotation), 'activity'))
      slots.push(mkSlot('17:00', nextActivity('evening', interestRotation), 'activity'))
      slots.push(mkSlot('19:30', dinner(budgetPerPerson, dayNum), 'meal'))
    } else if (isLast) {
      slots.push(mkSlot('08:00', breakfast(budgetPerPerson), 'meal'))
      const hl = nextHighlight()
      slots.push(mkSlot('09:30', hl ?? nextActivity('morning', interestRotation), 'activity'))
      slots.push(mkSlot('12:30', lunch(budgetPerPerson, dayNum), 'meal'))
      slots.push(mkSlot('14:30', { activity: 'Koffer packen & Abreise vorbereiten', emoji: '🧳' }, 'activity'))
    } else {
      slots.push(mkSlot('08:00', breakfast(budgetPerPerson), 'meal'))
      const hl = nextHighlight()
      slots.push(mkSlot('09:30', hl ?? nextActivity('morning', interestRotation), 'activity'))
      slots.push(mkSlot('12:30', lunch(budgetPerPerson, dayNum), 'meal'))
      slots.push(mkSlot('14:00', nextActivity('afternoon', (interestRotation + 1) % Math.max(interests.length, 1)), 'activity'))
      slots.push(mkSlot('17:00', nextActivity('evening', interestRotation), 'activity'))
      slots.push(mkSlot('19:30', dinner(budgetPerPerson, dayNum), 'meal'))
    }

    plan.push({ dayNumber: dayNum, date, slots })
  }

  return plan
}

export function tripDaysCount(startDate: string, endDate: string): number {
  try {
    const ms = new Date(endDate).getTime() - new Date(startDate).getTime()
    const days = Math.round(ms / (1000 * 60 * 60 * 24))
    return Math.max(1, days)
  } catch {
    return 3
  }
}

function addDays(dateStr: string, days: number): string {
  try {
    const d = new Date(dateStr)
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  } catch {
    return dateStr
  }
}
