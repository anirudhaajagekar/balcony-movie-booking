import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { MOVIES, isNowShowing } from '../data/movies'
import Poster from './Poster'

export default function SearchBox({ className = '', autoFocus = false }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const boxRef = useRef(null)
  const listId = useId()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return MOVIES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genres.some((g) => g.toLowerCase().includes(q)) ||
        m.languages.some((l) => l.toLowerCase().includes(q)),
    ).slice(0, 6)
  }, [query])

  useEffect(() => {
    const onDown = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const go = (movie) => {
    navigate(`/movie/${movie.id}`)
    setQuery('')
    setOpen(false)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      go(results[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && query.trim().length > 0

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <label className="relative block">
        <span className="sr-only">Search movies</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search movies, genres, languages"
          className="w-full rounded-xl border border-line bg-panel/95 py-3 pr-4 pl-10 text-sm text-fg shadow-2xl shadow-black/60 backdrop-blur-md placeholder:text-muted/70 focus:border-accent focus:outline-none"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          autoComplete="off"
          autoFocus={autoFocus}
        />
      </label>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-line bg-panel shadow-2xl shadow-black/60"
        >
          {results.length === 0 && <li className="px-4 py-3 text-sm text-muted">No movies match “{query}”.</li>}
          {results.map((m, i) => (
            <li key={m.id} role="option" aria-selected={i === active}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => go(m)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${i === active ? 'bg-raised' : ''}`}
              >
                <Poster movie={m} showTitle={false} className="w-9 shrink-0" rounded="rounded-md" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{m.title}</span>
                  <span className="block truncate font-mono text-[0.68rem] font-bold text-muted uppercase">
                    {isNowShowing(m) ? 'Now showing' : 'Coming soon'} / {m.languages.join(', ')}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}