import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

const STORAGE_KEY = 'guarda360_onboarding_done'

interface OnboardingContextType {
  isOnboardingOpen: boolean
  openOnboarding: () => void
  completeOnboarding: () => void
  isDone: boolean
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isDone, setIsDone] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
  })
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

  const openOnboarding = useCallback(() => setIsOnboardingOpen(true), [])

  const completeOnboarding = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, 'true') } catch { /* ignore */ }
    setIsDone(true)
    setIsOnboardingOpen(false)
  }, [])

  return (
    <OnboardingContext.Provider value={{ isOnboardingOpen, openOnboarding, completeOnboarding, isDone }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider')
  return ctx
}
