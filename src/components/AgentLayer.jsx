// The "agentic build" effect from the reel: coloured cursors move around the
// page, select elements with blue boxes (showing their size) and move on.
// The dock at the bottom shows how many "layers" have been built, and has
// Tour (auto-scroll), speed and show/hide controls.
//
// It is purely decorative: cursors ignore clicks (pointer-events: none) and
// the effect is off by default for people who prefer reduced motion.

import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useStore } from '../store/useStore'

const AGENT_COLORS = ['#2DD4BF', '#FACC15', '#A78BFA', '#FB923C', '#F472B6', '#4ADE80', '#60A5FA', '#F87171']
const CANDIDATES = 'main h1, main h2, main h3, main p, main a, main button, main [role="img"], main li, main dd, main [data-agent]'

const rand = (a, b) => a + Math.random() * (b - a)

// Elements an agent could "work on": visible, a sensible size, on screen.
function visibleTargets() {
  const vh = window.innerHeight
  const vw = window.innerWidth
  return [...document.querySelectorAll(CANDIDATES)].filter((el) => {
    const r = el.getBoundingClientRect()
    return r.width > 28 && r.height > 12 && r.width < vw * 0.9 && r.height < vh * 0.7 && r.top > 70 && r.bottom < vh - 70
  })
}

function useIsSmall() {
  const [small, setSmall] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const on = () => setSmall(window.innerWidth < 640)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return small
}

export default function AgentLayer() {
  const on = useStore((s) => s.agentsOn)
  const speed = useStore((s) => s.agentSpeed)
  const small = useIsSmall()
  const count = small ? 4 : AGENT_COLORS.length

  if (!on) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-[45] overflow-hidden print:hidden" aria-hidden="true">
      {AGENT_COLORS.slice(0, count).map((color, i) => (
        <Agent key={color} color={color} speed={speed} delay={i * 350} />
      ))}
    </div>
  )
}

function Agent({ color, speed, delay }) {
  const [pos, setPos] = useState(() => ({
    x: rand(0.1, 0.9) * window.innerWidth,
    y: window.scrollY + rand(0.2, 0.8) * window.innerHeight,
  }))
  const [box, setBox] = useState(null)
  const timers = useRef([])
  const { pathname } = useLocation()

  // Drop any selection box left over from the previous page.
  useEffect(() => setBox(null), [pathname])

  useEffect(() => {
    const later = (fn, ms) => {
      timers.current.push(setTimeout(fn, ms))
      if (timers.current.length > 12) timers.current.shift() // old ones have already fired
    }
    const moveMs = 900 / speed
    const holdMs = 1500 / speed

    const step = () => {
      const targets = visibleTargets()
      const el = targets[Math.floor(Math.random() * targets.length)]
      if (!el) {
        setPos({ x: rand(0.1, 0.9) * window.innerWidth, y: window.scrollY + rand(0.2, 0.8) * window.innerHeight })
        later(step, moveMs + 400)
        return
      }
      const r = el.getBoundingClientRect()
      setPos({ x: r.left + r.width * rand(0.15, 0.85), y: window.scrollY + r.top + r.height * rand(0.3, 0.9) })
      later(() => {
        if (!el.isConnected) return // the page changed while the cursor was moving
        const r2 = el.getBoundingClientRect()
        if (r2.width < 2 || r2.height < 2) return
        setBox({ left: r2.left, top: r2.top + window.scrollY, width: r2.width, height: r2.height })
      }, moveMs)
      later(() => setBox(null), moveMs + holdMs)
      later(step, moveMs + holdMs + rand(150, 900) / speed)
    }

    later(step, delay)
    const pending = timers.current
    return () => {
      pending.forEach(clearTimeout)
      timers.current = []
    }
  }, [speed, delay])

  const moveMs = 900 / speed
  return (
    <>
      {box && (
        <div className="absolute animate-fade border border-agent bg-agent/[0.06]" style={{ left: box.left - 3, top: box.top - 3, width: box.width + 6, height: box.height + 6 }}>
          {[
            '-top-[3px] -left-[3px]',
            '-top-[3px] -right-[3px]',
            '-bottom-[3px] -left-[3px]',
            '-bottom-[3px] -right-[3px]',
          ].map((p) => (
            <span key={p} className={`absolute size-[6px] border border-agent bg-white ${p}`} />
          ))}
          <span className="absolute top-full left-1/2 mt-1.5 -translate-x-1/2 rounded-sm bg-agent px-1 py-px font-mono text-[9px] leading-tight whitespace-nowrap text-white">
            {Math.round(box.width)} × {Math.round(box.height)}
          </span>
        </div>
      )}
      <svg
        viewBox="0 0 16 16"
        className="absolute top-0 left-0 size-4 drop-shadow-[0_1px_2px_rgba(0,0,0,.6)]"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          transition: `transform ${moveMs}ms cubic-bezier(.45,.05,.25,1)`,
        }}
      >
        <path d="M1.5 1.2 14 6.6 8.6 8.6 6.4 14.2Z" fill={color} stroke="#0A0A0A" strokeWidth="1.1" strokeLinejoin="round" />
      </svg>
    </>
  )
}

// ---------- Dock ----------

function useLayerProgress() {
  const { pathname } = useLocation()
  const [layers, setLayers] = useState({ built: 0, total: 0 })

  useEffect(() => {
    let maxBuilt = 0
    let raf = 0
    const measure = () => {
      raf = 0
      const els = document.querySelectorAll(CANDIDATES)
      const vh = window.innerHeight
      let built = 0
      els.forEach((el) => {
        if (el.getBoundingClientRect().top < vh) built++
      })
      maxBuilt = Math.max(maxBuilt, built)
      setLayers({ built: Math.min(maxBuilt, els.length), total: els.length })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    const first = setTimeout(measure, 120)
    const poll = setInterval(measure, 2000) // pages change as you book
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      clearTimeout(first)
      clearInterval(poll)
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  return layers
}

// "Tour" scrolls the page slowly from top to bottom, like the reel's camera.
function useTour() {
  const touring = useStore((s) => s.touring)
  const setTouring = useStore((s) => s.setTouring)
  const speed = useStore((s) => s.agentSpeed)

  useEffect(() => {
    if (!touring) return
    let raf
    const tick = () => {
      window.scrollBy(0, 1.6 * speed)
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        setTouring(false)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    const stop = () => setTouring(false)
    raf = requestAnimationFrame(tick)
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('keydown', stop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('keydown', stop)
    }
  }, [touring, speed, setTouring])

  return touring
}

export function AgentDock() {
  const on = useStore((s) => s.agentsOn)
  const speed = useStore((s) => s.agentSpeed)
  const toggleAgents = useStore((s) => s.toggleAgents)
  const cycleSpeed = useStore((s) => s.cycleSpeed)
  const setTouring = useStore((s) => s.setTouring)
  const raised = useStore((s) => s.bottomBarOpen)
  const touring = useTour()
  const { built, total } = useLayerProgress()
  const small = useIsSmall()
  const agents = on ? (small ? 4 : AGENT_COLORS.length) : 0
  const pct = total ? Math.round((built / total) * 100) : 0

  return (
    <div
      className={`fixed left-1/2 z-40 -translate-x-1/2 transition-[bottom] duration-300 print:hidden ${raised ? 'bottom-[5.75rem]' : 'bottom-4'}`}
    >
      <div className="flex items-center gap-2.5 rounded-full border border-line bg-panel/90 py-1.5 pr-1.5 pl-2.5 font-mono text-[0.68rem] font-bold whitespace-nowrap text-fg shadow-2xl shadow-black/60 backdrop-blur-md sm:gap-3">
        <span className="flex -space-x-1.5" aria-hidden="true">
          {AGENT_COLORS.slice(0, 5).map((c) => (
            <span key={c} className="size-3.5 rounded-full border-2 border-panel" style={{ background: on ? c : '#3a3a3a' }} />
          ))}
        </span>
        <span>{agents} agents</span>
        <span className="hidden items-center gap-2 sm:flex">
          <span>
            {built} / {total} layers
          </span>
          <span className="h-1 w-14 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <span className="block h-full bg-agent transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </span>
        </span>
        <button
          onClick={() => setTouring(!touring)}
          aria-pressed={touring}
          className={`rounded-full px-2.5 py-1 transition-colors ${touring ? 'bg-agent text-white' : 'bg-agent/15 text-agent hover:bg-agent/25'}`}
        >
          {touring ? 'Touring' : 'Tour'}
        </button>
        <button onClick={cycleSpeed} className="rounded-full px-1.5 py-1 text-muted hover:text-white" aria-label={`Agent speed ${speed}x, change`}>
          {speed}x
        </button>
        <button
          onClick={toggleAgents}
          className="grid size-7 place-items-center rounded-full text-muted hover:bg-raised hover:text-white"
          aria-label={on ? 'Hide agent cursors' : 'Show agent cursors'}
          aria-pressed={on}
        >
          {on ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
        </button>
      </div>
    </div>
  )
}

// Thin red line on the left edge that fills as you scroll.
export function ScrollRail() {
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setP(max > 0 ? window.scrollY / max : 0)
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])
  return (
    <div className="fixed top-0 left-0 z-40 hidden h-full w-[2px] bg-line/40 md:block print:hidden" aria-hidden="true">
      <div className="h-full w-full origin-top bg-accent shadow-[0_0_10px] shadow-accent" style={{ transform: `scaleY(${p})` }} />
    </div>
  )
}