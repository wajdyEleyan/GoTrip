// src/components/shared/GlassPopup.tsx
// Zentriertes Pop-up im Glas-Look: starker Backdrop-Blur dahinter,
// halbtransparente Glas-Karte mit weichem Rand & Schatten.
import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface GlassPopupProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function GlassPopup({ open, title, onClose, children }: GlassPopupProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop — Blur über dem dahinterliegenden Screen */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/25 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
      />

      {/* Glas-Karte */}
      <div
        className="relative w-full max-w-[400px] max-h-[86svh] flex flex-col rounded-3xl border border-white/50 shadow-2xl overflow-hidden animate-[popIn_0.25s_cubic-bezier(0.16,1,0.3,1)]"
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(26px) saturate(160%)',
          WebkitBackdropFilter: 'blur(26px) saturate(160%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/40 shrink-0">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Schließen"
            title=""
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-800 hover:bg-white/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollbarer Inhalt */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}
