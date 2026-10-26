import { createContext, useContext, useEffect, useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'

/* Accent palettes — deliberately no purple / violet anywhere. */
export const ACCENTS = {
  cyan: { label: 'Cyan', rgb: '34 211 238', hex: '#22d3ee', rgb2: '52 211 153', hex2: '#34d399' },
  emerald: { label: 'Emerald', rgb: '52 211 153', hex: '#34d399', rgb2: '34 211 238', hex2: '#22d3ee' },
  amber: { label: 'Amber', rgb: '251 191 36', hex: '#fbbf24', rgb2: '251 113 133', hex2: '#fb7185' },
  blue: { label: 'Azure', rgb: '96 165 250', hex: '#60a5fa', rgb2: '34 211 238', hex2: '#22d3ee' },
  rose: { label: 'Coral', rgb: '251 113 133', hex: '#fb7185', rgb2: '251 191 36', hex2: '#fbbf24' },
}

export const DEFAULT_PREFS = { theme: 'dark', accent: 'cyan', reducedMotion: false, quality: 'high' }

export const DEFAULT_PROFILE = {
  name: 'Alex Morgan',
  email: 'alex@nexora.ai',
  role: 'Product Designer',
  bio: 'Exploring the edge of human + machine creativity.',
}

export const DEFAULT_CONTENT = {
  eyebrow: 'Your intelligence, reimagined',
  headline1: 'Step Into the',
  headline2: 'Future of AI.',
  subtext: 'One workspace. Infinite possibilities. An entirely new way to explore intelligence.',
}

const PreferencesContext = createContext(null)

export function PreferencesProvider({ children }) {
  const [rawPrefs, setRawPrefs] = usePersistentState('prefs', DEFAULT_PREFS)
  const [rawProfile, setProfile] = usePersistentState('profile', DEFAULT_PROFILE)
  const [rawContent, setContent] = usePersistentState('content', DEFAULT_CONTENT)
  const [systemReduced, setSystemReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = (e) => setSystemReduced(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const prefs = { ...DEFAULT_PREFS, ...rawPrefs }
  const accent = ACCENTS[prefs.accent] ?? ACCENTS.cyan
  const motionReduced = prefs.reducedMotion || systemReduced
  const isLight = prefs.theme === 'light'

  // Apply theme + accent to <html> so plain CSS / Tailwind pick them up.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('light', isLight)
    root.classList.toggle('dark', !isLight)
    root.classList.toggle('reduce-motion', motionReduced)
    root.style.setProperty('--accent', accent.rgb)
    root.style.setProperty('--accent-2', accent.rgb2)
    root.style.colorScheme = isLight ? 'light' : 'dark'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isLight ? '#f1f4f7' : '#04060a')
  }, [isLight, accent, motionReduced])

  const setPref = (key, value) => setRawPrefs((p) => ({ ...DEFAULT_PREFS, ...p, [key]: value }))

  const value = {
    prefs,
    setPref,
    accent,
    motionReduced,
    systemReduced,
    isLight,
    toggleTheme: () => setPref('theme', isLight ? 'dark' : 'light'),
    profile: { ...DEFAULT_PROFILE, ...rawProfile },
    setProfile,
    content: { ...DEFAULT_CONTENT, ...rawContent },
    setContent,
  }

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export const usePrefs = () => useContext(PreferencesContext)
