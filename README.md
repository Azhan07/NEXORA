# NEXORA — The Future of Personal AI

> Experience intelligence beyond the screen.

An immersive, frontend-first AI workspace built with **React, Tailwind CSS, Three.js (React Three Fiber), GSAP and Framer Motion**. Dark-first design with a cyan / emerald palette — no purple anywhere.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build
```

Requires Node.js 18+.

## What's inside

| Page | Route | Highlights |
| --- | --- | --- |
| Home | `/` | 3D AI orb (mouse parallax, cursor light, particles), GSAP intro timeline, scroll zoom, staggered reveals, scroll storytelling, magnetic buttons |
| AI Workspace | `/workspace` | Chat with typing indicator + streaming responses, copy / regenerate / stop, sessions with search, prompt library, mic input with live waveform, audio-reactive 3D orb, voice dictation (Chrome / Edge) |
| Explore | `/explore` | 3D universe — 12 tools orbit as nodes; hover to expand + preview, click to fly the camera in; category filters, search, grid view, scene settings |
| Projects & History | `/projects` | Saved projects + your real chat sessions, search, category filters, favorites, sorting, grid / list, activity timeline |
| Profile & Settings | `/settings` | Profile editor, dark / light theme, 5 accent palettes, reduced motion, 3D quality, shortcuts, reset data |
| Admin | `/admin` | Animated stat counters, area chart with tooltip, donut, tool-usage bars, user table (search, suspend), **homepage content editor that updates the landing page live** |

### Keyboard shortcuts
- `Ctrl / ⌘ + K` — command palette (pages, tools, actions)
- `Ctrl / ⌘ + B` — collapse sidebar
- `Alt + 1…6` — jump to Home, Workspace, Explore, Projects, Settings, Admin
- `Esc` — close palette / panels

## Project structure

```
src/
├── three/            # All 3D: Orb, Particles, FresnelGlow shader, HeroScene, UniverseScene, AudioOrbScene
├── pages/            # Home, Workspace, Explore, Projects, SettingsPage, Admin, NotFound
├── components/       # Command palette, toasts, magnetic button, charts, layout (AppShell, Sidebar, Topbar, Navbar)
├── context/          # PreferencesContext (theme, accent, motion, profile, content) · UIContext
├── hooks/            # usePersistentState, useAudioAnalyser (Web Audio), useMediaQuery
├── data/             # Tools, prompts, demo projects, admin data
└── lib/              # fakeAI (swap for a real API), pointer tracker, storage, utils
```

**Animation roles are kept separate**, as planned:
- **Three.js / R3F** → the 3D scenes (`src/three`)
- **GSAP + ScrollTrigger** → cinematic intro + scroll sequences (`src/pages/Home.jsx`)
- **Framer Motion** → UI: page transitions, panels, cards, menus

## Customising

- **Colors** — tokens live in `src/index.css` (`--bg`, `--surface`, `--fg`…). Accent palettes are in `ACCENTS` inside `src/context/PreferencesContext.jsx`.
- **AI tools** — edit `src/data/tools.js`; they appear automatically in Explore, the palette, Workspace and Admin.
- **Hero text** — edit live from the Admin page, or change `DEFAULT_CONTENT` in `PreferencesContext.jsx`.

## Connecting a real AI model

All responses come from `getAIResponse()` in `src/lib/fakeAI.js`. Replace its body with a call to your own backend route and return the reply text — the Workspace already handles the thinking state, streaming animation, stop and regenerate:

```js
export async function getAIResponse({ prompt, tool }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, tool: tool?.id }),
  })
  const data = await res.json()
  return data.reply
}
```

Keep API keys on a server — never in frontend code.

## Performance & accessibility

- Every page and every 3D scene is lazy-loaded; `three` ships in its own chunk.
- The hero render loop pauses when scrolled off-screen; pixel ratio is capped; fewer particles on mobile or "low" quality.
- `prefers-reduced-motion` and an in-app toggle disable parallax, auto-rotation and scroll effects.
- Explore has a 2D grid view as an accessible alternative to the 3D scene.

## Deploy

- **Vercel** — import the repo; `vercel.json` handles client-side routes.
- **Netlify** — build `npm run build`, publish `dist`; `public/_redirects` handles routes.
# NEXORA
