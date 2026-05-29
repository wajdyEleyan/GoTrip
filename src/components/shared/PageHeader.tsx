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
}

export function PageHeader({ title, showBack = true, backTo, rightSlot }: PageHeaderProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()

  function handleBack() {
    if (backTo) navigate(backTo)
    else navigate(-1)
  }

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
      {showBack ? (
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 -ml-1 px-2 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={t('back')}
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium text-gray-600">{t('back')}</span>
        </button>
      ) : (
        <div className="w-20" />
      )}

      <h1 className="text-base font-bold text-gray-900 flex-1 text-center truncate px-2">{title}</h1>

      {rightSlot ? (
        <div className="flex justify-end min-w-[80px]">{rightSlot}</div>
      ) : (
        <div className="w-20" />
      )}
    </header>
  )
}
