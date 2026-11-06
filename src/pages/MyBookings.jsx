import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { parseShowId } from '../utils/shows'
import { formatDateLong, formatPrice, formatTime, showDateTime } from '../utils/format'
import Poster from '../components/Poster'
import Modal from '../components/Modal'
import { SectionHeader } from '../components/ui'

const CANCEL_CUTOFF_MS = 2 * 60 * 60 * 1000

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'cancelled', label: 'Cancelled' },
]

const EMPTY = {
  upcoming: 'No upcoming shows. Find something to watch.',
  past: 'Movies you’ve watched will show up here.',
  cancelled: 'You haven’t cancelled any bookings.',
}

export default function MyBookings() {
  const bookings = useStore((s) => s.bookings)
  const cancelBooking = useStore((s) => s.cancelBooking)
  const showToast = useStore((s) => s.showToast)
  const [tab, setTab] = useState('upcoming')
  const [toCancel, setToCancel] = useState(null)

  const now = new Date()
  const enriched = bookings
    .map((b) => {
      const show = parseShowId(b.showId)
      return show ? { ...b, show, at: showDateTime(show.date, show.time) } : null
    })
    .filter(Boolean)

  const lists = {
    upcoming: enriched.filter((b) => b.status === 'confirmed' && b.at > now).sort((a, b) => a.at - b.at),
    past: enriched.filter((b) => b.status === 'confirmed' && b.at <= now).sort((a, b) => b.at - a.at),
    cancelled: enriched.filter((b) => b.status === 'cancelled'),
  }
  const list = lists[tab]

  const confirmCancel = () => {
    cancelBooking(toCancel.id)
    showToast(`Booking cancelled. ${formatPrice(toCancel.totals.ticketTotal)} will be refunded.`)
    setToCancel(null)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-8">
      <SectionHeader as="h1" eyebrow="Your tickets" title="My Bookings" />

      <div className="mt-8 flex gap-1.5" role="tablist" aria-label="Booking status">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-2 font-mono text-xs font-bold uppercase transition-colors ${
              tab === t.id ? 'bg-accent text-white shadow-[0_0_18px_-4px] shadow-accent/70' : 'text-fg/80 hover:bg-raised hover:text-white'
            }`}
          >
            {t.label} ({lists[t.id].length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line py-20 text-center">
          <p className="text-lg text-muted">{EMPTY[tab]}</p>
          {tab === 'upcoming' && (
            <Link to="/" className="btn-primary mt-6">
              Browse movies
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {list.map((b) => {
            const { movie, theatre, date, time } = b.show
            const canCancel = b.status === 'confirmed' && b.at - now > CANCEL_CUTOFF_MS
            return (
              <li key={b.id} className="flex gap-4 rounded-xl border border-line bg-panel p-4 sm:gap-6 sm:p-5">
                <Link to={`/booking/${b.id}`} className="shrink-0 rounded-md">
                  <Poster movie={movie} showTitle={false} className="w-16 sm:w-20" rounded="rounded-md" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <h2 className="text-xl font-extrabold tracking-tight">{movie.title}</h2>
                    <p className="font-mono font-bold text-white tabular-nums">{formatPrice(b.totals.grandTotal)}</p>
                  </div>
                  <p className="mt-1 font-mono text-xs font-bold uppercase">
                    {formatDateLong(date)}, {formatTime(time)}
                  </p>
                  <p className="text-sm text-muted">{theatre.name}</p>
                  <p className="mt-2 font-mono text-xs text-muted uppercase">
                    Seats <span className="font-bold text-accent">{b.seats.map((s) => s.id).join(', ')}</span>
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link to={`/booking/${b.id}`} className="btn-ghost px-3 py-2 text-xs">
                      View ticket
                    </Link>
                    {b.status === 'confirmed' &&
                      b.at > now &&
                      (canCancel ? (
                        <button onClick={() => setToCancel(b)} className="rounded-md px-3 py-2 font-mono text-xs font-bold text-accent uppercase hover:bg-accent/10">
                          Cancel booking
                        </button>
                      ) : (
                        <span className="font-mono text-[0.68rem] text-muted uppercase">Cancellation closes 2 hours before the show.</span>
                      ))}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Modal open={!!toCancel} onClose={() => setToCancel(null)} title="Cancel this booking?">
        {toCancel && (
          <>
            <p className="text-muted">
              Seats {toCancel.seats.map((s) => s.id).join(', ')} for {toCancel.show.movie.title} will be released.{' '}
              {formatPrice(toCancel.totals.ticketTotal)} will be refunded to your {toCancel.paymentMethod} account in 5 to 7 working
              days. The convenience fee isn’t refundable.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setToCancel(null)} className="btn-ghost">
                Keep booking
              </button>
              <button onClick={confirmCancel} className="btn-primary">
                Cancel booking
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}