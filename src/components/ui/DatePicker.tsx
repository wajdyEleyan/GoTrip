// Autor: Mohamad Haj Ahmad und Wajdy Eleyan
// Themenkonformer Date-Picker (ersetzt den nativen Browser-Kalender).
import { useEffect, useRef, useState } from 'react'
import {
  format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isBefore, addMonths, subMonths, startOfDay,
} from 'date-fns'
import { de, enUS, es } from 'date-fns/locale'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

const dateLocales = { de, en: enUS, es }
const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

interface DatePickerProps {
  value?: string                 // yyyy-MM-dd
  onChange: (value: string) => void
  min?: string                   // yyyy-MM-dd
  placeholder?: string
  id?: string
  invalid?: boolean
  'aria-label'?: string
}

export function DatePicker({ value, onChange, min, placeholder, id, invalid, ...rest }: DatePickerProps) {
  const { lang } = useLanguage()
  const locale = dateLocales[lang] ?? de
  const [open, setOpen] = useState(false)
  const selected = value ? parseISO(value) : undefined
  const [view, setView] = useState(() => startOfMonth(selected ?? new Date()))
  const ref = useRef<HTMLDivElement>(null)
  const minDate = min ? startOfDay(parseISO(min)) : undefined

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const days = eachDayOfInterval({ start: startOfMonth(view), end: endOfMonth(view) })
  // Mo-first leading blanks
  const lead = (getDay(startOfMonth(view)) + 6) % 7

  function pick(d: Date) {
    onChange(format(d, 'yyyy-MM-dd'))
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={rest['aria-label']}
        className={cn(
          'glass-field h-12 w-full rounded-xl px-3 flex items-center gap-2 text-left text-sm transition-colors',
          invalid ? 'border-red-400' : 'hover:border-primary',
          selected ? 'text-gray-900' : 'text-gray-400'
        )}
      >
        <Calendar size={16} className="text-primary shrink-0" />
        <span className="truncate">
          {selected ? format(selected, 'd. MMM yyyy', { locale }) : (placeholder ?? 'Datum wählen')}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          className="glass-card absolute z-30 mt-2 w-[280px] rounded-2xl p-3"
          style={{ background: 'rgba(255,255,255,0.95)' }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => setView(subMonths(view, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary/10" aria-label="Vorheriger Monat">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-gray-900 capitalize">
              {format(view, 'MMMM yyyy', { locale })}
            </span>
            <button type="button" onClick={() => setView(addMonths(view, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary/10" aria-label="Nächster Monat">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday row */}
          <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-gray-400 mb-1">
            {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {Array.from({ length: lead }).map((_, i) => <span key={`b${i}`} />)}
            {days.map((d) => {
              const isSel = selected && isSameDay(d, selected)
              const disabled = minDate ? isBefore(startOfDay(d), minDate) : false
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(d)}
                  className={cn(
                    'h-8 rounded-lg flex items-center justify-center transition-colors',
                    isSel ? 'bg-primary text-white font-bold' : 'text-gray-700 hover:bg-primary/10',
                    disabled && 'text-gray-300 hover:bg-transparent cursor-not-allowed'
                  )}
                >
                  {format(d, 'd')}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
