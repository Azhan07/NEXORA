import { Suspense } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import PageLoader from '../PageLoader'
import { usePrefs } from '../../context/PreferencesContext'

export default function AppShell() {
  const location = useLocation()
  const outlet = useOutlet()
  const { motionReduced } = usePrefs()

  return (
    <div className="relative flex min-h-screen">
      {/* Ambient background — cyan / emerald glows, no purple */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-accent2/[0.08] blur-[120px]" />
      </div>

      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={motionReduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={motionReduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Suspense fallback={<PageLoader inline label="Loading" />}>{outlet}</Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
