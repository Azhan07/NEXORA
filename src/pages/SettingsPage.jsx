import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Palette, Accessibility, Keyboard, Database, Save, Moon, Sun, Check, RotateCcw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Toggle from '../components/Toggle'
import { usePrefs, ACCENTS } from '../context/PreferencesContext'
import { useUI } from '../context/UIContext'
import { storage } from '../lib/storage'
import { cn } from '../lib/utils'

function Section({ icon: Icon, title, description, children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-2xl p-6"
    >
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent"><Icon size={17} /></span>
        <div>
          <h2 className="font-display font-medium">{title}</h2>
          {description && <p className="text-xs text-muted">{description}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  )
}

function Row({ title, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line/[0.07] py-4 first:border-t-0 first:pt-0">
      <div>
        <p className="text-sm">{title}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

const SHORTCUTS = [
  ['Open command palette', ['Ctrl', 'K']],
  ['Collapse sidebar', ['Ctrl', 'B']],
  ['Go to Home … Admin', ['Alt', '1–6']],
  ['Send message', ['Enter']],
  ['New line in message', ['Shift', 'Enter']],
  ['Close panel / dialog', ['Esc']],
]

export default function SettingsPage() {
  const { prefs, setPref, isLight, profile, setProfile, systemReduced } = usePrefs()
  const { toast } = useUI()
  const [draft, setDraft] = useState(profile)
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile)
  const initials = draft.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '?'

  const saveProfile = (e) => {
    e.preventDefault()
    if (!draft.name.trim()) return toast('Name cannot be empty', 'error')
    setProfile(draft)
    toast('Profile saved')
  }

  const resetAll = () => {
    if (!window.confirm('Reset all NEXORA data stored in this browser? Chats, favorites and preferences will be cleared.')) return
    storage.clearAll()
    window.location.reload()
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageHeader eyebrow="Profile & Settings" title="Make it yours." description="Everything here is saved in your browser and applied instantly across the app." />

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Section icon={User} title="Profile" description="How you appear across NEXORA">
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent2 font-display text-xl font-bold text-bg shadow-[0_0_40px_rgb(var(--accent)/0.4)]">
                {initials}
              </span>
              <div className="text-sm">
                <p className="font-medium">{draft.name || 'Your name'}</p>
                <p className="text-xs text-muted">{draft.role}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-muted">Name
                <input className="input mt-1" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </label>
              <label className="text-xs text-muted">Role
                <input className="input mt-1" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
              </label>
            </div>
            <label className="block text-xs text-muted">Email
              <input type="email" className="input mt-1" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </label>
            <label className="block text-xs text-muted">Bio
              <textarea rows={3} className="input mt-1 resize-none" value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={!dirty} className="btn-primary !py-2.5"><Save size={15} /> Save profile</button>
              {dirty && <button type="button" onClick={() => setDraft(profile)} className="btn-ghost !py-2.5">Cancel</button>}
            </div>
          </form>
        </Section>

        <div className="flex flex-col gap-5">
          <Section icon={Palette} title="Appearance" description="Theme and accent colour" delay={0.05}>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'light', label: 'Light', icon: Sun },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPref('theme', t.id)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border py-3 text-sm transition',
                    prefs.theme === t.id ? 'border-accent/50 bg-accent/10 text-accent' : 'border-line/10 text-muted hover:text-fg',
                  )}
                >
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>
            <p className="mb-2 mt-5 text-xs text-muted">Accent palette</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(ACCENTS).map(([key, a]) => (
                <button key={key} onClick={() => setPref('accent', key)} className="flex flex-col items-center gap-1.5" aria-label={`${a.label} accent`}>
                  <span
                    className={cn('grid h-11 w-11 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-bg transition', prefs.accent === key ? 'ring-fg' : 'ring-transparent')}
                    style={{ background: `linear-gradient(135deg, ${a.hex}, ${a.hex2})` }}
                  >
                    {prefs.accent === key && <Check size={16} className="text-black/70" />}
                  </span>
                  <span className="text-[11px] text-muted">{a.label}</span>
                </button>
              ))}
            </div>
            {!isLight && <p className="mt-4 text-[11px] text-muted">Dark mode is the signature NEXORA look.</p>}
          </Section>

          <Section icon={Accessibility} title="Accessibility & motion" description="Comfort and performance" delay={0.1}>
            <Row title="Reduce motion" hint={systemReduced ? 'Your system already requests reduced motion' : 'Stops 3D auto-rotation, parallax and scroll effects'}>
              <Toggle checked={prefs.reducedMotion || systemReduced} disabled={systemReduced} onChange={(v) => setPref('reducedMotion', v)} label="Reduce motion" />
            </Row>
            <Row title="High quality 3D" hint="Turn off on slower devices for fewer particles and lower resolution">
              <Toggle checked={prefs.quality === 'high'} onChange={(v) => setPref('quality', v ? 'high' : 'low')} label="High quality 3D" />
            </Row>
          </Section>
        </div>

        <Section icon={Keyboard} title="Keyboard shortcuts" delay={0.15}>
          <ul className="space-y-3">
            {SHORTCUTS.map(([label, keys]) => (
              <li key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted">{label}</span>
                <span className="flex gap-1">{keys.map((k) => <span key={k} className="kbd">{k}</span>)}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={Database} title="Data" description="Stored locally in your browser (localStorage)" delay={0.2}>
          <p className="text-sm text-muted">
            NEXORA is a frontend-first demo: chats, favorites, preferences and admin content edits never leave this device.
          </p>
          <button onClick={resetAll} className="btn-ghost mt-5 !border-rose-400/30 !py-2.5 text-rose-400 hover:!bg-rose-400/10">
            <RotateCcw size={15} /> Reset all local data
          </button>
        </Section>
      </div>
    </div>
  )
}
