import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Activity, MessageSquare, Gauge, TrendingUp, TrendingDown, Search, PenSquare, Eye, Save, RotateCcw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import AnimatedNumber from '../components/AnimatedNumber'
import AreaChart from '../components/charts/AreaChart'
import BarList from '../components/charts/BarList'
import Donut from '../components/charts/Donut'
import { usePersistentState } from '../hooks/usePersistentState'
import { usePrefs, DEFAULT_CONTENT } from '../context/PreferencesContext'
import { useUI } from '../context/UIContext'
import { ACTIVE_USERS_30D, STATS, DEVICE_SPLIT, DEMO_USERS } from '../data/admin'
import { TOOLS } from '../data/tools'
import { cn, trackSpotlight } from '../lib/utils'

const STAT_ICONS = { users: Users, active: Activity, prompts: MessageSquare, latency: Gauge }
const STATUS = {
  Active: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25',
  Invited: 'bg-amber-400/10 text-amber-400 border-amber-400/25',
  Suspended: 'bg-rose-400/10 text-rose-400 border-rose-400/25',
}

export default function Admin() {
  const { content, setContent } = usePrefs()
  const { toast } = useUI()
  const [users, setUsers] = usePersistentState('admin-users', DEMO_USERS)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState(content)

  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase()
    return users.filter((u) => `${u.name} ${u.email} ${u.plan}`.toLowerCase().includes(q))
  }, [users, query])

  const toolUsage = [...TOOLS].sort((a, b) => b.usage - a.usage).slice(0, 7).map((t) => ({ label: t.name, value: t.usage, color: t.color, icon: t.icon }))

  const toggleStatus = (id) =>
    setUsers((all) => all.map((u) => (u.id === id ? { ...u, status: u.status === 'Suspended' ? 'Active' : 'Suspended' } : u)))

  const saveContent = (e) => {
    e.preventDefault()
    setContent(draft)
    toast('Homepage content published')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Admin Dashboard"
        title="Command center."
        description="Live overview of users, activity and tool usage — plus homepage content management."
        actions={<span className="chip"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> All systems operational</span>}
      />

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s, i) => {
          const Icon = STAT_ICONS[s.id]
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onMouseMove={trackSpotlight}
              className="glass spotlight rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent"><Icon size={17} /></span>
                <span className={cn('flex items-center gap-1 text-xs font-medium', s.up ? 'text-emerald-400' : 'text-rose-400')}>
                  {s.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {s.delta}
                </span>
              </div>
              <p className="mt-5 font-display text-3xl font-semibold tracking-tight"><AnimatedNumber value={s.value} /></p>
              <p className="mt-1 text-xs text-muted">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="glass rounded-2xl p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display font-medium">Active users</p>
              <p className="text-xs text-muted">Last 30 days · hover for details</p>
            </div>
            <span className="font-mono text-xs text-accent">+12.4%</span>
          </div>
          <AreaChart data={ACTIVE_USERS_30D} />
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="font-display font-medium">Traffic by device</p>
          <p className="mb-6 text-xs text-muted">Share of sessions</p>
          <Donut segments={DEVICE_SPLIT} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <p className="font-display font-medium">Tool usage</p>
          <p className="mb-5 text-xs text-muted">Total sessions per tool</p>
          <BarList items={toolUsage} />
        </div>

        {/* Users */}
        <div className="glass rounded-2xl p-5 xl:col-span-2">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="font-display font-medium">Users</p>
              <p className="text-xs text-muted">{users.filter((u) => u.status === 'Active').length} active of {users.length}</p>
            </div>
            <div className="relative sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users" className="input !py-2 !pl-9 text-xs" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 text-[11px] uppercase tracking-wider text-muted">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Last active</th>
                  <th className="pb-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-line/[0.06] last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-line/10 text-xs font-semibold">
                          {u.name.split(' ').map((p) => p[0]).join('')}
                        </span>
                        <span>
                          <span className="block font-medium">{u.name}</span>
                          <span className="block text-xs text-muted">{u.email}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-muted">{u.plan}</td>
                    <td className="py-3"><span className={cn('rounded-full border px-2 py-0.5 text-[11px]', STATUS[u.status])}>{u.status}</span></td>
                    <td className="py-3 text-muted">{u.lastActive}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => toggleStatus(u.id)} className="text-xs font-medium text-accent hover:underline">
                        {u.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && <p className="py-8 text-center text-sm text-muted">No users match “{query}”.</p>}
          </div>
        </div>
      </div>

      {/* Content management */}
      <form onSubmit={saveContent} className="glass mt-4 rounded-2xl p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent"><PenSquare size={17} /></span>
            <div>
              <p className="font-display font-medium">Homepage content</p>
              <p className="text-xs text-muted">Edit the hero text — changes go live on the landing page instantly.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDraft(DEFAULT_CONTENT)} className="btn-ghost !px-4 !py-2"><RotateCcw size={14} /> Defaults</button>
            <Link to="/" className="btn-ghost !px-4 !py-2"><Eye size={14} /> Preview</Link>
            <button type="submit" className="btn-primary !px-4 !py-2"><Save size={14} /> Publish</button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs text-muted">Eyebrow
            <input className="input mt-1" value={draft.eyebrow} onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })} />
          </label>
          <label className="text-xs text-muted">Sub-headline
            <input className="input mt-1" value={draft.subtext} onChange={(e) => setDraft({ ...draft, subtext: e.target.value })} />
          </label>
          <label className="text-xs text-muted">Headline — line 1
            <input className="input mt-1" value={draft.headline1} onChange={(e) => setDraft({ ...draft, headline1: e.target.value })} />
          </label>
          <label className="text-xs text-muted">Headline — line 2 (gradient)
            <input className="input mt-1" value={draft.headline2} onChange={(e) => setDraft({ ...draft, headline2: e.target.value })} />
          </label>
        </div>
        <div className="mt-5 rounded-xl border border-dashed border-line/15 p-6 text-center">
          <p className="eyebrow">{draft.eyebrow}</p>
          <p className="mt-2 font-display text-2xl font-semibold leading-tight md:text-3xl">
            {draft.headline1} <span className="text-gradient">{draft.headline2}</span>
          </p>
          <p className="mt-2 text-sm text-muted">{draft.subtext}</p>
        </div>
      </form>
    </div>
  )
}
