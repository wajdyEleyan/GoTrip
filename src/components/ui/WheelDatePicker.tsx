// src/components/ui/WheelDatePicker.tsx — kompaktes iOS-Rad, kein Scrollbar
import { useLayoutEffect, useRef, useCallback } from 'react'

const ITEM_H = 36
const VISIBLE = 3          // 3 Einträge sichtbar
const H = ITEM_H * VISIBLE // Gesamthöhe

const DE_MONTHS = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

interface ColProps {
  items: string[]
  selected: string
  onSelect: (v: string) => void
  widthClass?: string
}

function WheelCol({ items, selected, onSelect, widthClass = 'flex-1' }: ColProps) {
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useLayoutEffect(() => {
    const i = items.indexOf(selected)
    if (ref.current) ref.current.scrollTop = Math.max(0, i) * ITEM_H
  }, []) // nur beim Mount

  const snap = useCallback(() => {
    if (!ref.current) return
    const i = Math.round(ref.current.scrollTop / ITEM_H)
    const c = Math.max(0, Math.min(i, items.length - 1))
    ref.current.scrollTo({ top: c * ITEM_H, behavior: 'smooth' })
    onSelect(items[c])
  }, [items, onSelect])

  function onScroll() {
    clearTimeout(timer.current)
    timer.current = setTimeout(snap, 100)
  }

  return (
    <div className={`relative ${widthClass}`} style={{ height: H }}>
      {/* Mittlerer Balken (Selektion) */}
      <div
        className="absolute inset-x-0 pointer-events-none z-10 rounded-lg bg-primary/8"
        style={{ top: ITEM_H, height: ITEM_H, border: '1px solid rgba(15,125,140,0.18)' }}
      />
      {/* Fade oben */}
      <div className="absolute inset-x-0 top-0 pointer-events-none z-10 rounded-t-xl"
        style={{ height: ITEM_H, background: 'linear-gradient(to bottom,#fff 0%,rgba(255,255,255,0) 100%)' }} />
      {/* Fade unten */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10 rounded-b-xl"
        style={{ height: ITEM_H, background: 'linear-gradient(to top,#fff 0%,rgba(255,255,255,0) 100%)' }} />

      {/* Scrollbare Liste */}
      <div
        ref={ref}
        onScroll={onScroll}
        className="wheel-scroll h-full overflow-y-scroll overscroll-contain"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        <div style={{ height: ITEM_H }} />
        {items.map((item) => (
          <div
            key={item}
            style={{ height: ITEM_H, scrollSnapAlign: 'center' }}
            className={`flex items-center justify-center cursor-pointer transition-all ${
              item === selected
                ? 'text-gray-900 font-bold text-[15px]'
                : 'text-gray-400 font-medium text-[13px]'
            }`}
          >
            {item}
          </div>
        ))}
        <div style={{ height: ITEM_H }} />
      </div>
    </div>
  )
}

interface WheelDatePickerProps {
  value: string       // yyyy-MM-dd
  onChange: (v: string) => void
  min?: string
}

export function WheelDatePicker({ value, onChange, min }: WheelDatePickerProps) {
  const today = new Date()
  const currentYear = today.getFullYear()
  const [yStr = String(currentYear), mStr = '06', dStr = '01'] = (value ?? '').split('-')

  const year  = Number(yStr) || currentYear
  const month = Number(mStr) || 1
  const day   = Number(dStr) || 1

  const maxDay  = daysInMonth(year, month)
  const days    = Array.from({ length: maxDay }, (_, i) => String(i + 1).padStart(2, '0'))
  const months  = DE_MONTHS
  const years   = Array.from({ length: 6 }, (_, i) => String(currentYear + i))

  const selDay   = String(Math.min(day, maxDay)).padStart(2, '0')
  const selMonth = DE_MONTHS[month - 1]
  const selYear  = String(year)

  function upd(y: number, m: number, d: number) {
    const md  = daysInMonth(y, m)
    const dd  = Math.min(d, md)
    const iso = `${y}-${String(m).padStart(2,'0')}-${String(dd).padStart(2,'0')}`
    onChange(!min || iso >= min ? iso : min)
  }

  return (
    <div className="flex rounded-2xl overflow-hidden bg-white" style={{ height: H }}>
      <WheelCol items={days}   selected={selDay}   widthClass="w-14"
        onSelect={v => upd(year, month, Number(v))} />
      <div className="w-px bg-gray-100" />
      <WheelCol items={months} selected={selMonth}
        onSelect={v => upd(year, DE_MONTHS.indexOf(v) + 1, day)} />
      <div className="w-px bg-gray-100" />
      <WheelCol items={years}  selected={selYear}  widthClass="w-20"
        onSelect={v => upd(Number(v), month, day)} />
    </div>
  )
}
