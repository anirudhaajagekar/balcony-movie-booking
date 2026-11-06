// Small building blocks that give the app its look (taken from the reel):
// the giant outlined word, the script + red title box, monospace badges,
// red stat numbers, the red poster frame and the numbered side list.

import Poster from './Poster'

// Giant red-outlined word that sits behind a hero, like "PORTFOLIO" in the reel.
// The font size shrinks for longer words so it always fits on one line.
export function OutlineWord({ children, className = '' }) {
  const len = String(children).length
  return (
    <div
      aria-hidden="true"
      className={`outline-word pointer-events-none uppercase ${className}`}
      style={{ fontSize: `min(${Math.min(26, 205 / len)}vw, ${Math.min(21, 165 / len)}rem)` }}
    >
      {children}
    </div>
  )
}

// "Hello, I'm" in handwriting, then a name in a red box.
export function TitleBlock({ script, title, as: Tag = 'h1', size = 'text-[clamp(3rem,7vw,5.5rem)]' }) {
  return (
    <div>
      {script && <p className="font-script relative z-10 -mb-2 -rotate-2 text-3xl text-white drop-shadow-[0_2px_6px_rgb(0_0_0/0.8)] sm:text-4xl">{script}</p>}
      <Tag className={`display leading-[1.12] text-white uppercase ${size}`}>
        <span className="bg-accent box-decoration-clone px-3 pt-1.5 shadow-[0_0_40px_-8px] shadow-accent/60">{title}.</span>
      </Tag>
    </div>
  )
}

// Monospace badge with a red dot: "● SYSTEM ARCHITECT & AUTONOMOUS OPERATOR"
export function MonoBadge({ children, className = '' }) {
  return (
    <p className={`inline-flex items-center gap-2 rounded border border-line bg-panel px-3 py-2 font-mono text-xs font-bold tracking-wide text-fg uppercase ${className}`}>
      <span className="size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px] shadow-accent" aria-hidden="true" />
      {children}
    </p>
  )
}

// Red numbers with small monospace labels: "478 MCP Tools"
export function StatRow({ stats, className = '' }) {
  return (
    <dl className={`flex flex-wrap gap-x-8 gap-y-4 ${className}`}>
      {stats.map((s) => (
        <div key={s.label} className="flex items-baseline gap-1.5">
          <dd className="order-1 font-mono text-2xl font-bold text-accent">{s.value}</dd>
          <dt className="order-2 max-w-[6rem] font-mono text-[0.7rem] leading-tight font-bold text-muted uppercase">{s.label}</dt>
        </div>
      ))}
    </dl>
  )
}

// Poster on a red backing with a status chip, like the reel's portrait.
export function PosterFrame({ movie, chip, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <div className="bg-accent p-3 shadow-[0_0_80px_-12px] shadow-accent/60">
        <Poster movie={movie} rounded="rounded-none" />
      </div>
      {chip && (
        <p className="absolute -bottom-3 left-4 inline-flex items-center gap-2 border border-accent bg-ink px-2.5 py-1.5 font-mono text-[0.68rem] font-bold tracking-wide text-white uppercase">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          {chip}
        </p>
      )}
    </div>
  )
}

// "01. Autonomous Core / RUNTIME" style list. Items can be buttons.
export function NumberedList({ items, label }) {
  return (
    <ol className="divide-y divide-line/70" aria-label={label}>
      {items.map((item, i) => {
        const body = (
          <>
            <span className="flex items-center justify-between gap-3">
              <span className={`font-mono text-xs font-bold ${item.active ? 'text-accent' : 'text-muted'}`}>
                {String(i + 1).padStart(2, '0')}.
              </span>
              {item.tag && <span className="font-mono text-[0.65rem] font-bold tracking-wide text-muted uppercase">{item.tag}</span>}
            </span>
            <span className={`mt-1 block font-bold tracking-tight ${item.active ? 'text-white' : 'text-fg/85'}`}>{item.title}</span>
            {item.desc && <span className="mt-0.5 block text-sm text-muted">{item.desc}</span>}
          </>
        )
        return (
          <li key={item.key ?? item.title}>
            {item.onClick ? (
              <button
                onClick={item.onClick}
                aria-pressed={item.active}
                className={`block w-full border-l-2 py-3 pr-1 pl-3 text-left transition-colors ${item.active ? 'border-accent bg-accent/[0.06]' : 'border-transparent hover:bg-raised'}`}
              >
                {body}
              </button>
            ) : (
              <div className="py-3">{body}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

// "// 01.00 SEC_NOW_SHOWING INDEX (01/03)"
export function SectionIndex({ n, total, name }) {
  const nn = String(n).padStart(2, '0')
  return (
    <p className="font-mono text-xs text-muted uppercase" aria-hidden="true">
      // {nn}.00 SEC_{name} INDEX ({nn}/{String(total).padStart(2, '0')})
    </p>
  )
}

// Red eyebrow, big bold heading and an optional line of text under it.
export function SectionHeader({ eyebrow, title, sub, id, as: Tag = 'h2', children }) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <Tag id={id} className="heading mt-3 text-4xl sm:text-5xl">
        {title}
      </Tag>
      {sub && <p className="mt-3 max-w-2xl text-muted">{sub}</p>}
      {children}
    </div>
  )
}

// Monospace tab pills. The selected one is filled red, like "ALL SYSTEMS (6)".
export function TabPills({ options, value, onChange, label }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="radiogroup" aria-label={label}>
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`shrink-0 rounded-md px-3 py-2 font-mono text-xs font-bold tracking-wide uppercase transition-colors ${
              selected ? 'bg-accent text-white shadow-[0_0_18px_-4px] shadow-accent/70' : 'text-fg/80 hover:bg-raised hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}