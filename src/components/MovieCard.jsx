import { Link } from 'react-router-dom'
import Poster from './Poster'
import { formatVotes, releaseDate } from '../utils/format'

export function Rating({ movie, className = '' }) {
  if (!movie.rating) return null
  return (
    <span className={`inline-flex items-baseline gap-1.5 font-mono ${className}`}>
      <span className="font-bold text-accent">★ {movie.rating.toFixed(1)}</span>
      <span className="text-[0.7rem] text-muted uppercase">{formatVotes(movie.votes)} votes</span>
    </span>
  )
}

// Card styled like the reel's "Systems Matrix" cards: red tag, ID number,
// bold title and monospace details.
export default function MovieCard({ movie, number, comingSoon = false }) {
  return (
    <Link
      to={`/movie/${movie.id}`}
      className="group flex flex-col rounded-xl border border-line bg-panel p-3 transition-colors hover:border-accent/70"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="chip-red">{movie.genres[0]}</span>
        {number != null && <span className="font-mono text-[0.65rem] text-muted">#MOV-{String(number).padStart(2, '0')}</span>}
      </div>
      <Poster movie={movie} rounded="rounded-md" />
      <h3 className="mt-4 text-lg leading-tight font-extrabold tracking-tight text-fg group-hover:text-white">{movie.title}</h3>
      <p className="mt-1 text-sm text-muted">{movie.languages.join(', ')}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        {comingSoon ? (
          <span className="font-mono text-xs font-bold text-accent uppercase">
            In cinemas {releaseDate(movie).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        ) : (
          <Rating movie={movie} className="text-sm" />
        )}
        <span className="chip">{movie.formats.at(-1)}</span>
      </div>
    </Link>
  )
}