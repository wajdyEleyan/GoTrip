// src/components/shared/PageHeader.tsx
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLanguage } from '@/context/LanguageContext'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  backTo?: string
  rightSlot?: ReactNode
  /** Transparenter Header mit weißem Text — für dunkle Foto-Screens. */
  transparent?: boolean
}

export function PageHeader({ title, showBack = true, backTo, rightSlot, transparent = false }: PageHeaderProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()

  function handleBack() {
    if (backTo) navigate(backTo)
    else navigate(-1)
  }

  const headerCls = transparent
    ? 'flex items-center justify-between h-14 px-4 sticky top-0 z-10'
    : 'flex items-center justify-between h-14 px-4 glass-bar border-b sticky top-0 z-10'
  const backCls = transparent
    ? 'flex items-center gap-1.5 -ml-1 px-2 py-2 rounded-xl text-white/90 hover:bg-white/15 transition-colors'
    : 'flex items-center gap-1.5 -ml-1 px-2 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors'

  return (
    <header className={headerCls}>
      {showBack ? (
        <button onClick={handleBack} className={backCls} aria-label={t('back')}>
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">{t('back')}</span>
        </button>
      ) : (
        <div className="w-20" />
      )}

      <h1 className={`text-base font-bold flex-1 text-center truncate px-2 ${transparent ? 'text-white drop-shadow' : 'text-gray-900'}`}>{title}</h1>

      {rightSlot ? (
        <div className="flex justify-end min-w-[80px]">{rightSlot}</div>
      ) : (
        <div className="w-20" />
      )}
    </header>
  )
}
