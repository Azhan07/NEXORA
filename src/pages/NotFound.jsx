import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 text-center">
      <div aria-hidden className="grid-bg absolute inset-0" />
      <div aria-hidden className="absolute h-96 w-96 rounded-full bg-accent/15 blur-[120px]" />
      <div className="relative">
        <p className="eyebrow">Signal lost</p>
        <h1 className="text-gradient mt-4 font-display text-8xl font-bold md:text-9xl">404</h1>
        <p className="mt-4 text-muted">This coordinate doesn’t exist in the NEXORA universe.</p>
        <Link to="/" className="btn-primary mt-8"><ArrowLeft size={16} /> Back to home</Link>
      </div>
    </div>
  )
}
