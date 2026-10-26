import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, CornerDownLeft, MessageSquarePlus, SunMoon, Accessibility, Palette } from 'lucide-react'
import { useUI } from '../context/UIContext'
import { usePrefs, ACCENTS } from '../context/PreferencesContext'
import { NAV_ITEMS } from '../lib/nav'
import { TOOLS, categoryById } from '../data/tools'
import { cn } from '../lib/utils'

export default function CommandPalette() {
  const { paletteOpen, setPaletteOpen, toast } = useUI()
  const { toggleTheme, isLight, prefs, setPref } = usePrefs()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const items = useMemo(() => {
    const accentKeys = Object.keys(ACCENTS)
    return [
      ...NAV_ITEMS.map((n) => ({
        id: 'nav' + n.to, group: 'Pages', label: n.label, sub: n.description, icon: n.icon, hint: n.shortcut,
        run: () => navigate(n.to),
      })),
      ...TOOLS.map((t) => ({
        id: 'tool' + t.id, group: 'AI Tools', label: t.name, sub: `${categoryById[t.category].label} · ${t.tagline}`,
        icon: t.icon, color: t.color, keywords: t.tags.join(' '),
        run: () => navigate(`/explore?tool=${t.id}`),
      })),
      { id: 'a-new', group: 'Actions', label: 'New chat', sub: 'Start a fresh conversation', icon: MessageSquarePlus, run: () => navigate('/workspace?new=1') },
      {
        id: 'a-theme', group: 'Actions', label: `Switch to ${isLight ? 'dark' : 'light'} mode`, sub: 'Toggle theme', icon: SunMoon, keywords: 'theme dark light',
        run: () => toggleTheme(),
      },
      {
        id: 'a-motion', group: 'Actions', label: prefs.reducedMotion ? 'Enable full motion' : 'Reduce motion', sub: 'Accessibility', icon: Accessibility, keywords: 'animation',
        run: () => {
          setPref('reducedMotion', !prefs.reducedMotion)
          toast(prefs.reducedMotion ? 'Full motion enabled' : 'Reduced motion on')
        },
      },
      {
        id: 'a-accent', group: 'Actions', label: 'Cycle accent color', sub: `Current: ${ACCENTS[prefs.accent]?.label}`, icon: Palette, keywords: 'color theme',
        run: () => {
          const next = accentKeys[(accentKeys.indexOf(prefs.accent) + 1) % accentKeys.length]
          setPref('accent', next)
          toast(`Accent: ${ACCENTS[next].label}`)
        },
      },
    ]
  }, [navigate, isLight, toggleTheme, prefs.reducedMotion, prefs.accent, setPref, toast])

  const filtered = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
    if (!terms.length) return items
    return items.filter((it) => {
      const hay = `${it.label} ${it.sub ?? ''} ${it.group} ${it.keywords ?? ''}`.toLowerCase()
      return terms.every((t) => hay.includes(t))
    })
  }, [items, query])

  useEffect(() => {
    if (paletteOpen) {
      setQuery('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 20)
    }
  }, [paletteOpen])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const run = (item) => {
    setPaletteOpen(false)
    item?.run()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(filtered.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      run(filtered[active])
    } else if (e.key === 'Escape') {
      setPaletteOpen(false)
    }
  }

  let lastGroup = null

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-start justify-center bg-bg/60 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => setPaletteOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-label="Command palette"
            className="glass-strong gradient-border w-full max-w-xl overflow-hidden rounded-2xl shadow-[0_30px_120px_-20px_rgba(0,0,0,0.7)]"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line/10 px-4">
              <Search size={18} className="text-accent" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search pages, tools and actions…"
                className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted/70"
                aria-label="Search commands"
              />
              <span className="kbd">Esc</span>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="px-3 py-10 text-center text-sm text-muted">No results for “{query}”.</p>
              )}
              {filtered.map((it, i) => {
                const header = it.group !== lastGroup ? it.group : null
                lastGroup = it.group
                const Icon = it.icon
                return (
                  <div key={it.id}>
                    {header && <p className="px-3 pb-1.5 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{header}</p>}
                    <button
                      data-index={i}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => run(it)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                        i === active ? 'bg-accent/10 text-fg' : 'text-fg/85',
                      )}
                    >
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line/10 bg-line/5"
                        style={it.color ? { color: it.color } : undefined}
                      >
                        <Icon size={16} className={it.color ? '' : 'text-accent'} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{it.label}</span>
                        {it.sub && <span className="block truncate text-xs text-muted">{it.sub}</span>}
                      </span>
                      {it.hint && <span className="kbd hidden sm:inline-flex">{it.hint}</span>}
                      {i === active && <CornerDownLeft size={14} className="text-accent" />}
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between border-t border-line/10 px-4 py-2.5 text-[11px] text-muted">
              <span className="flex items-center gap-2"><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
              <span className="flex items-center gap-2"><span className="kbd">Enter</span> select</span>
              <span className="hidden items-center gap-2 sm:flex"><span className="kbd">Ctrl</span><span className="kbd">K</span> toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
