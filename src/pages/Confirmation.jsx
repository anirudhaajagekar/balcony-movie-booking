import { Link, useLocation, useParams } from 'react-router-dom'
import { CircleCheck, Printer } from 'lucide-react'
import { useStore } from '../store/useStore'
import { parseShowId } from '../utils/shows'
import { formatPrice } from '../utils/format'
import Ticket from '../components/Ticket'
import NotFound from './NotFound'

export default function Confirmation() {
  const { bookingId } = useParams()
  const { state } = useLocation()
  const booking = useStore((s) => s.bookings.find((b) => b.id === bookingId))
  const show = booking ? parseShowId(booking.showId) : null

  if (!booking || !show) return <NotFound message="We couldn’t find that booking." />

  const justBooked = state?.justBooked && booking.status === 'confirmed'
  const { totals } = booking

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-8">
      <div className="print:hidden">
        {justBooked ? (
          <>
            <p className="eyebrow flex items-center gap-2">
              <CircleCheck className="size-4" aria-hidden="true" /> Payment received
            </p>
            <h1 className="heading mt-3 text-4xl sm:text-5xl">You’re All Set, {booking.contact.name.split(' ')[0]}.</h1>
            <p className="mt-3 max-w-xl text-muted">
              Show this QR code at the entrance. Your ticket is also saved in My bookings.
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">Booking {booking.id}</p>
            <h1 className="heading mt-3 text-4xl sm:text-5xl">Your Ticket</h1>
          </>
        )}
      </div>

      <div className="mt-10">
        <Ticket booking={booking} show={show} animate={justBooked} />
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
        <dl className="max-w-sm space-y-2 font-mono text-[0.8rem]">
          <div className="flex justify-between gap-6">
            <dt className="text-muted print:text-black">Tickets</dt>
            <dd className="tabular-nums">{formatPrice(totals.ticketTotal)}</dd>
          </div>
          <div className="flex justify-between gap-6">
            <dt className="text-muted print:text-black">Convenience fee and GST</dt>
            <dd className="tabular-nums">{formatPrice(totals.convenienceFee + totals.gst)}</dd>
          </div>
          <div className="flex justify-between gap-6 border-t border-line pt-2 font-bold text-white">
            <dt>Paid by {booking.paymentMethod}</dt>
            <dd className="tabular-nums">{formatPrice(totals.grandTotal)}</dd>
          </div>
          {booking.status === 'cancelled' && (
            <div className="flex justify-between gap-6 text-ok">
              <dt>Refunded after cancellation</dt>
              <dd className="tabular-nums">{formatPrice(totals.ticketTotal)}</dd>
            </div>
          )}
        </dl>

        <div className="flex flex-wrap gap-3 print:hidden">
          <button onClick={() => window.print()} className="btn-ghost">
            <Printer className="size-4" aria-hidden="true" /> Print ticket
          </button>
          <Link to="/bookings" className="btn-ghost">
            My bookings
          </Link>
          <Link to="/" className="btn-primary">
            Book another movie
          </Link>
        </div>
      </div>
    </div>
  )
}