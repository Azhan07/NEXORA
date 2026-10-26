import { cn } from '../lib/utils'

export default function PageLoader({ inline = false, label = 'Initializing' }) {
  return (
    <div className={cn('grid place-items-center', inline ? 'h-[60vh]' : 'fixed inset-0 z-[100] bg-bg')}>
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-14 w-14">
          <span className="absolute inset-0 animate-pulse-ring rounded-full border border-accent/60" />
          <span className="absolute inset-2 animate-spin-slow rounded-full border border-dashed border-accent2/50" />
          <span className="absolute inset-[18px] rounded-full bg-accent shadow-[0_0_30px_rgb(var(--accent))]" />
        </div>
        <span className="eyebrow">{label}</span>
      </div>
    </div>
  )
}
