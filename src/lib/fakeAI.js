/**
 * Simulated AI backend.
 * ---------------------------------------------------------------
 * To connect a real model later, replace the body of getAIResponse
 * with a fetch() to your API route and return the reply string.
 * The Workspace page already handles thinking state + streaming.
 */
import { wait } from './utils'

const TEMPLATES = [
  {
    match: /component|react|code|function|jsx|tailwind|button|card/i,
    reply: () => `Here's a clean, reusable starting point you can drop into your project:

\`\`\`jsx
export function GlowCard({ title, children }) {
  return (
    <div className="relative rounded-2xl border border-white/10
                    bg-white/5 p-6 backdrop-blur-xl
                    shadow-[0_0_60px_-15px_rgba(34,211,238,0.5)]">
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-2 text-sm text-slate-400">{children}</div>
    </div>
  )
}
\`\`\`

**Why it works:**
- \`backdrop-blur-xl\` + a translucent background creates the glass layer.
- A soft cyan shadow adds glow without heavy filters.
- Props keep it reusable for any panel in your dashboard.

Want me to add a hover spotlight that follows the cursor?`,
  },
  {
    match: /useeffect|twice|bug|error|debug|fix/i,
    reply: () => `Good question — this trips up a lot of React developers.

In development, **React 18 StrictMode** mounts, unmounts and re-mounts every component once. That's why your \`useEffect\` appears to run twice. It does **not** happen in production.

**How to handle it properly:**
- Always return a cleanup function (unsubscribe, abort fetch, clear timers).
- Use an \`AbortController\` for requests so the first call is cancelled.
- Never "fix" it by removing StrictMode — the double run is exposing missing cleanup.

\`\`\`js
useEffect(() => {
  const controller = new AbortController()
  fetch(url, { signal: controller.signal }).then(...)
  return () => controller.abort()
}, [url])
\`\`\``,
  },
  {
    match: /roadmap|plan|learn|week|steps|portfolio/i,
    reply: () => `Here's a focused plan you can actually follow:

**Week 1 — Foundations**
- Scenes, cameras, meshes, materials and lights in plain Three.js.
- Rebuild the same scene with React Three Fiber.

**Week 2 — Interaction**
- \`useFrame\` animation loops, pointer events and raycasting.
- Drei helpers: OrbitControls, Html, Float, Environment.

**Week 3 — Motion & polish**
- GSAP + ScrollTrigger for camera moves on scroll.
- Particles, custom shaders (fresnel glow) and postprocessing.

**Week 4 — Ship it**
- Lazy-load the canvas, cap DPR, respect reduced motion.
- Deploy, record a 30s demo video and write a case study.

Consistency beats intensity — 60–90 minutes a day is enough.`,
  },
  {
    match: /palette|color|colour|design|ui|theme|animation|motion/i,
    reply: () => `A premium dark palette with **zero purple**:

- **Background** — \`#04060A\` (near-black with a blue cast)
- **Surface** — \`#0C1016\` with 55% opacity for glass
- **Primary accent** — Cyan \`#22D3EE\`
- **Secondary accent** — Emerald \`#34D399\`
- **Warm highlight** — Amber \`#FBBF24\` for warnings and badges
- **Text** — \`#E8EEF4\`, muted \`#8894A3\`

**Usage rules:**
- Keep accents under ~10% of the screen; let darkness do the work.
- Use glow (box-shadow) only on interactive elements.
- Gradients should flow cyan → emerald, never across hues that clash.`,
  },
  {
    match: /tagline|slogan|headline|write|email|copy|story/i,
    reply: () => `Here are a few options with different energy:

- **Experience intelligence beyond the screen.**
- **Your mind, multiplied.**
- **Step into the future of AI.**
- **One workspace. Infinite possibilities.**
- **Think in three dimensions.**

My pick is the first — it's short, visual and matches the immersive 3D experience. Want variations in a bolder or calmer tone?`,
  },
  {
    match: /data|metric|analy|chart|users|traffic/i,
    reply: () => `Here's what stands out in this week's numbers:

- **Active users are up 5.1%**, driven mostly by returning desktop users.
- **Prompt volume grew 18.7%**, but average session length dipped slightly.
- **Mobile is 31% of traffic** yet has the lowest completion rate.

**Three improvements to try:**
- Simplify the mobile Workspace — collapse side panels by default.
- Surface prompt suggestions earlier to shorten time-to-first-message.
- Add a weekly digest email highlighting saved projects.`,
  },
]

const FALLBACK = (prompt) => `Great prompt. Here's how I'd approach **"${prompt.slice(0, 60)}${prompt.length > 60 ? '…' : ''}"**:

- **Clarify the goal** — what does a great result look like for you?
- **Break it down** — split the work into small, testable steps.
- **Iterate quickly** — ship a rough version, then refine with feedback.

This is a demo response running fully in the browser. Connect a real model in \`src/lib/fakeAI.js\` and NEXORA will stream genuine answers through the same interface.`

export async function getAIResponse({ prompt, tool }) {
  await wait(50)
  const match = TEMPLATES.find((t) => t.match.test(prompt))
  const body = match ? match.reply(prompt) : FALLBACK(prompt)
  return tool && tool.id !== 'nova-chat' ? `*${tool.name} mode*\n\n${body}` : body
}
