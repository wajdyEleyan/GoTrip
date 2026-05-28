// Autor: Wajdy Eleyan
// src/components/shared/ErrorState.tsx — Wiederverwendbarer Fehlerzustand
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  onBack?: () => void
  backLabel?: string
}

export function ErrorState({
  title = 'Etwas ist schiefgelaufen',
  message = 'Bitte versuche es erneut.',
  onRetry,
  onBack,
  backLabel = 'Zurück',
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-red-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">{message}</p>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {onRetry && (
          <Button onClick={onRetry} className="w-full">
            Erneut versuchen
          </Button>
        )}
        {onBack && (
          <Button variant="outline" onClick={onBack} className="w-full">
            {backLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
