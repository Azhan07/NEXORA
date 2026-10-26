import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus, Trash2, Copy, Check, RotateCcw, Mic, MicOff, ArrowUp, Square, History, X, Search, BookOpen, Sparkles,
} from 'lucide-react'
import MessageContent from '../components/MessageContent'
import Waveform from '../components/Waveform'
import { usePersistentState } from '../hooks/usePersistentState'
import { useAudioAnalyser } from '../hooks/useAudioAnalyser'
import { usePrefs } from '../context/PreferencesContext'
import { useUI } from '../context/UIContext'
import { TOOLS, toolById } from '../data/tools'
import { PROMPT_LIBRARY, PROMPT_CATEGORIES, SUGGESTIONS } from '../data/prompts'
import { getAIResponse } from '../lib/fakeAI'
import { cn, timeAgo, truncate, uid, wait } from '../lib/utils'

const AudioOrbScene = lazy(() => import('../three/AudioOrbScene'))

const newSession = (toolId = 'nova-chat') => ({
  id: uid(), title: 'New chat', toolId, messages: [], createdAt: Date.now(), updatedAt: Date.now(),
})

function greeting() {
  const h = new Date().getHours()
  return h < 5 ? 'Working late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-accent"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

function SessionList({ sessions, activeId, onSelect, onDelete, onNew, query, setQuery }) {
  const filtered = sessions
    .filter((s) => s.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <button onClick={onNew} className="btn-primary w-full !rounded-xl !py-2.5">
          <Plus size={16} /> New chat
        </button>
        <div className="relative mt-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chats" className="input !py-2 !pl-9 text-xs" />
        </div>
      </div>
      <p className="px-4 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Recent sessions</p>
      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {filtered.map((s) => {
          const tool = toolById(s.toolId)
          const Icon = tool?.icon ?? Sparkles
          return (
            <div
              key={s.id}
              className={cn(
                'group flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition',
                s.id === activeId ? 'bg-accent/10 text-fg' : 'text-muted hover:bg-line/5 hover:text-fg',
              )}
            >
              <button onClick={() => onSelect(s.id)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                <Icon size={15} style={{ color: tool?.color }} className="shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{s.title}</span>
                  <span className="block text-[11px] text-muted">{timeAgo(s.updatedAt)} · {s.messages.length} msgs</span>
                </span>
              </button>
              <button
                onClick={() => onDelete(s.id)}
                className="rounded-md p-1 text-muted opacity-0 transition hover:text-rose-400 group-hover:opacity-100 focus:opacity-100"
                aria-label={`Delete ${s.title}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
        {filtered.length === 0 && <p className="px-3 py-6 text-center text-xs text-muted">No chats found.</p>}
      </div>
    </div>
  )
}

export default function Workspace() {
  const { accent, motionReduced, isLight, profile } = usePrefs()
  const { toast } = useUI()
  const [params, setParams] = useSearchParams()
  const { pathname } = useLocation()

  const [sessions, setSessions] = usePersistentState('sessions', () => [newSession()])
  const [activeId, setActiveId] = usePersistentState('active-session', null)
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState('idle') // idle | thinking | streaming
  const [reveal, setReveal] = useState(null) // { msgId, count, total, done }
  const [copiedId, setCopiedId] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sessionQuery, setSessionQuery] = useState('')
  const [promptCat, setPromptCat] = useState('All')

  const mic = useAudioAnalyser()
  const recRef = useRef(null)
  const runRef = useRef(0)
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)
  const orbLevel = useRef(0)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const active = sessions.find((s) => s.id === activeId) ?? sessions[0]
  const activeTool = toolById(active?.toolId) ?? TOOLS[0]

  const updateSession = useCallback(
    (id, fn) => setSessions((all) => all.map((s) => (s.id === id ? fn(s) : s))),
    [setSessions],
  )

  const haltResponse = () => {
    runRef.current++
    setReveal(null)
    setPhase('idle')
  }

  const createChat = useCallback(
    (toolId = 'nova-chat') => {
      const s = newSession(toolId)
      setSessions((all) => [s, ...all])
      setActiveId(s.id)
      runRef.current++
      setReveal(null)
      setPhase('idle')
      return s
    },
    [setSessions, setActiveId],
  )

  // Always keep at least one session.
  useEffect(() => {
    if (sessions.length === 0) createChat()
  }, [sessions.length, createChat])

  // URL params: ?new=1, ?tool=<id>, ?session=<id>
  useEffect(() => {
    // While this page animates out, the router already shows the next URL —
    // ignore params that belong to another page.
    if (pathname !== '/workspace') return
    const isNew = params.get('new')
    const tool = params.get('tool')
    const session = params.get('session')
    if (!isNew && !tool && !session) return
    if (session && sessions.some((s) => s.id === session)) {
      setActiveId(session)
    } else if (isNew || tool) {
      const toolId = toolById(tool) ? tool : 'nova-chat'
      if (active && active.messages.length === 0) updateSession(active.id, (s) => ({ ...s, toolId }))
      else createChat(toolId)
      if (tool && toolById(tool)) toast(`${toolById(tool).name} is ready`, 'info')
    }
    setParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  // Streaming reveal
  useEffect(() => {
    if (!reveal || reveal.done) return
    const id = setInterval(() => {
      setReveal((r) => {
        if (!r) return r
        const next = r.count + 3 + Math.floor(Math.random() * 4)
        return next >= r.total ? { ...r, count: r.total, done: true } : { ...r, count: next }
      })
    }, 22)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reveal?.msgId, reveal?.done])

  useEffect(() => {
    if (reveal?.done) {
      setReveal(null)
      setPhase('idle')
    }
  }, [reveal?.done])

  // Orb level = mic level, or a synthetic "speaking" pulse while streaming.
  useEffect(() => {
    let raf = 0
    const loop = (t) => {
      if (mic.active) orbLevel.current = mic.levelRef.current
      else if (phaseRef.current === 'streaming') orbLevel.current = 0.3 + Math.abs(Math.sin(t / 140)) * 0.35
      else if (phaseRef.current === 'thinking') orbLevel.current = 0.15 + Math.sin(t / 300) * 0.08
      else orbLevel.current = 0
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [mic.active, mic.levelRef])

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reveal ? 'auto' : 'smooth' })
  }, [active?.messages.length, reveal?.count, phase, active?.id])

  // Autosize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px'
  }, [input])

  const stopVoice = () => {
    recRef.current?.stop?.()
    recRef.current = null
    mic.stop()
  }

  const respond = async (sessionId, prompt, toolId) => {
    const token = ++runRef.current
    setPhase('thinking')
    const reply = await getAIResponse({ prompt, tool: toolById(toolId) })
    await wait(motionReduced ? 120 : 650 + Math.random() * 500)
    if (token !== runRef.current) return
    const msg = { id: uid(), role: 'assistant', content: reply, createdAt: Date.now() }
    updateSession(sessionId, (s) => ({ ...s, messages: [...s.messages, msg], updatedAt: Date.now() }))
    if (motionReduced) {
      setPhase('idle')
      return
    }
    setPhase('streaming')
    setReveal({ msgId: msg.id, count: 0, total: reply.length, done: false })
  }

  const send = (text = input) => {
    const prompt = text.trim()
    if (!prompt || phase !== 'idle' || !active) return
    if (mic.active) stopVoice()
    const userMsg = { id: uid(), role: 'user', content: prompt, createdAt: Date.now() }
    updateSession(active.id, (s) => ({
      ...s,
      title: s.messages.length === 0 ? truncate(prompt, 42) : s.title,
      messages: [...s.messages, userMsg],
      updatedAt: Date.now(),
    }))
    setInput('')
    setDrawerOpen(false)
    respond(active.id, prompt, active.toolId)
  }

  const stop = () => {
    if (phase === 'streaming' && reveal) {
      const { msgId, count } = reveal
      updateSession(active.id, (s) => ({
        ...s,
        messages: s.messages.map((m) => (m.id === msgId ? { ...m, content: m.content.slice(0, count) + ' …' } : m)),
      }))
    }
    haltResponse()
  }

  const regenerate = () => {
    if (!active || phase !== 'idle') return
    const msgs = active.messages
    const lastAssistant = msgs.length - 1
    if (msgs[lastAssistant]?.role !== 'assistant') return
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    updateSession(active.id, (s) => ({ ...s, messages: s.messages.slice(0, -1) }))
    respond(active.id, lastUser.content, active.toolId)
  }

  const copy = async (m) => {
    try {
      await navigator.clipboard.writeText(m.content)
      setCopiedId(m.id)
      toast('Response copied')
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      toast('Copy failed', 'error')
    }
  }

  const deleteSession = (id) => {
    if (id === active?.id) haltResponse()
    setSessions((all) => {
      const rest = all.filter((s) => s.id !== id)
      if (id === activeId) setActiveId(rest[0]?.id ?? null)
      return rest
    })
    toast('Chat deleted', 'info')
  }

  const selectSession = (id) => {
    if (phase !== 'idle') haltResponse()
    setActiveId(id)
    setDrawerOpen(false)
  }

  const toggleVoice = async () => {
    if (mic.active) {
      stopVoice()
      return
    }
    const ok = await mic.start()
    if (!ok) {
      toast('Microphone unavailable in this browser', 'error')
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) {
      try {
        const rec = new SR()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = 'en-US'
        const base = input ? input + ' ' : ''
        rec.onresult = (e) => {
          let txt = ''
          for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript
          setInput(base + txt)
        }
        rec.onerror = () => {}
        rec.start()
        recRef.current = rec
      } catch {
        /* dictation unsupported — visualizer still works */
      }
    }
    toast(SR ? 'Listening… speak to dictate' : 'Listening — the orb reacts to your voice', 'info')
  }

  const libraryItems = useMemo(
    () => PROMPT_LIBRARY.filter((p) => promptCat === 'All' || p.category === promptCat),
    [promptCat],
  )

  const status = mic.active ? 'Listening' : phase === 'thinking' ? 'Thinking' : phase === 'streaming' ? 'Speaking' : 'Idle'
  const messages = active?.messages ?? []
  const lastMsg = messages[messages.length - 1]
  const firstName = profile.name.split(' ')[0]

  return (
    <div className="relative flex h-[calc(100svh-4rem)]">
      {/* Sessions — desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-line/[0.07] bg-surface/20 lg:block">
        <SessionList
          sessions={sessions} activeId={active?.id} onSelect={selectSession} onDelete={deleteSession}
          onNew={() => createChat()} query={sessionQuery} setQuery={setSessionQuery}
        />
      </aside>

      {/* Sessions — mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div className="absolute inset-0 z-30 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <motion.div
              className="glass-strong absolute inset-y-0 left-0 w-72"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            >
              <button className="btn-icon absolute right-2 top-2 z-10" onClick={() => setDrawerOpen(false)} aria-label="Close"><X size={16} /></button>
              <div className="h-full pt-8">
                <SessionList
                  sessions={sessions} activeId={active?.id} onSelect={selectSession} onDelete={deleteSession}
                  onNew={() => { createChat(); setDrawerOpen(false) }} query={sessionQuery} setQuery={setSessionQuery}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat */}
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-line/[0.07] px-4 py-3 sm:px-6">
          <button className="btn-icon lg:hidden" onClick={() => setDrawerOpen(true)} aria-label="Chat history"><History size={18} /></button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-medium">{active?.title}</p>
            <p className="text-[11px] text-muted">{messages.length} messages · demo mode</p>
          </div>
          <label className="sr-only" htmlFor="tool-select">Active tool</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full" style={{ background: activeTool.color }} />
            <select
              id="tool-select"
              value={activeTool.id}
              onChange={(e) => active && updateSession(active.id, (s) => ({ ...s, toolId: e.target.value }))}
              className="input !w-auto cursor-pointer !rounded-full !py-2 !pl-7 !pr-8 text-xs"
            >
              {TOOLS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button onClick={() => createChat(activeTool.id)} className="btn-icon" aria-label="New chat" title="New chat"><Plus size={18} /></button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.length === 0 && phase === 'idle' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pt-[6vh] text-center">
                <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-accent shadow-[0_0_40px_rgb(var(--accent)/0.35)]">
                  <activeTool.icon size={24} />
                </div>
                <h2 className="font-display text-3xl font-semibold tracking-tight">{greeting()}, {firstName}.</h2>
                <p className="mt-2 text-sm text-muted">{activeTool.name} is ready. Ask anything, or start with a suggestion.</p>
                <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      onClick={() => send(s.prompt)}
                      className="glass group flex items-start gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-accent/30"
                    >
                      <s.icon size={18} className="mt-0.5 text-accent" />
                      <span>
                        <span className="block text-sm font-medium">{s.title}</span>
                        <span className="block text-xs text-muted">{s.subtitle}</span>
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((m) => {
              const isReveal = reveal && reveal.msgId === m.id
              const text = isReveal ? m.content.slice(0, reveal.count) : m.content
              if (m.role === 'user') {
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md border border-accent/20 bg-accent/10 px-4 py-3 text-[14.5px]">
                      {m.content}
                    </div>
                  </motion.div>
                )
              }
              const isLast = m.id === lastMsg?.id
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="group flex gap-3">
                  <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent2 shadow-[0_0_16px_rgb(var(--accent)/0.5)]">
                    <span className="h-2 w-2 rounded-full bg-bg" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <MessageContent text={text} streaming={!!isReveal} />
                    {!isReveal && (
                      <div className={cn('mt-1 flex items-center gap-1 transition', isLast ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
                        <button onClick={() => copy(m)} className="btn-icon !h-8 !w-8" aria-label="Copy response" title="Copy">
                          {copiedId === m.id ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
                        </button>
                        {isLast && phase === 'idle' && (
                          <button onClick={regenerate} className="btn-icon !h-8 !w-8" aria-label="Regenerate response" title="Regenerate">
                            <RotateCcw size={15} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}

            {phase === 'thinking' && (
              <div className="flex gap-3">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-bg" />
                </span>
                <TypingIndicator />
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="px-4 pb-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <AnimatePresence>
              {mic.active && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mb-2 overflow-hidden"
                >
                  <div className="glass flex items-center gap-3 rounded-2xl px-4 py-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/70" />
                      <span className="relative h-2.5 w-2.5 rounded-full bg-rose-400" />
                    </span>
                    <Waveform analyserRef={mic.analyserRef} active={mic.active} className="h-10 flex-1" />
                    <button onClick={stopVoice} className="text-xs text-muted hover:text-fg">Stop</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className="glass gradient-border flex items-end gap-2 rounded-2xl p-2 focus-within:shadow-[0_0_40px_-10px_rgb(var(--accent)/0.6)]"
            >
              <button
                type="button"
                onClick={toggleVoice}
                className={cn('btn-icon !h-10 !w-10 shrink-0', mic.active && '!bg-rose-400/15 !text-rose-400')}
                aria-label={mic.active ? 'Stop voice input' : 'Start voice input'}
                title="Voice input"
              >
                {mic.active ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder={`Message ${activeTool.name}…`}
                aria-label="Message"
                className="max-h-44 min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2.5 text-[14.5px] outline-none placeholder:text-muted/70"
              />
              {phase === 'idle' ? (
                <button type="submit" disabled={!input.trim()} className="btn-primary !h-10 !w-10 shrink-0 !p-0" aria-label="Send message">
                  <ArrowUp size={18} />
                </button>
              ) : (
                <button type="button" onClick={stop} className="btn-ghost !h-10 !w-10 shrink-0 !p-0" aria-label="Stop generating">
                  <Square size={14} className="fill-current" />
                </button>
              )}
            </form>
            <p className="mt-2 text-center text-[11px] text-muted">
              <span className="kbd">Enter</span> send · <span className="kbd">Shift</span>+<span className="kbd">Enter</span> new line · Demo responses run locally
            </p>
          </div>
        </div>
      </section>

      {/* Right panel: audio-reactive orb + prompt library */}
      <aside className="hidden w-80 shrink-0 flex-col border-l border-line/[0.07] bg-surface/20 xl:flex">
        <div className="relative h-60 border-b border-line/[0.07]">
          <Suspense fallback={<div className="grid h-full place-items-center"><div className="h-24 w-24 rounded-full bg-accent/20 blur-2xl" /></div>}>
            <AudioOrbScene levelRef={orbLevel} accent={accent} motionReduced={motionReduced} isLight={isLight} />
          </Suspense>
          <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
            <span className="glass rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{status}</span>
          </div>
        </div>
        <div className="px-4 py-3">
          <Waveform analyserRef={mic.analyserRef} levelRef={orbLevel} active={mic.active} bars={36} className="h-8 w-full" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col border-t border-line/[0.07]">
          <div className="flex items-center gap-2 px-4 pt-4">
            <BookOpen size={15} className="text-accent" />
            <p className="font-display text-sm font-medium">Prompt library</p>
          </div>
          <div className="flex flex-wrap gap-1.5 px-4 py-3">
            {PROMPT_CATEGORIES.map((c) => (
              <button key={c} onClick={() => setPromptCat(c)} className={cn('chip !px-2.5 !py-1', promptCat === c && 'chip-active')}>{c}</button>
            ))}
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
            {libraryItems.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setInput(p.prompt)
                  textareaRef.current?.focus()
                }}
                className="glass w-full rounded-xl p-3 text-left transition hover:border-accent/30"
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-medium">{p.title}</span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted">{p.category}</span>
                </span>
                <span className="mt-1 line-clamp-2 block text-xs text-muted">{p.prompt}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
