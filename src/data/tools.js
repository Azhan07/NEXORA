import {
  MessageSquare, PenLine, Languages, ScanEye, ImagePlus, Clapperboard,
  Code2, Bug, AudioLines, Mic, BarChart3, TrendingUp,
} from 'lucide-react'

export const CATEGORIES = [
  { id: 'language', label: 'Language', color: '#22d3ee' },
  { id: 'vision', label: 'Vision', color: '#fbbf24' },
  { id: 'code', label: 'Code', color: '#34d399' },
  { id: 'audio', label: 'Audio', color: '#fb7185' },
  { id: 'data', label: 'Data', color: '#60a5fa' },
]

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

const RAW_TOOLS = [
  {
    id: 'nova-chat', name: 'Nova Chat', category: 'language', icon: MessageSquare,
    tagline: 'Conversational intelligence',
    description: 'A context-aware assistant that reasons through problems, remembers the thread and answers in your tone.',
    tags: ['Chat', 'Reasoning', 'Memory'], usage: 48210, latency: '0.8s', rating: 4.9,
  },
  {
    id: 'prism-vision', name: 'Prism Vision', category: 'vision', icon: ScanEye,
    tagline: 'See what images mean',
    description: 'Describe, tag and extract text from images. Point it at a screenshot and get structured insight back.',
    tags: ['OCR', 'Tagging', 'Scenes'], usage: 21480, latency: '1.4s', rating: 4.7,
  },
  {
    id: 'codeforge', name: 'CodeForge', category: 'code', icon: Code2,
    tagline: 'Production-ready code',
    description: 'Generates components, functions and tests from plain language, following your stack and conventions.',
    tags: ['React', 'TypeScript', 'Tests'], usage: 39870, latency: '1.1s', rating: 4.8,
  },
  {
    id: 'echo-voice', name: 'Echo Voice', category: 'audio', icon: AudioLines,
    tagline: 'Natural speech synthesis',
    description: 'Turns text into expressive, human-sounding narration with adjustable pace, pitch and emotion.',
    tags: ['TTS', 'Narration', 'Voices'], usage: 12650, latency: '0.9s', rating: 4.6,
  },
  {
    id: 'insight-engine', name: 'Insight Engine', category: 'data', icon: BarChart3,
    tagline: 'Ask your data anything',
    description: 'Upload a dataset and ask questions in plain English. Get charts, summaries and anomalies instantly.',
    tags: ['Analytics', 'Charts', 'SQL'], usage: 18320, latency: '1.6s', rating: 4.8,
  },
  {
    id: 'scribe', name: 'Scribe', category: 'language', icon: PenLine,
    tagline: 'Long-form writing partner',
    description: 'Drafts articles, scripts and docs with structure, then edits for clarity, rhythm and voice.',
    tags: ['Writing', 'Editing', 'SEO'], usage: 27540, latency: '1.0s', rating: 4.7,
  },
  {
    id: 'canvas-gen', name: 'Canvas Gen', category: 'vision', icon: ImagePlus,
    tagline: 'Imagine it, render it',
    description: 'Generates concept art, UI moodboards and product shots from prompts with style controls.',
    tags: ['Images', 'Styles', 'Upscale'], usage: 33190, latency: '3.2s', rating: 4.6,
  },
  {
    id: 'debug-sentinel', name: 'Debug Sentinel', category: 'code', icon: Bug,
    tagline: 'Finds bugs before users do',
    description: 'Reads stack traces and code, explains the root cause and proposes a minimal, tested fix.',
    tags: ['Debugging', 'Review', 'Security'], usage: 15730, latency: '1.3s', rating: 4.9,
  },
  {
    id: 'pulse-transcribe', name: 'Pulse Transcribe', category: 'audio', icon: Mic,
    tagline: 'Every word, captured',
    description: 'Real-time transcription with speaker labels, timestamps and automatic meeting summaries.',
    tags: ['Speech', 'Meetings', 'Summaries'], usage: 22060, latency: '0.6s', rating: 4.7,
  },
  {
    id: 'forecast', name: 'Forecast', category: 'data', icon: TrendingUp,
    tagline: 'Predict what comes next',
    description: 'Time-series forecasting for metrics, sales and traffic with confidence ranges you can explain.',
    tags: ['Forecasting', 'Trends', 'Models'], usage: 9840, latency: '2.0s', rating: 4.5,
  },
  {
    id: 'lingo', name: 'Lingo', category: 'language', icon: Languages,
    tagline: 'Translate with nuance',
    description: 'Translates between 90+ languages while keeping idioms, tone and formatting intact.',
    tags: ['Translate', 'Localize', '90+ langs'], usage: 19470, latency: '0.7s', rating: 4.8,
  },
  {
    id: 'motion-lab', name: 'Motion Lab', category: 'vision', icon: Clapperboard,
    tagline: 'Storyboards in seconds',
    description: 'Turns a script into shot-by-shot storyboards with camera directions and timing notes.',
    tags: ['Video', 'Storyboard', 'Shots'], usage: 7620, latency: '2.6s', rating: 4.5,
  },
]

export const TOOLS = RAW_TOOLS.map((t) => ({ ...t, color: categoryById[t.category].color }))

export const toolById = (id) => TOOLS.find((t) => t.id === id)
