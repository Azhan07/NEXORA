import { createContext, useCallback, useContext, useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { uid } from '../lib/utils'

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = usePersistentState('sidebar-collapsed', false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const id = uid()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])

  return (
    <UIContext.Provider
      value={{
        paletteOpen,
        setPaletteOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileNavOpen,
        setMobileNavOpen,
        toasts,
        toast,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export const useUI = () => useContext(UIContext)
