import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, X, Search } from 'lucide-react'
import Logo from '../Logo'
import MagneticButton from '../MagneticButton'
import { useUI } from '../../context/UIContext'
import { cn } from '../../lib/utils'

const LINKS = [
  { to: '/explore', label: 'Explore' },
  { to: '/workspace', label: 'Workspace' },
  { to: '/projects', label: 'Projects' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { setPaletteOpen } = useUI()

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header data-nav className={cn('fixed inset-x-0 top-0 z-50 transition-all duration-500', scrolled ? 'py-3' : 'py-5')}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav
          className={cn(
            'flex items-center justify-between rounded-full py-2 pl-5 pr-2 transition-all duration-500',
            scrolled ? 'glass shadow-2xl shadow-black/20' : 'border border-transparent',
          )}
        >
          <Link to="/" aria-label="NEXORA home"><Logo /></Link>

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className="rounded-full px-4 py-2 text-sm text-muted transition hover:text-fg">
                {l.label}
              </NavLink>
            ))}
            <a href="#features" className="rounded-full px-4 py-2 text-sm text-muted transition hover:text-fg">Features</a>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setPaletteOpen(true)} className="btn-icon hidden sm:inline-grid" aria-label="Open command palette" title="Ctrl K">
              <Search size={17} />
            </button>
            <MagneticButton>
              <Link to="/workspace" className="btn-primary !px-5 !py-2.5">
                Launch App <ArrowUpRight size={16} />
              </Link>
            </MagneticButton>
            <button className="btn-icon md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-strong mt-2 flex flex-col rounded-2xl p-2 md:hidden"
            >
              {LINKS.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm hover:bg-line/5">
                  {l.label}
                </Link>
              ))}
              <a href="#features" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm hover:bg-line/5">Features</a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
