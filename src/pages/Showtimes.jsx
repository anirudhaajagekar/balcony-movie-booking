import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getMovie, isNowShowing } from '../data/movies'
import { useStore } from '../store/useStore'
import { availabilityFor, bookableDates, scheduleFor } from '../utils/shows'
import { formatDuration, formatTime, parseISODate, relativeDayLabel } from '../utils/format'
import { MonoBadge, SectionHeader } from '../components/ui'
import NotFound from './NotFound'

const STATUS = {
  available: { label: 'Available', dot: 'bg-ok' },
  'filling-fast': { label: 'Filling fast', dot: 'bg-warn' },
  'almost-full': { label: 'Almost full', dot: 'bg-accent' },
}

export function DateStrip({ dates, value, onChange }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="radiogroup" aria-label="Choose a date">
      {dates.map((iso) => {
        const d = parseISODate(iso)
        const selected = iso === value
        return (
          <button
            key={iso}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(iso)}
            className={`w-[4.75rem] shrink-0 rounded-md border px-2 py-2.5 text-center transition-colors ${
              selected ? 'border-accent bg-accent text-white shadow-[0_0_18px_-4px] shadow-accent/70' : 'border-line bg-panel hover:border-muted'
            }`}
          >
            <span className={`block font-mono text-[0.65rem] font-bold uppercase ${selected ? 'text-white/80' : 'text-muted'}`}>
              {relativeDayLabel(iso)}
            </span>
            <span className="display block text-4xl">{String(d.getDate()).padStart(2, '0')}</span>
            <span className={`block font-mono text-[0.65rem] font-bold uppercase ${selected ? 'text-white/80' : 'text-muted'}`}>
              {d.toLocaleDateString('en-IN', { month: 'short' })}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function Showtimes() {
  const { movieId } = useParams()
  const [params, setParams] = useSearchParams()
  const city = useStore((s) => s.city)
  const bookings = useStore((s) => s.bookings)
  const movie = getMovie(movieId)

  const dates = bookableDates(7)
  const date = dates.includes(params.get('date')) ? params.get('date') : dates[0]

  if (!movie) return <NotFound message="We couldn’t find that movie." />
  if (!isNowShowing(movie))
    return (
      <NotFound
        message={`${movie.title} isn’t in cinemas yet.`}
        action={
          <Link to={`/movie/${movie.id}`} className="btn-ghost">
            See details
          </Link>
        }
      />
    )

  const schedule = scheduleFor(movie, city, date)
  const setDate = (iso) => setParams({ date: iso }, { replace: true })

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-8">
      <Link to={`/movie/${movie.id}`} className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-muted uppercase hover:text-white">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> {movie.title}
      </Link>

      <div className="mt-6">
        <SectionHeader as="h1" eyebrow="Step 1 of 3: pick a show" title={movie.title}>
          <MonoBadge className="mt-5">
            {movie.certificate} / {formatDuration(movie.duration)} / {movie.languages.join(', ')}
          </MonoBadge>
        </SectionHeader>
      </div>

      <div className="mt-10">
        <DateStrip dates={dates} value={date} onChange={setDate} />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-xs font-bold text-muted uppercase">
          {schedule.length} {schedule.length === 1 ? 'cinema' : 'cinemas'} in {city}
        </p>
        <ul className="flex flex-wrap gap-4 font-mono text-[0.68rem] font-bold text-muted uppercase" aria-label="Legend">
          {Object.values(STATUS).map((s) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      {schedule.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-line py-16 text-center">
          <p className="text-lg font-bold">All of today’s shows in {city} have started.</p>
          <p className="mt-1 text-muted">Tomorrow’s shows are open for booking.</p>
          <button onClick={() => setDate(dates[1])} className="btn-primary mt-6">
            See tomorrow’s shows
          </button>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {schedule.map(({ theatre, shows }, i) => (
            <li key={theatre.id} className="rounded-xl border border-line bg-panel p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="chip-red">{theatre.features[0]}</span>
                  <h2 className="mt-3 text-xl font-extrabold tracking-tight">{theatre.name}</h2>
                  <p className="mt-1 text-sm text-muted">{theatre.features.slice(1).join(', ') || 'Standard screens'}</p>
                </div>
                <span className="font-mono text-[0.65rem] text-muted">#CIN-{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {shows.map((s) => {
                  const status = STATUS[availabilityFor(s.showId, bookings)]
                  return (
                    <Link
                      key={s.showId}
                      to={`/show/${s.showId}/seats`}
                      className="group min-w-[7rem] rounded-md border border-line bg-ink px-3 py-2 transition-colors hover:border-accent"
                      aria-label={`${formatTime(s.time)}, ${s.format}, ${status.label}`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-bold text-white">{formatTime(s.time)}</span>
                        <span className={`size-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                      </span>
                      <span className="block font-mono text-[0.65rem] text-muted uppercase group-hover:text-fg">{s.format}</span>
                    </Link>
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-5 font-mono text-[0.7rem] text-muted uppercase">Tickets can be cancelled up to 2 hours before the show.</p>
    </div>
  )
}