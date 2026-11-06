import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import MovieCard from '../components/MovieCard'
import { SectionHeader, SectionIndex, TabPills } from '../components/ui'
import { NOW_SHOWING, COMING_SOON, ALL_LANGUAGES, ALL_GENRES } from '../data/movies'
import { useStore } from '../store/useStore'

export default function Home() {
  const city = useStore((s) => s.city)
  const [language, setLanguage] = useState('All')
  const [genre, setGenre] = useState('All')
  const { hash } = useLocation()
  const navigate = useNavigate()

  // Nav links like "/#now-showing" scroll to that section.
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 50)
    return () => clearTimeout(t)
  }, [hash])

  const movies = useMemo(
    () =>
      NOW_SHOWING.filter(
        (m) => (language === 'All' || m.languages.includes(language)) && (genre === 'All' || m.genres.includes(genre)),
      ).sort((a, b) => b.rating - a.rating),
    [language, genre],
  )

  const surpriseMe = () => {
    const pick = NOW_SHOWING[Math.floor(Math.random() * NOW_SHOWING.length)]
    navigate(`/movie/${pick.id}/shows`)
  }

  return (
    <>
      <Hero />

      <section id="now-showing" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-10 sm:px-8" aria-labelledby="now-showing-h">
        <SectionIndex n={1} total={3} name="NOW_SHOWING" />
        <div className="mt-10">
          <SectionHeader
            id="now-showing-h"
            eyebrow={`Now showing in ${city}`}
            title="The Movie Matrix"
            sub={`${NOW_SHOWING.length} movies playing across ${city} this week. Pick a language or genre to narrow it down.`}
          />
        </div>

        <div className="mt-8 space-y-2">
          <TabPills
            label="Language"
            value={language}
            onChange={setLanguage}
            options={[{ value: 'All', label: `All languages (${NOW_SHOWING.length})` }, ...ALL_LANGUAGES.map((l) => ({ value: l, label: l }))]}
          />
          <TabPills
            label="Genre"
            value={genre}
            onChange={setGenre}
            options={[{ value: 'All', label: 'All genres' }, ...ALL_GENRES.map((g) => ({ value: g, label: g }))]}
          />
        </div>

        {movies.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} number={NOW_SHOWING.indexOf(m) + 1} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-line px-6 py-14 text-center">
            <p className="font-medium">
              No {genre !== 'All' && `${genre.toLowerCase()} `}movies{language !== 'All' && ` in ${language}`} are showing right now.
            </p>
            <button
              onClick={() => {
                setLanguage('All')
                setGenre('All')
              }}
              className="btn-ghost mt-5"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <section id="coming-soon" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-24 sm:px-8" aria-labelledby="coming-soon-h">
        <SectionIndex n={2} total={3} name="COMING_SOON" />
        <div className="mt-10">
          <SectionHeader id="coming-soon-h" eyebrow="Releasing soon" title="Coming Soon" sub="Bookings open a few days before release." />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {COMING_SOON.map((m, i) => (
            <MovieCard key={m.id} movie={m} number={NOW_SHOWING.length + i + 1} comingSoon />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-8" aria-labelledby="cta-h">
        <SectionIndex n={3} total={3} name="DIRECT_BOOK" />
        <div className="mt-16 text-center">
          <p className="eyebrow">Can’t decide?</p>
          <h2 id="cta-h" className="heading mx-auto mt-4 max-w-2xl text-4xl sm:text-5xl">
            Let’s Find Your Next Movie.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">We’ll pick a movie playing in {city} and take you straight to its showtimes.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <span className="font-mono text-sm font-bold text-white">{NOW_SHOWING.length} movies, 1 click</span>
            <button onClick={surpriseMe} className="btn-primary">
              Surprise me
            </button>
          </div>
        </div>
      </section>
    </>
  )
}