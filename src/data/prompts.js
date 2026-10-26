import { Code2, Lightbulb, Palette, PenLine } from 'lucide-react'

export const PROMPT_LIBRARY = [
  { id: 'p1', category: 'Writing', title: 'Launch taglines', prompt: 'Write 5 punchy taglines for a futuristic AI workspace called NEXORA.' },
  { id: 'p2', category: 'Code', title: 'Glass card component', prompt: 'Build a React component for a glowing glassmorphism card with Tailwind CSS.' },
  { id: 'p3', category: 'Strategy', title: 'Learning roadmap', prompt: 'Create a 4-week roadmap to learn Three.js with React Three Fiber.' },
  { id: 'p4', category: 'Design', title: 'Dark color palette', prompt: 'Suggest a dark-mode color palette for an AI product without purple tones.' },
  { id: 'p5', category: 'Research', title: 'Explain simply', prompt: 'Explain how large language models work in simple terms.' },
  { id: 'p6', category: 'Data', title: 'Analyze metrics', prompt: 'Analyze this week’s user metrics and suggest three improvements.' },
  { id: 'p7', category: 'Code', title: 'Debug useEffect', prompt: 'Why does my useEffect run twice in development, and how should I handle it?' },
  { id: 'p8', category: 'Writing', title: 'Beta invite email', prompt: 'Draft a friendly email inviting beta testers to try NEXORA.' },
  { id: 'p9', category: 'Strategy', title: 'Portfolio plan', prompt: 'Plan how to present this 3D project in my developer portfolio.' },
  { id: 'p10', category: 'Design', title: 'Motion principles', prompt: 'What UI animation principles make an interface feel premium?' },
]

export const PROMPT_CATEGORIES = ['All', ...new Set(PROMPT_LIBRARY.map((p) => p.category))]

export const SUGGESTIONS = [
  { icon: PenLine, title: 'Write taglines', subtitle: 'for a futuristic product', prompt: PROMPT_LIBRARY[0].prompt },
  { icon: Code2, title: 'Build a component', subtitle: 'glassmorphism card in React', prompt: PROMPT_LIBRARY[1].prompt },
  { icon: Lightbulb, title: 'Plan my learning', subtitle: 'Three.js in 4 weeks', prompt: PROMPT_LIBRARY[2].prompt },
  { icon: Palette, title: 'Design a palette', subtitle: 'dark mode, no purple', prompt: PROMPT_LIBRARY[3].prompt },
]
