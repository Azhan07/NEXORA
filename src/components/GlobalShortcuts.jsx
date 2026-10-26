import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUI } from '../context/UIContext'
import { NAV_ITEMS } from '../lib/nav'

/**
 * Ctrl/⌘ + K → command palette
 * Ctrl/⌘ + B → collapse sidebar
 * Alt + 1…6  → jump to page
 */
export default function GlobalShortcuts() {
  const navigate = useNavigate()
  const { setPaletteOpen, setSidebarCollapsed } = useUI()

  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()
      if (mod && key === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
        return
      }
      if (mod && key === 'b') {
        e.preventDefault()
        setSidebarCollapsed((c) => !c)
        return
      }
      if (e.altKey && /^Digit[1-6]$/.test(e.code)) {
        e.preventDefault()
        const item = NAV_ITEMS[Number(e.code.slice(5)) - 1]
        if (item) navigate(item.to)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, setPaletteOpen, setSidebarCollapsed])

  return null
}
