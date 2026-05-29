// src/context/LanguageContext.tsx
import React, { createContext, useContext, useState } from 'react'
import { translations, type Lang, type TranslationKey } from '@/i18n/translations'

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey, params?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem('gotrip_lang')
    return (stored as Lang) ?? 'de'
  })

  function handleSetLang(l: Lang) {
    setLang(l)
    localStorage.setItem('gotrip_lang', l)
  }

  function t(key: TranslationKey, params?: Record<string, string>): string {
    let text = translations[lang][key] ?? translations.de[key] ?? key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, v)
      })
    }
    return text
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
