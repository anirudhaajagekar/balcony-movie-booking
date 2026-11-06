import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useStore } from '../store/useStore'
import { bookedSeatsFor, buildSeatMap, computeTotals, parseShowId, showtimesFor } from '../utils/shows'
import { formatDateLong, formatPrice, formatTime, showDateTime } from '../utils/format'
import { MonoBadge, SectionHeader } from '../components/ui'
import NotFound from './NotFound'

const MAX_SEATS = 10

export default function SeatSelection() {
  const { showId } = useParams()
  const show = parseShowId(showId)

  if (!show) return <NotFound message="We couldn’t find that show." />
  if (showDateTime(show.date, show.time) < new Date())
    return (
      <NotFound
        message="This show has already started."
        action={
          <Link to={`/movie/${show.movie.id}/shows`} className="btn-ghost">
            Pick another show
          </Link>
        }
      />
    )

  // `key` resets the selection when switching to another showtime.
  return <SeatPicker key={showId} show={show} />
}

function SeatPicker({ show }) {
  const { showId, movie, theatre, date, time } = show
  const navigate = useNavigate()
  const bookings = useStore((s) => s.bookings)
  const hold = useStore((s) => s.hold)
  const startHold = useStore((s) => s.startHold)
  const showToast = useStore((s) => s.showToast)

  const seatMap = useMemo(() => buildSeatMap(theatre), [theatre])
  const booked = useMemo(() => bookedSeatsFor(showId, bookings), [showId, bookings])
  const seatsById = useMemo(() => {
    const map = new Map()
    seatMap.forEach((b) => b.rows.forEach((r) => r.seats.forEach((s) => map.set(s.id, s))))
    return map
  }, [seatMap])

  // Coming back from checkout? Keep the seats that were held.
  const [selectedIds, setSelectedIds] = useState(() =>
    hold && hold.showId === showId && hold.expiresAt > Date.now() ? hold.seats.map((s) => s.id) : [],
  )

  const selectedSeats = selectedIds.map((id) => seatsById.get(id))
  const totals = computeTotals(selectedSeats)
  const otherTimes = showtimesFor(movie, theatre, date)

  const toggle = (seat) => {
    if (booked.has(seat.id)) return
    setSelectedIds((ids) => {
      if (ids.includes(seat.id)) return ids.filter((id) => id !== seat.id)
      if (ids.length >= MAX_SEATS) {
        showToast(`You can book up to ${MAX_SEATS} seats at a time.`)
        return ids
      }
      return [...ids, seat.id]
    })
  }

  const proceed = () => {
    startHold(showId, selectedSeats)
    navigate('/checkout')
  }

  // Lift the agent dock above the booking bar while it's showing.
  const setBottomBarOpen = useStore((s) => s.setBottomBarOpen)
  useEffect(() => {
    setBottomBarOpen(selectedIds.length > 0)
  }, [selectedIds.length, setBottomBarOpen])
  useEffect(() => () => setBottomBarOpen(false), [setBottomBarOpen])

  return (
    <div className={selectedIds.length ? 'pb-40' : 'pb-10'}>
      {/* Show summary */}
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-8">
        <Link
          to={`/movie/${movie.id}/shows?date=${date}`}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-muted uppercase hover:text-white"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" /> All showtimes
        </Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <SectionHeader as="h1" eyebrow="Step 2 of 3: choose seats" title={movie.title}>
            <MonoBadge className="mt-5">
              {theatre.name} / {formatDateLong(date)} / {formatTime(time)} / {show.format} / Screen {show.screen}
            </MonoBadge>
          </SectionHeader>
          {otherTimes.length > 1 && (
            <div aria-label="Other showtimes">
              <p className="mb-2 font-mono text-[0.68rem] font-bold text-muted uppercase">Same day, other times</p>
              <div className="flex flex-wrap gap-1.5">
                {otherTimes.map((s) => (
                  <Link
                    key={s.showId}
                    to={`/show/${s.showId}/seats`}
                    aria-current={s.time === time ? 'true' : undefined}
                    className={`rounded-md px-3 py-2 font-mono text-xs font-bold uppercase transition-colors ${
                      s.time === time ? 'bg-accent text-white shadow-[0_0_18px_-4px] shadow-accent/70' : 'border border-line text-fg/80 hover:border-muted hover:text-white'
                    }`}
                  >
                    {formatTime(s.time)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auditorium */}
      <div className="mx-auto mt-10 max-w-6xl sm:px-8">
        <div className="border-y border-line bg-panel pb-10 sm:rounded-xl sm:border">
          <FitToWidth>
            <div className="relative isolate w-max">
              {/* Screen, with red light falling across the seats */}
              <div className="mx-auto w-[min(100%,560px)] min-w-[320px]">
                <svg viewBox="0 0 560 50" className="w-full" aria-hidden="true">
                  <defs>
                    <linearGradient id="screen-line" x1="0" x2="1">
                      <stop offset="0" stopColor="#FF3B2F" stopOpacity="0" />
                      <stop offset=".5" stopColor="#FF6A5F" />
                      <stop offset="1" stopColor="#FF3B2F" stopOpacity="0" />
                    </linearGradient>
                    <filter id="screen-glow" x="-10%" y="-200%" width="120%" height="500%">
                      <feGaussianBlur stdDeviation="6" />
                    </filter>
                  </defs>
                  <path d="M10 44 Q280 -2 550 44" stroke="url(#screen-line)" strokeWidth="7" fill="none" filter="url(#screen-glow)" />
                  <path d="M10 44 Q280 -2 550 44" stroke="url(#screen-line)" strokeWidth="2.5" fill="none" />
                </svg>
                <p className="-mt-1 text-center font-mono text-[0.65rem] font-bold tracking-[0.3em] text-muted uppercase">Screen this way</p>
              </div>
              <div
                className="pointer-events-none absolute inset-x-0 top-6 -z-10 h-[75%]"
                style={{
                  background: 'linear-gradient(to bottom, rgb(255 59 47 / .10), rgb(255 59 47 / 0) 85%)',
                  clipPath: 'polygon(14% 0, 86% 0, 100% 100%, 0 100%)',
                }}
                aria-hidden="true"
              />

              <div className="mt-8 space-y-8">
                {seatMap.map((block) => (
                  <section key={block.category} aria-label={`${block.label} seats, ${formatPrice(block.price)} each`}>
                    <div className="mb-3 flex items-center gap-3">
                      <span className="h-px flex-1 bg-line" aria-hidden="true" />
                      <span className="font-mono text-xs font-bold tracking-wide text-accent uppercase">
                        {block.label} <span className="text-white">{formatPrice(block.price)}</span>
                      </span>
                      <span className="h-px flex-1 bg-line" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                      {block.rows.map((row) => (
                        <div key={row.row} className="flex items-center justify-center gap-1.5">
                          <span className="w-6 text-center font-mono text-xs font-bold text-muted" aria-hidden="true">
                            {row.row}
                          </span>
                          {row.seats.map((seat) => (
                            <Seat
                              key={seat.id}
                              seat={seat}
                              wide={block.category === 'recliner'}
                              isBooked={booked.has(seat.id)}
                              isSelected={selectedIds.includes(seat.id)}
                              onToggle={toggle}
                            />
                          ))}
                          <span className="w-6 text-center font-mono text-xs font-bold text-muted" aria-hidden="true">
                            {row.row}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </FitToWidth>

          <ul className="mt-10 flex flex-wrap justify-center gap-6 px-4 font-mono text-[0.7rem] font-bold text-muted uppercase" aria-label="Seat legend">
            <li className="flex items-center gap-2">
              <span className="size-4 rounded-t-md rounded-b-sm border border-white/35" /> Available
            </li>
            <li className="flex items-center gap-2">
              <span className="size-4 rounded-t-md rounded-b-sm bg-accent" /> Your seats
            </li>
            <li className="flex items-center gap-2">
              <span className="size-4 rounded-t-md rounded-b-sm bg-white/[0.07]" /> Sold
            </li>
          </ul>
        </div>
      </div>

      {/* Booking bar */}
      {selectedIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 animate-rise px-3 pb-3">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-xl border border-line bg-panel/95 py-3 pr-3 pl-5 shadow-2xl shadow-black/70 backdrop-blur-md">
            <div className="min-w-0">
              <p className="truncate font-mono text-sm font-bold">
                {selectedIds.length} {selectedIds.length === 1 ? 'seat' : 'seats'} / <span className="text-accent">{selectedIds.join(', ')}</span>
              </p>
              <p className="font-mono text-[0.7rem] text-muted uppercase">
                {formatPrice(totals.ticketTotal)}
                <span className="hidden sm:inline"> for tickets, fees added at payment</span>
              </p>
            </div>
            <button onClick={proceed} className="btn-primary shrink-0">
              Continue →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Seat({ seat, wide, isBooked, isSelected, onToggle }) {
  const base = `${wide ? 'w-10' : 'w-7'} h-7 rounded-t-lg rounded-b-sm font-mono text-[0.6rem] font-bold transition-colors`
  const state = isBooked
    ? 'bg-white/[0.07] text-transparent cursor-not-allowed'
    : isSelected
      ? 'bg-accent text-white animate-pop shadow-[0_0_16px_-2px] shadow-accent'
      : 'border border-white/35 text-white/60 hover:border-accent hover:text-accent'

  return (
    <>
      <button
        type="button"
        disabled={isBooked}
        onClick={() => onToggle(seat)}
        aria-pressed={isSelected}
        aria-label={`Row ${seat.row}, seat ${seat.number}, ${formatPrice(seat.price)}${isBooked ? ', sold' : ''}`}
        className={`${base} ${state}`}
      >
        {seat.number}
      </button>
      {seat.aisleAfter && <span className="w-5" aria-hidden="true" />}
    </>
  )
}

// Shrinks the seat map to fit small screens (down to `minScale`), and scrolls
// sideways for anything still too wide, starting from the middle of the hall.
function FitToWidth({ children, minScale = 0.55 }) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const [fit, setFit] = useState({ scale: 1, w: 0, h: 0 })

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    const measure = () => {
      const style = getComputedStyle(outer)
      const avail = outer.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      const w = inner.offsetWidth
      const h = inner.offsetHeight
      const scale = Math.min(1, Math.max(minScale, avail / w))
      setFit((f) => (f.scale === scale && f.w === w && f.h === h ? f : { scale, w, h }))
      outer.scrollLeft = Math.max(0, (w * scale - avail) / 2)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(outer)
    return () => ro.disconnect()
  }, [minScale])

  return (
    <div ref={outerRef} className="no-scrollbar overflow-x-auto px-2 pt-8 sm:px-6">
      <div className="relative mx-auto" style={fit.w ? { width: fit.w * fit.scale, height: fit.h * fit.scale } : undefined}>
        <div ref={innerRef} className="absolute top-0 left-0 w-max origin-top-left" style={{ transform: `scale(${fit.scale})` }}>
          {children}
        </div>
      </div>
    </div>
  )
}