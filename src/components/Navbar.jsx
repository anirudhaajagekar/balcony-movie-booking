import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Search, Ticket, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { parseShowId } from '../utils/shows'
import { showDateTime } from '../utils/format'
import SearchBox from './SearchBox'

export function Logo({ compact = false }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2 rounded-md" aria-label="Balcony home">
      <span className="grid size-7 place-items-center rounded-md bg-accent font-mono text-xs font-bold text-white shadow-[0_0_14px_-2px] shadow-accent">
        BL
      </span>
      {!compact && <span className="font-mono text-xs font-bold tracking-wider text-fg">BALCONY.</span>}
    </Link>
  )
}

const LINKS = [
  { to: '/#now-showing', label: 'Movies' },
  { to: '/#coming-soon', label: 'Coming soon' },
  { to: '/bookings', label: 'Bookings' },
]

// Floating pill navigation, centred at the top like the reel.
export default function Navbar() {
  const city = useStore((s) => s.city)
  const openCityPicker = useStore((s) => s.openCityPicker)
  const bookings = useStore((s) => s.bookings)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setSearchOpen(false), [location.pathname])

  const upcoming = bookings.filter((b) => {
    if (b.status !== 'confirmed') return false
    const show = parseShowId(b.showId)
    return show && showDateTime(show.date, show.time) > new Date()
  }).length

  return (
    <header className="sticky top-3 z-40 px-3 print:hidden">
      <nav
        className="mx-auto flex w-fit max-w-full items-center gap-1 rounded-xl border border-line bg-panel/85 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-md sm:gap-2"
        aria-label="Main"
      >
        <span className="pl-1">
          <Logo />
        </span>

        <ul className="hidden items-center md:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-raised ${
                    isActive && l.to === '/bookings' ? 'text-white' : 'text-muted hover:text-white'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          onClick={openCityPicker}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[0.7rem] font-bold tracking-wide text-fg uppercase hover:bg-raised"
          aria-label={`City: ${city}. Change city`}
        >
          <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px] shadow-accent" aria-hidden="true" />
          <span className="max-w-[6.5rem] truncate">{city}</span>
        </button>

        <button
          onClick={() => setSearchOpen((o) => !o)}
          className={`grid size-8 place-items-center rounded-md hover:bg-raised ${searchOpen ? 'text-white' : 'text-muted'}`}
          aria-label={searchOpen ? 'Close search' : 'Search movies'}
          aria-expanded={searchOpen}
        >
          {searchOpen ? <X className="size-4" /> : <Search className="size-4" />}
        </button>

        <NavLink
          to="/bookings"
          className="relative grid size-8 place-items-center rounded-md text-muted hover:bg-raised hover:text-white md:hidden"
          aria-label={`My bookings${upcoming ? `, ${upcoming} upcoming` : ''}`}
        >
          <Ticket className="size-4" />
          {upcoming > 0 && <span className="absolute top-1 right-1 size-2 rounded-full bg-accent" aria-hidden="true" />}
        </NavLink>

        <Link to="/#now-showing" className="btn-link hidden px-2 text-xs underline underline-offset-4 sm:inline-flex">
          Book now →
        </Link>
      </nav>

      {searchOpen && (
        <div className="mx-auto mt-2 max-w-md animate-rise">
          <SearchBox autoFocus />
        </div>
      )}
    </header>
  )
}