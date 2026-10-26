import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import CommandPalette from './components/CommandPalette'
import GlobalShortcuts from './components/GlobalShortcuts'
import Toaster from './components/Toaster'
import PageLoader from './components/PageLoader'

// Every page is code-split; 3D scenes inside them are lazy-loaded too.
const Home = lazy(() => import('./pages/Home'))
const Workspace = lazy(() => import('./pages/Workspace'))
const Explore = lazy(() => import('./pages/Explore'))
const Projects = lazy(() => import('./pages/Projects'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <GlobalShortcuts />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<AppShell />}>
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <CommandPalette />
      <Toaster />
    </>
  )
}
