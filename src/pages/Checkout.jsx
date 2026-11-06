import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Landmark, LoaderCircle, Smartphone, Timer } from 'lucide-react'
import { useStore, HOLD_MINUTES } from '../store/useStore'
import { bookedSeatsFor, computeTotals, parseShowId } from '../utils/shows'
import { formatDateLong, formatPrice, formatTime } from '../utils/format'
import { formatCountdown, useCountdown } from '../utils/useCountdown'
import { SEAT_CATEGORIES } from '../data/theatres'
import Poster from '../components/Poster'
import Modal from '../components/Modal'
import { SectionHeader } from '../components/ui'

const METHODS = [
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'netbanking', label: 'Net banking', icon: Landmark },
]

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Bank of Baroda', 'Punjab National Bank']

function validate(form, method) {
  const e = {}
  if (form.name.trim().length < 2) e.name = 'Enter your full name.'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email, like name@example.com.'
  if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a 10-digit mobile number.'
  if (method === 'upi' && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(form.upi)) e.upi = 'Enter a UPI ID, like yourname@okbank.'
  if (method === 'card') {
    if (form.cardNumber.replace(/\s/g, '').length !== 16) e.cardNumber = 'Card number should be 16 digits.'
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) e.expiry = 'Use MM/YY.'
    if (!/^\d{3}$/.test(form.cvv)) e.cvv = '3 digits on the back.'
  }
  if (method === 'netbanking' && !form.bank) e.bank = 'Choose your bank.'
  return e
}

function Field({ label, error, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input id={id} className={`field ${error ? 'border-accent' : ''}`} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...props} />
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  )
}

export default function Checkout() {
  const hold = useStore((s) => s.hold)
  const clearHold = useStore((s) => s.clearHold)
  const bookings = useStore((s) => s.bookings)
  const lastContact = useStore((s) => s.lastContact)
  const createBooking = useStore((s) => s.createBooking)
  const showToast = useStore((s) => s.showToast)
  const navigate = useNavigate()

  const remaining = useCountdown(hold?.expiresAt)
  const [method, setMethod] = useState('upi')
  const [errors, setErrors] = useState({})
  const [paying, setPaying] = useState(false)
  const [form, setForm] = useState({
    name: lastContact?.name ?? '',
    email: lastContact?.email ?? '',
    phone: lastContact?.phone ?? '',
    upi: '',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    bank: '',
  })

  const show = hold ? parseShowId(hold.showId) : null

  if (!hold || !show) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="eyebrow">Checkout</p>
        <h1 className="heading mt-3 text-3xl">You haven’t picked any seats yet.</h1>
        <p className="mt-2 text-muted">Choose a movie and a showtime to start booking.</p>
        <Link to="/" className="btn-primary mt-8">
          Browse movies
        </Link>
      </div>
    )
  }

  const { movie, theatre, date, time } = show
  const totals = computeTotals(hold.seats)
  const expired = remaining <= 0 && !paying

  // Group seats by category for the summary: "Premium: F7, F8".
  const groups = Object.entries(
    hold.seats.reduce((acc, s) => {
      ;(acc[s.category] ||= []).push(s)
      return acc
    }, {}),
  )

  const update = (key) => (e) => {
    let v = e.target.value
    if (key === 'phone') v = v.replace(/\D/g, '').slice(0, 10)
    if (key === 'cvv') v = v.replace(/\D/g, '').slice(0, 3)
    if (key === 'cardNumber') v = v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
    if (key === 'expiry') {
      v = v.replace(/\D/g, '').slice(0, 4)
      if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`
    }
    setForm((f) => ({ ...f, [key]: v }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const pay = (e) => {
    e.preventDefault()
    const found = validate(form, method)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }

    // Someone else may have booked these seats in another tab.
    const taken = bookedSeatsFor(hold.showId, bookings)
    if (hold.seats.some((s) => taken.has(s.id))) {
      showToast('Some of these seats were just booked. Please choose again.')
      clearHold()
      navigate(`/show/${hold.showId}/seats`)
      return
    }

    setPaying(true)
    // Pretend to talk to a payment gateway.
    setTimeout(() => {
      const booking = createBooking({
        showId: hold.showId,
        seats: hold.seats,
        totals,
        contact: { name: form.name.trim(), email: form.email.trim(), phone: form.phone },
        paymentMethod: METHODS.find((m) => m.id === method).label,
      })
      navigate(`/booking/${booking.id}`, { replace: true, state: { justBooked: true } })
    }, 1800)
  }

  const lowTime = remaining < 60_000

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-8">
      <Link to={`/show/${hold.showId}/seats`} className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-muted uppercase hover:text-white">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Change seats
      </Link>
      <div className="mt-6 flex items-end justify-between gap-4">
        <SectionHeader as="h1" eyebrow="Step 3 of 3: pay" title="Checkout" />
        {/* On small screens the summary sits below the form, so show the timer up here too. */}
        <p
          className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-sm font-bold tabular-nums lg:hidden ${lowTime ? 'border-accent bg-accent text-white' : 'border-accent/50 bg-accent/10 text-accent'}`}
          aria-hidden="true"
        >
          <Timer className="size-4" /> {formatCountdown(remaining)}
        </p>
      </div>

      <form onSubmit={pay} noValidate className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-panel p-5 sm:p-6" aria-labelledby="contact-h">
            <p className="eyebrow">01 / Contact</p>
            <h2 id="contact-h" className="heading mt-2 text-2xl">
              Your Details
            </h2>
            <p className="mt-1 text-sm text-muted">We use these to send your ticket.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field id="name" label="Full name" value={form.name} onChange={update('name')} error={errors.name} autoComplete="name" />
              </div>
              <Field id="email" type="email" label="Email" value={form.email} onChange={update('email')} error={errors.email} autoComplete="email" />
              <Field id="phone" type="tel" inputMode="numeric" label="Mobile number" value={form.phone} onChange={update('phone')} error={errors.phone} autoComplete="tel-national" placeholder="98765 43210" />
            </div>
          </section>

          <section className="rounded-xl border border-line bg-panel p-5 sm:p-6" aria-labelledby="pay-h">
            <p className="eyebrow">02 / Payment</p>
            <h2 id="pay-h" className="heading mt-2 text-2xl">
              Payment Method
            </h2>
            <p className="mt-1 text-sm text-muted">This is a demo, so no money will be charged.</p>

            <div className="mt-5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment method">
              {METHODS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={method === id}
                  onClick={() => {
                    setMethod(id)
                    setErrors({})
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-md border px-2 py-3 font-mono text-xs font-bold uppercase transition-colors sm:flex-row sm:justify-center ${
                    method === id ? 'border-accent bg-accent text-white shadow-[0_0_18px_-4px] shadow-accent/70' : 'border-line bg-ink text-fg hover:border-muted'
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-5">
              {method === 'upi' && (
                <Field id="upi" label="UPI ID" value={form.upi} onChange={update('upi')} error={errors.upi} placeholder="yourname@okbank" autoComplete="off" />
              )}
              {method === 'card' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field id="cardNumber" inputMode="numeric" label="Card number" value={form.cardNumber} onChange={update('cardNumber')} error={errors.cardNumber} placeholder="4111 1111 1111 1111" autoComplete="cc-number" />
                  </div>
                  <Field id="expiry" inputMode="numeric" label="Expiry" value={form.expiry} onChange={update('expiry')} error={errors.expiry} placeholder="MM/YY" autoComplete="cc-exp" />
                  <Field id="cvv" inputMode="numeric" type="password" label="CVV" value={form.cvv} onChange={update('cvv')} error={errors.cvv} placeholder="123" autoComplete="cc-csc" />
                </div>
              )}
              {method === 'netbanking' && (
                <div>
                  <label htmlFor="bank" className="field-label">
                    Bank
                  </label>
                  <select id="bank" value={form.bank} onChange={update('bank')} className={`field ${errors.bank ? 'border-accent' : ''}`}>
                    <option value="">Choose your bank</option>
                    {BANKS.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                  {errors.bank && <p className="mt-1.5 text-sm text-accent">{errors.bank}</p>}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-24" aria-labelledby="summary-h">
          <div
            className={`flex items-center gap-2 rounded-t-xl border border-b-0 px-5 py-3 font-mono text-xs font-bold uppercase ${lowTime ? 'border-accent bg-accent text-white' : 'border-accent/50 bg-accent/10 text-accent'}`}
            role="timer"
            aria-live={lowTime ? 'assertive' : 'off'}
          >
            <Timer className="size-4" aria-hidden="true" />
            Seats held for <span className="font-bold tabular-nums">{formatCountdown(remaining)}</span>
          </div>
          <div className="rounded-b-xl border border-line bg-panel p-5">
            <h2 id="summary-h" className="sr-only">
              Booking summary
            </h2>
            <div className="flex gap-4">
              <Poster movie={movie} showTitle={false} className="w-16 shrink-0" rounded="rounded-md" />
              <div className="min-w-0">
                <p className="text-lg leading-tight font-extrabold tracking-tight">{movie.title}</p>
                <p className="mt-1 font-mono text-[0.68rem] text-muted uppercase">
                  {movie.certificate}, {show.format}
                </p>
                <p className="mt-2 text-sm">
                  {formatDateLong(date)}, {formatTime(time)}
                </p>
                <p className="text-sm text-muted">{theatre.name}</p>
              </div>
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-dashed border-line pt-5 font-mono text-[0.8rem]">
              {groups.map(([cat, seats]) => (
                <div key={cat} className="flex justify-between gap-4">
                  <dt className="text-muted">
                    {SEAT_CATEGORIES[cat].label}: <span className="text-fg">{seats.map((s) => s.id).join(', ')}</span>
                  </dt>
                  <dd className="tabular-nums">{formatPrice(seats.reduce((a, s) => a + s.price, 0))}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Convenience fee</dt>
                <dd className="tabular-nums">{formatPrice(totals.convenienceFee)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">GST on fee (18%)</dt>
                <dd className="tabular-nums">{formatPrice(totals.gst)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-3 text-base font-bold text-white">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(totals.grandTotal)}</dd>
              </div>
            </dl>

            <button type="submit" disabled={paying} className="btn-primary mt-6 w-full py-4 text-base">
              {paying ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> Confirming your seats
                </>
              ) : (
                `Pay ${formatPrice(totals.grandTotal)}`
              )}
            </button>
          </div>
        </aside>
      </form>

      <Modal open={expired} dismissible={false} title="Your seats were released">
        <p className="text-muted">
          Seats are held for {HOLD_MINUTES} minutes while you pay. Pick your seats again to continue.
        </p>
        <button
          onClick={() => {
            const id = hold.showId
            clearHold()
            navigate(`/show/${id}/seats`)
          }}
          className="btn-primary mt-6 w-full"
        >
          Choose seats again
        </button>
      </Modal>
    </div>
  )
}