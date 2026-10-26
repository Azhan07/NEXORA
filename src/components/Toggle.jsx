import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
        checked ? 'border-accent/60 bg-accent/80' : 'border-line/15 bg-line/10',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={cn('h-4.5 h-[18px] w-[18px] rounded-full shadow', checked ? 'ml-[22px] bg-bg' : 'ml-[3px] bg-fg/80')}
      />
    </button>
  )
}
