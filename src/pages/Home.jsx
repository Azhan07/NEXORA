import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowUpRight, ArrowDown, Bot, Orbit, MousePointer2, Layers, Command, SlidersHorizontal, AudioLines,
  FolderKanban, Settings, LayoutDashboard, Sparkles, Github,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import MagneticButton from '../components/MagneticButton'
import { usePrefs } from '../context/PreferencesContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { trackSpotlight, cn } from '../lib/utils'

gsap.registerPlugin(ScrollTrigger)
// Keep GSAP on real time so the intro finishes on schedule even when the
// 3D scene makes a slow device drop frames.
gsap.ticker.lagSmoothing(0)

// Reveal helper. fromTo (not from) with explicit end values, because many
// elements carry Tailwind `transition` classes — gsap.from would read a
// mid-transition opacity. clearProps hands transform back to CSS so hover
// lifts keep working after the reveal.
const reveal = (targets, vars, fromVars = { opacity: 0, y: 40 }) =>
  gsap.fromTo(targets, fromVars, { opacity: 1, y: 0, clearProps: 'opacity,transform', ...vars })

const HeroScene = lazy(() => import('../three/HeroScene'))

const FEATURES = [
  {
    icon: MousePointer2, title: 'Mouse-Reactive 3D World', tech: 'Three.js · React Three Fiber',
    text: 'The AI core, its lighting and thousands of particles follow your cursor in real time — the interface feels alive.',
    span: 'md:col-span-2',
  },
  { icon: Layers, title: 'Adaptive Glass UI', tech: 'Tailwind CSS', text: 'Translucent layers, gradient hairlines and spotlight reflections that track your pointer.' },
  { icon: Command, title: 'Universal Command Palette', tech: 'React state + keyboard', text: 'Press Ctrl K anywhere to jump to pages, launch tools or flip settings instantly.' },
  { icon: SlidersHorizontal, title: 'Personalized Experience', tech: 'Context + localStorage', text: 'Dark or light, five accent palettes, reduced motion and 3D quality — remembered across visits.' },
  {
    icon: AudioLines, title: 'Audio-Reactive Visualizer', tech: 'Web Audio API + Three.js',
    text: 'Turn on the mic in the Workspace and watch the orb and waveform pulse with your voice.',
  },
]

const STEPS = [
  { n: '01', title: 'Summon your core', text: 'NEXORA boots a personal AI core that adapts its look, motion and voice to you.' },
  { n: '02', title: 'Converse naturally', text: 'Type or speak. Responses stream in live, with code, lists and actions you can copy or regenerate.' },
  { n: '03', title: 'Explore the universe', text: 'Every AI tool is a planet in orbit. Hover to preview, click to fly in and launch it.' },
  { n: '04', title: 'Create & keep', text: 'Sessions become projects. Search, filter and favourite your work — it is all saved locally.' },
]

const PAGES = [
  { to: '/workspace', icon: Bot, title: 'AI Workspace', text: 'Chat, sessions, prompt library, voice' },
  { to: '/explore', icon: Orbit, title: 'Explore', text: '3D universe of selectable AI tools' },
  { to: '/projects', icon: FolderKanban, title: 'Projects & History', text: 'Search, filters, favourites, activity' },
  { to: '/settings', icon: Settings, title: 'Profile & Settings', text: 'Theme, accents, accessibility, motion' },
  { to: '/admin', icon: LayoutDashboard, title: 'Admin Dashboard', text: 'Users, stats, charts, content' },
]

function OrbFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
    </div>
  )
}

export default function Home() {
  const { content, motionReduced, accent, isLight, prefs } = usePrefs()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const root = useRef(null)
  const heroRef = useRef(null)
  const progressRef = useRef(0)
  const glowRef = useRef(null)
  const [heroActive, setHeroActive] = useState(true)

  // Pause the WebGL loop when the hero is off-screen (performance).
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setHeroActive(entry.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Cursor glow that follows the mouse across the page.
  useEffect(() => {
    if (motionReduced || isMobile) return
    let raf = 0
    const on = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (glowRef.current) glowRef.current.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`
      })
    }
    window.addEventListener('pointermove', on, { passive: true })
    return () => {
      window.removeEventListener('pointermove', on)
      cancelAnimationFrame(raf)
    }
  }, [motionReduced, isMobile])

  // GSAP: intro timeline + scroll-driven scenes.
  useLayoutEffect(() => {
    if (motionReduced) return
    const ctx = gsap.context(() => {
      // 0–1s particles (in 3D) · 1–2s orb forms (in 3D) · 2–3s heading + CTAs
      const ease = 'power3.out'
      gsap.timeline()
        .add(reveal('[data-nav]', { duration: 0.8, ease }, { opacity: 0, y: -20 }), 0.4)
        .add(reveal('[data-hero-eyebrow]', { duration: 0.6, ease }, { opacity: 0, y: 14 }), 1.5)
        .fromTo('[data-hero-line]', { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.14 }, 1.7)
        .add(reveal('[data-hero-sub]', { duration: 0.8, ease }, { opacity: 0, y: 16 }), 2.1)
        .add(reveal('[data-hero-cta]', { duration: 0.7, ease, stagger: 0.1 }, { opacity: 0, y: 22 }), 2.3)
        .add(reveal('[data-hero-card]', { duration: 0.8, ease, stagger: 0.12 }, { opacity: 0, y: 30 }), 2.5)
        .add(reveal('[data-hero-scroll]', { duration: 0.6 }, { opacity: 0, y: 0 }), 3)

      // Scroll: camera zoom + scene transform (read by the 3D Rig)
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          progressRef.current = self.progress
        },
      })
      gsap.to('[data-hero-content]', {
        yPercent: -30, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: '70% top', scrub: true },
      })

      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        reveal(el, { duration: 0.9, ease, scrollTrigger: { trigger: el, start: 'top 85%' } })
      })
      gsap.utils.toArray('[data-stagger]').forEach((group) => {
        reveal(group.children, { duration: 0.8, stagger: 0.1, ease, scrollTrigger: { trigger: group, start: 'top 80%' } }, { opacity: 0, y: 50 })
      })

      // Storytelling: progress line + active step
      gsap.fromTo('[data-story-progress]', { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '[data-story]', start: 'top 60%', end: 'bottom 60%', scrub: true },
      })
      gsap.utils.toArray('[data-story-step]').forEach((step) => {
        ScrollTrigger.create({ trigger: step, start: 'top 65%', end: 'bottom 45%', toggleClass: { targets: step, className: 'is-active' } })
      })

      gsap.to('[data-marquee]', {
        xPercent: -15, ease: 'none',
        scrollTrigger: { trigger: '[data-marquee]', start: 'top bottom', end: 'bottom top', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [motionReduced])

  const scrollToFeatures = () =>
    document.getElementById('features')?.scrollIntoView({ behavior: motionReduced ? 'auto' : 'smooth' })

  return (
    <div ref={root} className="relative overflow-x-clip">
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-0 hidden h-[600px] w-[600px] rounded-full bg-accent/[0.07] blur-[100px] md:block"
      />

      <Navbar />

      {/* ───────────── HERO ───────────── */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[660px] overflow-hidden">
        <div className="absolute inset-0">
          <Suspense fallback={<OrbFallback />}>
            <HeroScene
              progressRef={progressRef}
              active={heroActive}
              accent={accent}
              motionReduced={motionReduced}
              isLight={isLight}
              quality={prefs.quality}
              isMobile={isMobile}
            />
          </Suspense>
        </div>
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />

        <div data-hero-content className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-between px-4 pb-10 pt-28 md:pb-24 text-center sm:px-6 md:pt-32">
          <div>
            <p data-hero-eyebrow className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_10px_rgb(var(--accent))]" />
              {content.eyebrow}
            </p>
            <h1 className="mt-6 font-display [filter:drop-shadow(0_6px_28px_rgb(var(--bg)/0.85))] text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              <span className="block overflow-hidden pb-2"><span data-hero-line className="block">{content.headline1}</span></span>
              <span className="block overflow-hidden pb-2"><span data-hero-line className="text-gradient block">{content.headline2}</span></span>
            </h1>
          </div>

          <div className="flex flex-col items-center">
            <p data-hero-sub className="max-w-md text-balance text-sm text-muted sm:text-base">{content.subtext}</p>
            <div className="pointer-events-auto mt-6 flex flex-wrap items-center justify-center gap-3">
              <div data-hero-cta>
                <MagneticButton>
                  <Link to="/workspace" className="btn-primary">Explore Workspace <ArrowUpRight size={16} /></Link>
                </MagneticButton>
              </div>
              <div data-hero-cta>
                <MagneticButton>
                  <button onClick={scrollToFeatures} className="btn-ghost glass">Discover Features</button>
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>

        {/* Floating preview cards */}
        <Link
          to="/workspace"
          data-hero-card
          onMouseMove={trackSpotlight}
          className="glass spotlight gradient-border absolute bottom-24 left-6 z-20 hidden w-60 rounded-2xl p-4 transition hover:-translate-y-1 lg:block xl:left-12"
        >
          <span className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent"><Bot size={18} /></span>
          <p className="font-display font-medium">AI Assistant</p>
          <p className="text-xs text-muted">Your intelligent workspace</p>
        </Link>
        <Link
          to="/explore"
          data-hero-card
          onMouseMove={trackSpotlight}
          className="glass spotlight gradient-border absolute bottom-24 right-6 z-20 hidden w-60 rounded-2xl p-4 transition hover:-translate-y-1 lg:block xl:right-12"
        >
          <span className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-accent2/15 text-accent2"><Orbit size={18} /></span>
          <p className="font-display font-medium">3D Universe</p>
          <p className="text-xs text-muted">Explore tools in a new dimension</p>
        </Link>

        <button
          data-hero-scroll
          onClick={scrollToFeatures}
          className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-muted md:flex"
          aria-label="Scroll to features"
        >
          Scroll <ArrowDown size={14} className="animate-float" />
        </button>
      </section>

      {/* ───────────── MARQUEE ───────────── */}
      <section className="relative z-10 border-y border-line/[0.07] py-6">
        <div data-marquee className="flex gap-12 whitespace-nowrap font-display text-2xl text-muted/40 md:text-3xl">
          {['Real-time 3D', 'Command palette', 'Streaming chat', 'Voice visualizer', 'Glass interface', 'Reduced motion', 'Dark-first design', 'Real-time 3D', 'Command palette', 'Streaming chat'].map((w, i) => (
            <span key={i} className="flex items-center gap-12">
              {w} <Sparkles size={18} className="text-accent/60" />
            </span>
          ))}
        </div>
      </section>

      {/* ───────────── FEATURES ───────────── */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-4 py-28 sm:px-6">
        <div data-reveal className="max-w-2xl">
          <p className="eyebrow">Built different</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Beautiful on the surface. <span className="text-muted">Functional underneath.</span>
          </h2>
        </div>

        <div data-stagger className="mt-14 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <article
                key={f.title}
                onMouseMove={trackSpotlight}
                className={cn('glass spotlight gradient-border group rounded-3xl p-7 transition duration-500 hover:-translate-y-1', f.span)}
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-accent/20 bg-accent/10 text-accent transition group-hover:shadow-[0_0_30px_rgb(var(--accent)/0.4)]">
                  <Icon size={20} />
                </span>
                <h3 className="mt-6 font-display text-xl font-medium">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
                <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-accent/80">{f.tech}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* ───────────── STORY ───────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-14 md:grid-cols-[1fr_1.2fr]">
          <div className="md:sticky md:top-32 md:self-start" data-reveal>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              From first glance to <span className="text-gradient">finished work.</span>
            </h2>
            <p className="mt-4 max-w-sm text-muted">
              Scroll through the journey. Every step is a real, working part of the app — not a mockup.
            </p>
          </div>

          <div data-story className="relative pl-10">
            <div className="absolute left-[11px] top-2 h-[calc(100%-1rem)] w-px bg-line/10" />
            <div data-story-progress className="absolute left-[11px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-gradient-to-b from-accent to-accent2" />
            <div className="flex flex-col gap-16 py-4">
              {STEPS.map((s) => (
                <div key={s.n} data-story-step className="relative">
                  <span className="step-dot absolute -left-10 top-1 h-6 w-6 rounded-full border-2 border-line/20 bg-bg" />
                  <p className="font-mono text-xs text-accent">{s.n}</p>
                  <h3 className="mt-2 font-display text-2xl font-medium">{s.title}</h3>
                  <p className="mt-2 max-w-md text-muted">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── PAGES ───────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div data-reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Inside the app</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">Six spaces. One experience.</h2>
          </div>
          <p className="max-w-sm text-sm text-muted">Press <span className="kbd">Ctrl K</span> anywhere to jump between them.</p>
        </div>
        <div data-stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PAGES.map((p) => {
            const Icon = p.icon
            return (
              <Link
                key={p.to}
                to={p.to}
                onMouseMove={trackSpotlight}
                className="glass spotlight group flex flex-col rounded-2xl p-5 transition hover:-translate-y-1 hover:border-accent/30"
              >
                <Icon size={20} className="text-accent" />
                <p className="mt-8 font-display font-medium">{p.title}</p>
                <p className="mt-1 text-xs text-muted">{p.text}</p>
                <ArrowUpRight size={16} className="mt-4 text-muted transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent" />
              </Link>
            )
          })}
        </div>
      </section>

      {/* ───────────── CTA ───────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div data-reveal className="glass gradient-border relative overflow-hidden rounded-[2rem] px-6 py-20 text-center md:px-16">
          <div aria-hidden className="absolute left-1/2 top-0 h-72 w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[100px]" />
          <p className="eyebrow relative">Experience intelligence beyond the screen</p>
          <h2 className="relative mx-auto mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
            Ready to step inside?
          </h2>
          <div className="relative mt-10 flex flex-wrap justify-center gap-3">
            <MagneticButton>
              <Link to="/workspace" className="btn-primary">Launch NEXORA <ArrowUpRight size={16} /></Link>
            </MagneticButton>
            <MagneticButton>
              <Link to="/explore" className="btn-ghost">Explore the universe</Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-line/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-muted sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} NEXORA — a frontend concept built with React, Three.js & GSAP.</p>
          <div className="flex items-center gap-4">
            <Link to="/settings" className="hover:text-fg">Settings</Link>
            <Link to="/admin" className="hover:text-fg">Admin</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-fg" aria-label="GitHub"><Github size={16} /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}
