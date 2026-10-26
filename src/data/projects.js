const DAY = 86_400_000
const now = Date.now()

export const DEMO_PROJECTS = [
  { id: 'pr1', title: 'Brand Voice Guide', description: 'Tone rules and sample copy for the NEXORA launch.', toolId: 'scribe', status: 'Active', progress: 72, updatedAt: now - 2 * 3_600_000 },
  { id: 'pr2', title: 'Dashboard Components', description: 'Reusable React charts and stat cards with Tailwind.', toolId: 'codeforge', status: 'Active', progress: 54, updatedAt: now - 7 * 3_600_000 },
  { id: 'pr3', title: 'Hero Moodboard', description: 'Concept frames for the 3D orb and particle field.', toolId: 'canvas-gen', status: 'Completed', progress: 100, updatedAt: now - 1 * DAY },
  { id: 'pr4', title: 'Q3 Usage Analysis', description: 'Retention cohorts and tool adoption breakdown.', toolId: 'insight-engine', status: 'Active', progress: 38, updatedAt: now - 2 * DAY },
  { id: 'pr5', title: 'Podcast Intro Voice', description: '30-second narrated intro in three voice styles.', toolId: 'echo-voice', status: 'Draft', progress: 15, updatedAt: now - 3 * DAY },
  { id: 'pr6', title: 'Auth Bug Hunt', description: 'Token refresh race condition in the login flow.', toolId: 'debug-sentinel', status: 'Completed', progress: 100, updatedAt: now - 4 * DAY },
  { id: 'pr7', title: 'Launch Trailer Storyboard', description: '12 shots for the 45s product reveal video.', toolId: 'motion-lab', status: 'Draft', progress: 22, updatedAt: now - 6 * DAY },
  { id: 'pr8', title: 'Urdu Localization', description: 'Translate onboarding and settings into Urdu.', toolId: 'lingo', status: 'Active', progress: 61, updatedAt: now - 8 * DAY },
  { id: 'pr9', title: 'Traffic Forecast', description: 'Expected visitors for the next 90 days.', toolId: 'forecast', status: 'Completed', progress: 100, updatedAt: now - 12 * DAY },
]

export const DEFAULT_FAVORITES = ['pr1', 'pr3']
