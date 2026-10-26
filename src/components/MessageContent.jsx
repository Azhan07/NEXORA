import { Fragment } from 'react'

/** Renders **bold**, *italic* and `code` inside a line. */
function Inline({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i} className="font-semibold text-fg">{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`') && p.length > 2)
      return <code key={i} className="rounded-md bg-line/10 px-1.5 py-0.5 font-mono text-[0.85em] text-accent">{p.slice(1, -1)}</code>
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i} className="text-muted">{p.slice(1, -1)}</em>
    return <Fragment key={i}>{p}</Fragment>
  })
}

function TextBlock({ text }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim())
  return paragraphs.map((para, i) => {
    const lines = para.split('\n')
    if (lines.every((l) => /^\s*-\s/.test(l))) {
      return (
        <ul key={i} className="my-2 space-y-1.5">
          {lines.map((l, j) => (
            <li key={j} className="flex gap-2.5">
              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span><Inline text={l.replace(/^\s*-\s/, '')} /></span>
            </li>
          ))}
        </ul>
      )
    }
    return (
      <p key={i} className="my-2">
        {lines.map((l, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            <Inline text={l} />
          </Fragment>
        ))}
      </p>
    )
  })
}

/** Tiny markdown renderer — safe for partially streamed text (unclosed code fences). */
export default function MessageContent({ text, streaming = false }) {
  const segments = text.split('```')
  return (
    <div className="text-[14.5px] leading-relaxed text-fg/90">
      {segments.map((seg, i) => {
        if (i % 2 === 1) {
          const code = seg.replace(/^[a-z]*\n/i, '')
          const lang = seg.match(/^([a-z]+)\n/i)?.[1]
          return (
            <div key={i} className="my-3 overflow-hidden rounded-xl border border-line/10 bg-bg/70">
              {lang && <div className="border-b border-line/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">{lang}</div>}
              <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-fg/85"><code>{code}</code></pre>
            </div>
          )
        }
        return <TextBlock key={i} text={seg} />
      })}
      {streaming && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-blink bg-accent" />}
    </div>
  )
}
