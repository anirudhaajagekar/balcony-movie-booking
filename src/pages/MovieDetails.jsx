import { Link, useParams } from 'react-router-dom'
import { getMovie, isNowShowing, NOW_SHOWING } from '../data/movies'
import { useStore } from '../store/useStore'
import { theatresShowingMovie } from '../utils/shows'
import { formatDuration, formatReleaseDate, formatVotes, initials } from '../utils/format'
import MovieCard from '../components/MovieCard'
import { MonoBadge, NumberedList, OutlineWord, PosterFrame, SectionHeader, SectionIndex, StatRow, TitleBlock } from '../components/ui'
import NotFound from './NotFound'

export default function MovieDetails() {
  const { movieId } = useParams()
  const city = useStore((s) => s.city)
  const movie = getMovie(movieId)
  if (!movie) return <NotFound message="We couldn’t find that movie." />

  const nowShowing = isNowShowing(movie)
  const similar = NOW_SHOWING.filter((m) => m.id !== movie.id && m.genres.some((g) => movie.genres.includes(g))).slice(0, 4)
  const cinemas = theatresShowingMovie(movie, city).length

  return (
    <>
      <section className="relative isolate overflow-hidden pb-10">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(45% 50% at 55% 60%, rgb(255 59 47 / 0.14), transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-8">
          <OutlineWord>{movie.title}</OutlineWord>

          <div className="relative -mt-[3vw] grid gap-12 lg:-mt-12 lg:grid-cols-12 lg:gap-8">
            <div className="animate-rise lg:col-span-5">
              <TitleBlock script={nowShowing ? 'Now showing,' : 'Coming soon,'} title={movie.title} />
              <MonoBadge className="mt-7">
                {movie.certificate} / {movie.genres.join(' & ')} / {formatDuration(movie.duration)}
              </MonoBadge>
              <p className="mt-6 max-w-md text-lg leading-relaxed font-semibold text-white">{movie.tagline}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                {nowShowing ? (
                  <Link to={`/movie/${movie.id}/shows`} className="btn-primary">
                    Book tickets →
                  </Link>
                ) : (
                  <span className="btn-ghost cursor-default">Bookings open soon</span>
                )}
                <a href="#about" className="btn-ghost">
                  Read the story
                </a>
              </div>

              <StatRow
                className="mt-10"
                stats={
                  nowShowing
                    ? [
                        { value: movie.rating.toFixed(1), label: 'Audience rating' },
                        { value: formatVotes(movie.votes), label: 'Votes' },
                        { value: cinemas, label: `Cinemas in ${city}` },
                      ]
                    : [
                        { value: formatVotes(movie.interested), label: 'Interested' },
                        { value: movie.formats.length, label: 'Formats' },
                        { value: movie.languages.length, label: 'Languages' },
                      ]
                }
              />
            </div>

            <div className="lg:col-span-4 lg:pt-14">
              <PosterFrame movie={movie} chip={nowShowing ? `Now showing in ${city}` : `In cinemas ${formatReleaseDate(movie)}`} className="mx-auto max-w-[19rem]" />
            </div>

            <div className="lg:col-span-3 lg:pt-14">
              <p className="font-mono text-xs font-bold text-muted uppercase">Movie file</p>
              <div className="mt-2">
                <NumberedList
                  label="Movie details"
                  items={[
                    { title: movie.director, desc: 'Director', tag: 'Crew' },
                    { title: movie.languages.join(', '), desc: 'Languages', tag: 'Audio' },
                    { title: formatDuration(movie.duration), desc: `Certificate ${movie.certificate}`, tag: 'Runtime' },
                    { title: formatReleaseDate(movie), desc: nowShowing ? 'Released' : 'Release date', tag: 'Release' },
                  ]}
                />
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {movie.formats.map((f) => (
                  <span key={f} className="chip">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionIndex n={1} total={3} name="STORY" />
        <section id="about" className="mt-10 grid scroll-mt-24 gap-10 lg:grid-cols-12" aria-labelledby="about-h">
          <div className="lg:col-span-7">
            <SectionHeader id="about-h" eyebrow="The story" title="About the Movie" />
            <p className="mt-6 max-w-[64ch] text-lg leading-relaxed text-fg/80">{movie.synopsis}</p>
            <blockquote className="mt-8 border-l-2 border-accent pl-5 text-xl leading-snug font-bold text-white italic">
              “{movie.tagline}”
            </blockquote>
          </div>
          <div className="lg:col-span-5">
            <p className="font-mono text-xs font-bold text-muted uppercase">Genres</p>
            <ul className="mt-3 space-y-2">
              {movie.genres.map((g, i) => (
                <li key={g} className="flex items-center justify-between rounded-md border border-line bg-panel px-4 py-3">
                  <span className="font-bold">{g}</span>
                  <span className="font-mono text-xs text-muted">0{i + 1}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="pt-24" aria-labelledby="cast-h">
          <SectionIndex n={2} total={3} name="CAST" />
          <div className="mt-10">
            <SectionHeader id="cast-h" eyebrow="On screen" title="Cast & Crew" />
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[...movie.cast, { name: movie.director, role: 'Director' }].map((p) => (
              <li key={p.name + p.role} className="rounded-xl border border-line bg-panel p-4">
                <div className="grid size-12 place-items-center rounded-md bg-accent font-mono text-sm font-bold text-white" aria-hidden="true">
                  {initials(p.name)}
                </div>
                <p className="mt-4 leading-tight font-bold">{p.name}</p>
                <p className="mt-1 font-mono text-[0.68rem] text-muted uppercase">{p.role}</p>
              </li>
            ))}
          </ul>
        </section>

        {similar.length > 0 && (
          <section className="pt-24" aria-labelledby="similar-h">
            <SectionIndex n={3} total={3} name="SIMILAR" />
            <div className="mt-10">
              <SectionHeader id="similar-h" eyebrow="More like this" title="You Might Also Like" />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {similar.map((m) => (
                <MovieCard key={m.id} movie={m} number={NOW_SHOWING.indexOf(m) + 1} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}