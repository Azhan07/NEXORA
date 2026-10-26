import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Box, LayoutGrid, Search, SlidersHorizontal, X, MousePointer2, Star, Zap, Activity } from 'lucide-react'
import Toggle from '../components/Toggle'
import { usePrefs, ACCENTS } from '../context/PreferencesContext'
import { TOOLS, CATEGORIES, categoryById, toolById } from '../data/tools'
import { cn, formatNumber, trackSpotlight } from '../lib/utils'

const UniverseScene = lazy(() => import('../three/UniverseScene'))

function ToolPanel({ tool, onClose, onOpen, onSelect }) {
  const cat = categoryById[tool.category]
  const related = TOOLS.filter((t) => t.category === tool.category && t.id !== tool.id)
  const Icon = tool.icon
  return (
    <motion.aside
      key={tool.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong gradient-border absolute bottom-4 right-4 top-4 z-20 flex w-[calc(100%-2rem)] flex-col overflow-y-auto rounded-3xl p-6 sm:w-96"
    >
      <button onClick={onClose} className="btn-icon absolute right-3 top-3" aria-label="Close panel"><X size={18} /></button>
      <span
        className="grid h-14 w-14 place-items-center rounded-2xl border"
        style={{ color: tool.color, borderColor: tool.color + '55', background: tool.color + '18', boxShadow: `0 0 40px ${tool.color}40` }}
      >
        <Icon size={24} />
      </span>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.25em]" style={{ color: cat.color }}>{cat.label}</p>
      <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">{tool.name}</h2>
      <p className="mt-1 text-sm text-fg/80">{tool.tagline}</p>
      <p className="mt-4 text-sm leading-relaxed text-muted">{tool.description}</p>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {[
          { icon: Activity, label: 'Uses', value: formatNumber(tool.usage) },
          { icon: Zap, label: 'Latency', value: tool.latency },
          { icon: Star, label: 'Rating', value: tool.rating },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line/10 bg-line/[0.03] p-3">
            <s.icon size={14} className="text-muted" />
            <p className="mt-2 font-display text-lg font-medium">{s.value}</p>
            <p className="text-[11px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {tool.tags.map((t) => <span key={t} className="chip">{t}</span>)}
      </div>

      {related.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Related</p>
          <div className="space-y-1.5">
            {related.map((r) => (
              <button key={r.id} onClick={() => onSelect(r.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-line/5">
                <r.icon size={15} style={{ color: r.color }} />
                <span className="flex-1">{r.name}</span>
                <ArrowUpRight size={14} className="text-muted" />
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={onOpen} className="btn-primary mt-auto w-full !rounded-xl">
        Open in Workspace <ArrowUpRight size={16} />
      </button>
    </motion.aside>
  )
}

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { accent, motionReduced, isLight, prefs, setPref } = usePrefs()
  const [selectedId, setSelectedId] = useState(() => (toolById(params.get('tool')) ? params.get('tool') : null))
  const [hoveredId, setHoveredId] = useState(null)
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('3d')
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    if (pathname !== '/explore') return
    const t = params.get('tool')
    if (t && toolById(t)) setSelectedId(t)
  }, [params, pathname])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') select(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const select = (id) => {
    setSelectedId(id)
    setParams(id ? { tool: id } : {}, { replace: true })
  }

  const visibleIds = useMemo(() => {
    const q = query.toLowerCase().trim()
    return new Set(
      TOOLS.filter(
        (t) =>
          (category === 'all' || t.category === category) &&
          (!q || `${t.name} ${t.tagline} ${t.tags.join(' ')}`.toLowerCase().includes(q)),
      ).map((t) => t.id),
    )
  }, [category, query])

  const selected = selectedId ? toolById(selectedId) : null
  const hovered = hoveredId ? toolById(hoveredId) : null
  const openTool = () => selected && navigate(`/workspace?tool=${selected.id}`)

  return (
    <div className="relative h-[calc(100svh-4rem)] overflow-hidden">
      {view === '3d' ? (
        <div className="absolute inset-0">
          <Suspense fallback={<div className="grid h-full place-items-center"><span className="eyebrow animate-pulse">Rendering universe</span></div>}>
            <UniverseScene
              tools={TOOLS}
              selectedId={selectedId}
              hoveredId={hoveredId}
              visibleIds={visibleIds}
              onSelect={select}
              onHover={setHoveredId}
              accent={accent}
              motionReduced={motionReduced}
              isLight={isLight}
              quality={prefs.quality}
            />
          </Suspense>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-y-auto px-4 pb-10 pt-52 sm:px-6 md:pt-44">
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.filter((t) => visibleIds.has(t.id)).map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onMouseMove={trackSpotlight}
                onClick={() => select(t.id)}
                className="glass spotlight group rounded-2xl p-5 text-left transition hover:-translate-y-1"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ color: t.color, background: t.color + '1a' }}>
                  <t.icon size={20} />
                </span>
                <p className="mt-4 font-display text-lg font-medium">{t.name}</p>
                <p className="text-xs text-muted">{t.tagline}</p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-widest" style={{ color: t.color }}>{categoryById[t.category].label}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Top-left controls */}
      <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex flex-col gap-3 sm:inset-x-6 md:flex-row md:items-start md:justify-between">
        <div className="pointer-events-auto glass max-w-md rounded-2xl p-4">
          <p className="eyebrow">AI Universe</p>
          <h1 className="mt-1 font-display text-xl font-semibold">Explore {visibleIds.size} intelligent tools</h1>
          <div className="relative mt-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools, tags…" className="input !py-2 !pl-9 text-xs" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button onClick={() => setCategory('all')} className={cn('chip', category === 'all' && 'chip-active')}>All</button>
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setCategory(c.id)} className={cn('chip', category === c.id && 'chip-active')}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pointer-events-auto relative flex items-center gap-2 self-end md:self-start">
          <div className="glass flex rounded-full p-1">
            <button onClick={() => setView('3d')} className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition', view === '3d' ? 'bg-accent/15 text-accent' : 'text-muted')}>
              <Box size={14} /> 3D
            </button>
            <button onClick={() => setView('grid')} className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition', view === 'grid' ? 'bg-accent/15 text-accent' : 'text-muted')}>
              <LayoutGrid size={14} /> Grid
            </button>
          </div>
          <button onClick={() => setSettingsOpen((o) => !o)} className="glass btn-icon !rounded-full" aria-label="Scene settings" aria-expanded={settingsOpen}>
            <SlidersHorizontal size={16} />
          </button>

          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                className="glass-strong absolute right-0 top-12 z-30 w-64 rounded-2xl p-4"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Accent</p>
                <div className="mt-2 flex gap-2">
                  {Object.entries(ACCENTS).map(([key, a]) => (
                    <button
                      key={key}
                      onClick={() => setPref('accent', key)}
                      aria-label={a.label}
                      title={a.label}
                      className={cn('h-7 w-7 rounded-full border-2 transition', prefs.accent === key ? 'scale-110 border-fg' : 'border-transparent')}
                      style={{ background: `linear-gradient(135deg, ${a.hex}, ${a.hex2})` }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span>Reduced motion</span>
                  <Toggle checked={prefs.reducedMotion} onChange={(v) => setPref('reducedMotion', v)} label="Reduced motion" />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span>Light theme</span>
                  <Toggle checked={isLight} onChange={(v) => setPref('theme', v ? 'light' : 'dark')} label="Light theme" />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span>High quality 3D</span>
                  <Toggle checked={prefs.quality === 'high'} onChange={(v) => setPref('quality', v ? 'high' : 'low')} label="High quality 3D" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hover preview */}
      <AnimatePresence>
        {view === '3d' && hovered && !selected && (
          <motion.div
            key={hovered.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-strong pointer-events-none absolute bottom-16 left-1/2 z-10 w-[min(90%,22rem)] -translate-x-1/2 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <hovered.icon size={18} style={{ color: hovered.color }} />
              <p className="font-display font-medium">{hovered.name}</p>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-widest" style={{ color: hovered.color }}>
                {categoryById[hovered.category].label}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">{hovered.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {view === '3d' && !selected && (
        <p className="pointer-events-none absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap text-[11px] text-muted">
          <MousePointer2 size={12} /> Drag to orbit · Scroll to zoom · Click a node
        </p>
      )}

      <AnimatePresence>
        {selected && <ToolPanel tool={selected} onClose={() => select(null)} onOpen={openTool} onSelect={select} />}
      </AnimatePresence>
    </div>
  )
}
