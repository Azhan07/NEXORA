import { NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'
import Logo from '../Logo'
import { NAV_ITEMS } from '../../lib/nav'
import { useUI } from '../../context/UIContext'
import { usePrefs } from '../../context/PreferencesContext'
import { cn } from '../../lib/utils'

export function NavList({ collapsed = false, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            title={collapsed ? `${item.label} (${item.shortcut})` : undefined}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                collapsed && 'justify-center px-0',
                isActive ? 'text-fg' : 'text-muted hover:bg-line/5 hover:text-fg',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl border border-accent/25 bg-accent/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                {isActive && <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent shadow-[0_0_12px_rgb(var(--accent))]" />}
                <Icon size={18} className={cn('relative shrink-0', isActive && 'text-accent')} />
                {!collapsed && <span className="relative flex-1">{item.label}</span>}
                {!collapsed && <span className="relative hidden font-mono text-[10px] text-muted/60 group-hover:inline">{item.shortcut}</span>}
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

export default function Sidebar() {
  const { sidebarCollapsed: collapsed, setSidebarCollapsed, setPaletteOpen } = useUI()
  const { profile } = usePrefs()
  const initials = profile.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside
      className={cn(
        'sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-line/[0.07] bg-surface/40 px-3 pb-4 pt-4 backdrop-blur-xl transition-[width] duration-300 lg:flex',
        collapsed ? 'w-[76px]' : 'w-64',
      )}
    >
      <div className={cn('mb-6 flex items-center', collapsed ? 'justify-center' : 'justify-between px-2')}>
        <Link to="/" aria-label="NEXORA home"><Logo collapsed={collapsed} /></Link>
        {!collapsed && (
          <button className="btn-icon" onClick={() => setSidebarCollapsed(true)} aria-label="Collapse sidebar" title="Collapse (Ctrl B)">
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {collapsed && (
        <button className="btn-icon mx-auto mb-4" onClick={() => setSidebarCollapsed(false)} aria-label="Expand sidebar" title="Expand (Ctrl B)">
          <PanelLeftOpen size={18} />
        </button>
      )}

      <NavList collapsed={collapsed} />

      <div className="mt-auto flex flex-col gap-3">
        {!collapsed ? (
          <button
            onClick={() => setPaletteOpen(true)}
            className="glass gradient-border flex items-center gap-2 rounded-xl px-3 py-3 text-left text-xs text-muted transition hover:text-fg"
          >
            <Search size={15} className="text-accent" />
            <span className="flex-1">Quick search</span>
            <span className="kbd">Ctrl K</span>
          </button>
        ) : (
          <button className="btn-icon mx-auto" onClick={() => setPaletteOpen(true)} aria-label="Open command palette">
            <Search size={18} />
          </button>
        )}
        <Link
          to="/settings"
          className={cn('flex items-center gap-3 rounded-xl p-2 transition hover:bg-line/5', collapsed && 'justify-center')}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent2 text-xs font-bold text-bg">
            {initials}
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{profile.name}</span>
              <span className="block truncate text-xs text-muted">{profile.role}</span>
            </span>
          )}
        </Link>
      </div>
    </aside>
  )
}
