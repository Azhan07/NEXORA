import { Home, Bot, Orbit, FolderKanban, Settings, LayoutDashboard } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, shortcut: 'Alt 1', description: 'Landing page & 3D hero' },
  { to: '/workspace', label: 'Workspace', icon: Bot, shortcut: 'Alt 2', description: 'Chat with your AI assistant' },
  { to: '/explore', label: 'Explore', icon: Orbit, shortcut: 'Alt 3', description: '3D universe of AI tools' },
  { to: '/projects', label: 'Projects', icon: FolderKanban, shortcut: 'Alt 4', description: 'Saved work & history' },
  { to: '/settings', label: 'Settings', icon: Settings, shortcut: 'Alt 5', description: 'Profile, theme & motion' },
  { to: '/admin', label: 'Admin', icon: LayoutDashboard, shortcut: 'Alt 6', description: 'Stats, users & content' },
]
