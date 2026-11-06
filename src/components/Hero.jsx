import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FEATURED } from '../data/movies'
import { useStore } from '../store/useStore'
import { nextShows, theatresShowingMovie } from '../utils/shows'
import { formatDuration, formatTime, formatVotes, relativeDayLabel } from '../utils/format'
import { MonoBadge, NumberedList, OutlineWord, PosterFrame, StatRow, TitleBlock } from './ui'

const SLIDE_MS = 9000

// Home page hero, laid out like the reel's portfolio hero:
// giant outlined word, script + red title box, badge, stats, red poster frame
// and a numbered list on the right (which switches the featured movie).
export default function Hero() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const city = useStore((s) => s.city)
  const movie = FEATURED[index]
  const shows = nextShows(movie, city, 3)
  const cinemas = theatresShowingMovie(movie, city).length

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (paused || reduce) return
    const t = setTimeout(() => setIndex((i) => (i + 1) % FEATURED.length), SLIDE_MS)
    return () => clearTimeout(t)
  }, [index, paused])

  return (
    <section
      className="relative isolate overflow-hidden pb-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured movies"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(45% 45% at 52% 62%, rgb(255 59 47 / 0.16), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-8">
        <OutlineWord>Showtime</OutlineWord>

        <div className="relative -mt-[5vw] grid gap-12 lg:-mt-[4.5rem] lg:grid-cols-12 lg:gap-8">
          {/* Left: title, badge, text, buttons, stats */}
          <div key={`l-${movie.id}`} className="animate-rise lg:col-span-5">
            <TitleBlock script="Tonight, catch" title={movie.title} />

            <MonoBadge className="mt-7">
              {movie.certificate} / {movie.genres.join(' & ')} / {formatDuration(movie.duration)}
            </MonoBadge>

            <p className="mt-6 max-w-md leading-relaxed text-fg/75">
              <strong className="font-bold text-white">{movie.tagline}</strong> {movie.synopsis.split('. ')[0]}.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={`/movie/${movie.id}/shows`} className="btn-primary">
                Book tickets →
              </Link>
              <Link to={`/movie/${movie.id}`} className="btn-ghost">
                Explore movie
              </Link>
            </div>

            <StatRow
              className="mt-10"
              stats={[
                { value: movie.rating.toFixed(1), label: 'Audience rating' },
                { value: formatVotes(movie.votes), label: 'Votes' },
                { value: cinemas, label: `Cinemas in ${city}` },
              ]}
            />
          </div>

          {/* Centre: poster on red */}
          <div className="lg:col-span-4 lg:pt-16">
            <Link
              key={`p-${movie.id}`}
              to={`/movie/${movie.id}`}
              className="mx-auto block max-w-[19rem] animate-fade"
              aria-label={`About ${movie.title}`}
            >
              <PosterFrame movie={movie} chip={`Now showing in ${city}`} />
            </Link>
          </div>

          {/* Right: featured list and next shows */}
          <div className="lg:col-span-3 lg:pt-16">
            <p className="font-mono text-xs font-bold text-muted uppercase">Featured this week</p>
            <div className="mt-2">
              <NumberedList
                label="Featured movies"
                items={FEATURED.map((m, i) => ({
                  key: m.id,
                  title: m.title,
                  desc: m.genres.join(', '),
                  tag: m.formats.at(-1),
                  active: i === index,
                  onClick: () => setIndex(i),
                }))}
              />
              <div className="h-0.5 overflow-hidden bg-line" aria-hidden="true">
                <div
                  key={`${movie.id}-${paused}`}
                  className="h-full origin-left bg-accent"
                  style={{ animation: paused ? 'none' : `hero-progress ${SLIDE_MS}ms linear forwards`, transform: paused ? 'scaleX(1)' : undefined }}
                />
              </div>
            </div>

            {shows.length > 0 && (
              <div className="mt-8">
                <p className="font-mono text-xs font-bold text-muted uppercase">
                  Next shows, {relativeDayLabel(shows[0].date).toLowerCase()}
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {shows.map((s) => (
                    <Link
                      key={s.showId}
                      to={`/show/${s.showId}/seats`}
                      className="group flex items-center justify-between gap-3 rounded-md border border-line bg-panel px-3 py-2 hover:border-accent"
                    >
                      <span className="font-mono text-sm font-bold text-white">{formatTime(s.time)}</span>
                      <span className="truncate text-xs text-muted group-hover:text-fg">{s.theatre.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}