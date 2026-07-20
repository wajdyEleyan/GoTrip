// Autor: Eya Mathlouthi
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface AccessibilityContextType {
  seniorenModus: boolean
  toggleSeniorenModus: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  seniorenModus: false,
  toggleSeniorenModus: () => {},
})

const STORAGE_KEY = 'gotrip_senioren_modus'

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [seniorenModus, setSeniorenModus] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(seniorenModus))
    if (seniorenModus) {
      document.documentElement.classList.add('senioren-modus')
    } else {
      document.documentElement.classList.remove('senioren-modus')
    }
  }, [seniorenModus])

  function toggleSeniorenModus() {
    setSeniorenModus((v) => !v)
  }

  return (
    <AccessibilityContext.Provider value={{ seniorenModus, toggleSeniorenModus }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  return useContext(AccessibilityContext)
}
