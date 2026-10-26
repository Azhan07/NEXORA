import { useLocation, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Search, Sun, Moon, X } from 'lucide-react'
import { useUI } from '../../context/UIContext'
import { usePrefs } from '../../context/PreferencesContext'
import { NAV_ITEMS } from '../../lib/nav'
import Logo from '../Logo'
import { NavList } from './Sidebar'

export default function Topbar() {
  const { pathname } = useLocation()
  const { setPaletteOpen, mobileNavOpen, setMobileNavOpen } = useUI()
  const { isLight, toggleTheme, profile } = usePrefs()
  const current = NAV_ITEMS.find((n) => n.to === pathname)
  const initials = profile.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line/[0.07] bg-bg/60 px-4 backdrop-blur-xl sm:px-6">
        <button className="btn-icon lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Nexora / {current?.label ?? 'App'}</p>
          <p className="truncate font-display text-sm font-medium">{current?.description}</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden items-center gap-2 rounded-full border border-line/10 bg-surface/50 py-2 pl-3 pr-2 text-xs text-muted transition hover:border-accent/40 hover:text-fg sm:flex"
          >
            <Search size={14} />
            <span className="w-36 text-left md:w-48">Search or jump to…</span>
            <span className="kbd">Ctrl K</span>
          </button>
          <button className="btn-icon sm:hidden" onClick={() => setPaletteOpen(true)} aria-label="Search">
            <Search size={18} />
          </button>
          <button className="btn-icon" onClick={toggleTheme} aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isLight ? 'sun' : 'moon'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isLight ? <Sun size={18} /> : <Moon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>
          <Link to="/settings" aria-label="Profile" className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-accent2 text-xs font-bold text-bg">
            {initials}
          </Link>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
            <motion.aside
              className="glass-strong absolute inset-y-0 left-0 flex w-72 flex-col p-4"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            >
              <div className="mb-6 flex items-center justify-between px-2">
                <Logo />
                <button className="btn-icon" onClick={() => setMobileNavOpen(false)} aria-label="Close menu"><X size={18} /></button>
              </div>
              <NavList onNavigate={() => setMobileNavOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
