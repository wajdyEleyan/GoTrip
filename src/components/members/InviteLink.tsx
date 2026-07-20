// Autor: Amal Najah
import { useState } from 'react'
import { Copy, Check, MessageCircle, Share2 } from 'lucide-react'

// Instagram icon (not in lucide-react v1 — inline SVG)
function InstagramIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}
import { Button } from '@/components/ui/button'
import { toast } from '@/components/shared/Toast'
import { buildInviteLink } from '@/utils/linkGenerator'
import type { Trip } from '@/types/trip'

interface InviteLinkProps {
  inviteCode: string
  trip?: Trip
}

export function InviteLink({ inviteCode, trip }: InviteLinkProps) {
  const [copied, setCopied] = useState(false)
  const inviteLink = buildInviteLink(inviteCode, trip)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast.success('Link kopiert!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = inviteLink
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      toast.success('Link kopiert!')
    }
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(`Komm mit auf meine GoTrip Reise! 🌍\n${inviteLink}`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  function handleInstagram() {
    handleCopy()
    toast.info('Link kopiert – füge ihn in Instagram ein!')
  }

  async function handleMore() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GoTrip Einladung',
          text: 'Komm mit auf meine GoTrip Reise! 🌍',
          url: inviteLink,
        })
      } catch {
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Link Box */}
      <div className="glass-field flex items-center gap-2 rounded-xl p-3">
        <input
          type="text"
          value={inviteLink}
          readOnly
          className="flex-1 bg-transparent text-sm text-gray-700 truncate outline-none select-all"
          aria-label="Einladungslink"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={handleCopy}
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-white/70 border border-white/80 text-gray-600 hover:bg-white/90 transition-colors"
          aria-label={copied ? 'Kopiert' : 'Link kopieren'}
        >
          {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
        </button>
      </div>

      {/* Share Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center gap-2 p-4 glass-field rounded-2xl hover:bg-white/70 transition-colors active:scale-95"
          aria-label="Via WhatsApp teilen"
        >
          <MessageCircle size={28} className="text-[#25D366]" />
          <span className="text-xs font-medium text-gray-700">WhatsApp</span>
        </button>

        <button
          onClick={handleInstagram}
          className="flex flex-col items-center gap-2 p-4 glass-field rounded-2xl hover:bg-white/70 transition-colors active:scale-95"
          aria-label="Via Instagram teilen"
        >
          <span className="text-[#E1306C]"><InstagramIcon size={28} /></span>
          <span className="text-xs font-medium text-gray-700">Instagram</span>
        </button>

        <button
          onClick={handleMore}
          className="flex flex-col items-center gap-2 p-4 glass-field rounded-2xl hover:bg-white/70 transition-colors active:scale-95"
          aria-label="Weitere Optionen"
        >
          <Share2 size={28} className="text-primary" />
          <span className="text-xs font-medium text-gray-700">Mehr</span>
        </button>
      </div>

      <Button
        variant="outline"
        onClick={handleCopy}
        className="w-full bg-primary hover:bg-primary/90 text-white border-0"
      >
        {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
        Link kopieren
      </Button>
    </div>
  )
}
