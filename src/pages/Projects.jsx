import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Star, Plus, LayoutGrid, List, Clock, ArrowUpRight, MessageSquare } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { usePersistentState } from '../hooks/usePersistentState'
import { useUI } from '../context/UIContext'
import { DEMO_PROJECTS, DEFAULT_FAVORITES } from '../data/projects'
import { CATEGORIES, toolById, categoryById } from '../data/tools'
import { storage } from '../lib/storage'
import { cn, timeAgo, trackSpotlight } from '../lib/utils'

const STATUS_STYLES = {
  Active: 'text-accent bg-accent/10 border-accent/25',
  Completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
  Draft: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
  Chat: 'text-sky-400 bg-sky-400/10 border-sky-400/25',
}

export default function Projects() {
  const navigate = useNavigate()
  const { toast } = useUI()
  const [favorites, setFavorites] = usePersistentState('favorites', DEFAULT_FAVORITES)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('recent')
  const [layout, setLayout] = useState('grid')

  // Chat sessions from the Workspace become projects too.
  const projects = useMemo(() => {
    const sessions = storage.get('sessions', [])
    const chats = sessions
      .filter((s) => s.messages?.length > 0)
      .map((s) => ({
        id: 'chat-' + s.id,
        sessionId: s.id,
        title: s.title,
        description: `${s.messages.length} messages · ${s.messages[s.messages.length - 1].content.slice(0, 70)}…`,
        toolId: s.toolId,
        status: 'Chat',
        progress: null,
        updatedAt: s.updatedAt,
      }))
    return [...chats, ...DEMO_PROJECTS]
  }, [])

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim()
    let list = projects.filter((p) => {
      const tool = toolById(p.toolId)
      if (filter === 'favorites' && !favorites.includes(p.id)) return false
      if (filter !== 'all' && filter !== 'favorites' && tool?.category !== filter) return false
      return !q || `${p.title} ${p.description} ${tool?.name}`.toLowerCase().includes(q)
    })
    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.title.localeCompare(b.title)
      if (sort === 'favorites') return (favorites.includes(b.id) - favorites.includes(a.id)) || b.updatedAt - a.updatedAt
      return b.updatedAt - a.updatedAt
    })
    return list
  }, [projects, query, filter, sort, favorites])

  const toggleFav = (id) => {
    const on = !favorites.includes(id)
    setFavorites((f) => (on ? [...f, id] : f.filter((x) => x !== id)))
    toast(on ? 'Added to favorites' : 'Removed from favorites', 'info')
  }

  const open = (p) => navigate(p.sessionId ? `/workspace?session=${p.sessionId}` : `/workspace?tool=${p.toolId}`)

  const activity = [...projects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 7)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Projects & History"
        title="Your work, in orbit."
        description="Saved projects and chat sessions in one place. Search, filter, favorite and jump back in."
        actions={
          <button onClick={() => navigate('/workspace?new=1')} className="btn-primary !py-2.5">
            <Plus size={16} /> New project
          </button>
        }
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_300px]">
        <div>
          <div className="glass flex flex-col gap-3 rounded-2xl p-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects…" className="input !pl-9" aria-label="Search projects" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input cursor-pointer md:!w-44" aria-label="Sort">
              <option value="recent">Most recent</option>
              <option value="name">Name A–Z</option>
              <option value="favorites">Favorites first</option>
            </select>
            <div className="flex rounded-xl border border-line/10 p-1">
              <button onClick={() => setLayout('grid')} className={cn('rounded-lg p-2', layout === 'grid' ? 'bg-accent/15 text-accent' : 'text-muted')} aria-label="Grid view"><LayoutGrid size={16} /></button>
              <button onClick={() => setLayout('list')} className={cn('rounded-lg p-2', layout === 'list' ? 'bg-accent/15 text-accent' : 'text-muted')} aria-label="List view"><List size={16} /></button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setFilter('all')} className={cn('chip', filter === 'all' && 'chip-active')}>All · {projects.length}</button>
            <button onClick={() => setFilter('favorites')} className={cn('chip', filter === 'favorites' && 'chip-active')}>
              <Star size={12} /> Favorites · {favorites.length}
            </button>
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setFilter(c.id)} className={cn('chip', filter === c.id && 'chip-active')}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} /> {c.label}
              </button>
            ))}
          </div>

          <motion.div layout className={cn('mt-6 grid gap-4', layout === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            <AnimatePresence mode="popLayout">
              {visible.map((p) => {
                const tool = toolById(p.toolId)
                const Icon = p.sessionId ? MessageSquare : tool?.icon
                const fav = favorites.includes(p.id)
                return (
                  <motion.article
                    layout
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    onMouseMove={trackSpotlight}
                    className={cn('glass spotlight group rounded-2xl p-5', layout === 'list' && 'flex items-center gap-5')}
                  >
                    <div className={cn('flex items-start justify-between', layout === 'list' && 'shrink-0')}>
                      <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ color: tool?.color, background: (tool?.color ?? '#22d3ee') + '1a' }}>
                        {Icon && <Icon size={18} />}
                      </span>
                      {layout === 'grid' && (
                        <button onClick={() => toggleFav(p.id)} className="rounded-lg p-1.5 transition hover:bg-line/5" aria-label={fav ? 'Unfavorite' : 'Favorite'}>
                          <Star size={16} className={fav ? 'fill-amber-400 text-amber-400' : 'text-muted'} />
                        </button>
                      )}
                    </div>
                    <div className={cn(layout === 'grid' ? 'mt-4' : 'min-w-0 flex-1')}>
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-display font-medium">{p.title}</h3>
                        <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium', STATUS_STYLES[p.status])}>{p.status}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted">{p.description}</p>
                      {p.progress !== null && (
                        <div className="mt-4 h-1 overflow-hidden rounded-full bg-line/10">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-accent to-accent2"
                            initial={{ width: 0 }}
                            animate={{ width: `${p.progress}%` }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                      )}
                    </div>
                    <div className={cn('flex items-center justify-between text-[11px] text-muted', layout === 'grid' ? 'mt-4' : 'shrink-0 gap-3')}>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {timeAgo(p.updatedAt)} · {tool?.name}</span>
                      {layout === 'list' && (
                        <button onClick={() => toggleFav(p.id)} className="rounded-lg p-1.5" aria-label={fav ? 'Unfavorite' : 'Favorite'}>
                          <Star size={15} className={fav ? 'fill-amber-400 text-amber-400' : 'text-muted'} />
                        </button>
                      )}
                      <button onClick={() => open(p)} className="flex items-center gap-1 font-medium text-accent opacity-80 transition hover:opacity-100">
                        Open <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </motion.article>
                )
              })}
            </AnimatePresence>
          </motion.div>

          {visible.length === 0 && (
            <div className="glass mt-6 rounded-2xl px-6 py-16 text-center">
              <p className="font-display text-lg">Nothing here yet</p>
              <p className="mt-1 text-sm text-muted">Try a different search or filter.</p>
            </div>
          )}
        </div>

        <aside className="glass h-fit rounded-2xl p-5 xl:sticky xl:top-24">
          <p className="font-display font-medium">Recent activity</p>
          <ol className="relative mt-5 space-y-5 border-l border-line/10 pl-5">
            {activity.map((p) => {
              const tool = toolById(p.toolId)
              return (
                <li key={p.id} className="relative">
                  <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-bg" style={{ background: tool?.color }} />
                  <p className="text-sm">
                    <span className="text-muted">{p.sessionId ? 'Chatted in' : p.status === 'Completed' ? 'Completed' : 'Updated'}</span>{' '}
                    <button onClick={() => open(p)} className="font-medium hover:text-accent">{p.title}</button>
                  </p>
                  <p className="text-[11px] text-muted">{timeAgo(p.updatedAt)} · {categoryById[tool?.category]?.label}</p>
                </li>
              )
            })}
          </ol>
        </aside>
      </div>
    </div>
  )
}
