// Autor: Amal Najah
// src/components/shared/PageHeader.tsx
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  rightSlot?: ReactNode
}

export function PageHeader({ title, showBack = true, rightSlot }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-gray-100 sticky top-0 z-10">
      {showBack ? (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-11 h-11 -ml-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Zurück"
        >
          <ArrowLeft size={22} />
        </button>
      ) : (
        <div className="w-11" />
      )}

      <h1 className="text-base font-semibold text-gray-900 flex-1 text-center">{title}</h1>

      {rightSlot ? (
        <div className="w-11 flex justify-end">{rightSlot}</div>
      ) : (
        <div className="w-11" />
      )}
    </header>
  )
}
