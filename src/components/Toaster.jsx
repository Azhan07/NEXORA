import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { useUI } from '../context/UIContext'

const ICONS = { success: CheckCircle2, info: Info, error: AlertTriangle }

export default function Toaster() {
  const { toasts } = useUI()
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[120] flex -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type] ?? Info
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="glass-strong flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm shadow-2xl shadow-black/30"
            >
              <Icon size={16} className={t.type === 'error' ? 'text-rose-400' : 'text-accent'} />
              {t.message}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
