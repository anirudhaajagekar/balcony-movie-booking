import { QRCodeSVG } from 'qrcode.react'
import { SEAT_CATEGORIES } from '../data/theatres'
import { formatDateLong, formatTime } from '../utils/format'
import Poster from './Poster'

function Detail({ label, children, className = '' }) {
  return (
    <div className={className}>
      <dt className="font-mono text-[0.65rem] font-bold tracking-wide text-muted uppercase print:text-black">{label}</dt>
      <dd className="mt-1 font-bold">{children}</dd>
    </div>
  )
}

export default function Ticket({ booking, show, animate = false }) {
  const { movie, theatre, date, time } = show
  const cancelled = booking.status === 'cancelled'
  const categories = [...new Set(booking.seats.map((s) => SEAT_CATEGORIES[s.category].label))].join(', ')
  const qrValue = JSON.stringify({ id: booking.id, show: booking.showId, seats: booking.seats.map((s) => s.id) })

  return (
    <article
      className={`relative grid overflow-hidden rounded-xl border border-line bg-panel text-fg shadow-2xl shadow-black/60 md:grid-cols-[1fr_auto] print:border-black print:bg-white print:text-black print:shadow-none ${animate ? 'animate-print' : ''}`}
      aria-label={`Ticket ${booking.id}`}
    >
      <div className="flex gap-5 p-6 sm:p-8">
        <Poster movie={movie} showTitle={false} className="hidden w-24 shrink-0 self-start sm:block" rounded="rounded-md" />
        <div className="min-w-0 flex-1">
          <span className="chip-red">● Admit {booking.seats.length}</span>
          <h2 className="display mt-3 text-5xl text-white uppercase sm:text-6xl print:text-black">{movie.title}</h2>
          <p className="mt-1 font-mono text-[0.7rem] font-bold text-muted uppercase print:text-black">
            {movie.certificate} / {show.format} / {movie.languages[0]}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
            <Detail label="Date">{formatDateLong(date)}</Detail>
            <Detail label="Time">{formatTime(time)}</Detail>
            <Detail label="Screen">{show.screen}</Detail>
            <Detail label="Cinema" className="col-span-2 sm:col-span-3">
              {theatre.name}
            </Detail>
            <div className="col-span-2 sm:col-span-3">
              <dt className="font-mono text-[0.65rem] font-bold tracking-wide text-muted uppercase print:text-black">
                {booking.seats.length} {booking.seats.length === 1 ? 'seat' : 'seats'}, {categories}
              </dt>
              <dd className="display mt-1 text-4xl text-accent print:text-black">{booking.seats.map((s) => s.id).join('  ')}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Tear-off stub in signal red */}
      <div className="relative flex flex-col items-center justify-center gap-3 border-t-2 border-dashed border-ink/40 bg-accent px-8 py-7 md:border-t-0 md:border-l-2 print:border-black print:bg-white">
        <span className="absolute -top-3 -left-3 size-6 rounded-full bg-ink print:hidden" aria-hidden="true" />
        <span className="absolute -top-3 -right-3 size-6 rounded-full bg-ink md:top-auto md:-bottom-3 md:-left-3 md:right-auto print:hidden" aria-hidden="true" />
        <div className={`bg-white p-3 ${cancelled ? 'opacity-30' : ''}`}>
          <QRCodeSVG value={qrValue} size={128} level="M" bgColor="#ffffff" fgColor="#0A0A0A" />
        </div>
        <div className="text-center">
          <p className="font-mono text-[0.65rem] font-bold text-white/80 uppercase print:text-black">Booking ID</p>
          <p className="font-mono font-bold tracking-wider text-white print:text-black">{booking.id}</p>
        </div>
      </div>

      {cancelled && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
          <span className="display -rotate-12 border-4 border-accent bg-ink/80 px-6 pt-2 pb-1 text-7xl text-accent uppercase">Cancelled</span>
        </div>
      )}
    </article>
  )
}