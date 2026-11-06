import { getMovie, isNowShowing } from '../data/movies'
import { getTheatre, theatresInCity, SEAT_LAYOUTS, SEAT_CATEGORIES } from '../data/theatres'
import { seededRandom } from './random'
import { addDays, parseISODate, showDateTime, toISODate } from './format'

// ---------- Show IDs ----------
// A show is one movie, in one theatre, on one date, at one time.
// Its ID packs those four parts together so it can live in the URL.

const SEP = '__'
const TIME_POOL = ['0915', '1030', '1140', '1300', '1415', '1530', '1650', '1800', '1915', '2030', '2145', '2300']

export const makeShowId = (movieId, theatreId, date, time) => [movieId, theatreId, date, time].join(SEP)

export function parseShowId(showId) {
  const parts = (showId || '').split(SEP)
  if (parts.length !== 4) return null
  const [movieId, theatreId, date, time] = parts
  const movie = getMovie(movieId)
  const theatre = getTheatre(theatreId)
  if (!movie || !theatre || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{4}$/.test(time)) return null
  return {
    showId,
    movie,
    theatre,
    date,
    time,
    format: showFormat(movie, theatre, date, time),
    screen: screenNumber(theatre, movie),
  }
}

function showFormat(movie, theatre, date, time) {
  const r = seededRandom(`${movie.id}${theatre.id}${date}${time}fmt`)()
  if (movie.formats.includes('4K Laser') && theatre.features.includes('4K Laser') && r < 0.5) return '4K Laser'
  if (movie.formats.includes('3D') && r > 0.7) return '3D'
  return '2D'
}

function screenNumber(theatre, movie) {
  if (theatre.layout === 'palace') return 1
  return 1 + Math.floor(seededRandom(theatre.id + movie.id)() * 6)
}

// ---------- Schedules ----------

export function bookableDates(days = 7) {
  return Array.from({ length: days }, (_, i) => toISODate(addDays(new Date(), i)))
}

// Each movie plays in 3 or 4 of the theatres in a city.
export function theatresShowingMovie(movie, city) {
  if (!isNowShowing(movie)) return []
  const list = theatresInCity(city)
    .map((t) => ({ t, r: seededRandom(movie.id + t.id)() }))
    .sort((a, b) => a.r - b.r)
  const count = 3 + (seededRandom(movie.id + city)() > 0.5 ? 1 : 0)
  return list.slice(0, count).map((x) => x.t)
}

// Showtimes for a movie in a theatre on a date. Shows that have already
// started are left out.
export function showtimesFor(movie, theatre, date, now = new Date()) {
  const rand = seededRandom(`${movie.id}${theatre.id}${date}`)
  const count = 3 + Math.floor(rand() * 3)
  const offset = Math.floor(rand() * (TIME_POOL.length - count * 2))
  const times = []
  for (let i = 0; i < count; i++) times.push(TIME_POOL[offset + i * 2])
  return times
    .filter((time) => showDateTime(date, time) > now)
    .map((time) => {
      const showId = makeShowId(movie.id, theatre.id, date, time)
      return { showId, time, format: showFormat(movie, theatre, date, time) }
    })
}

export function scheduleFor(movie, city, date) {
  return theatresShowingMovie(movie, city)
    .map((theatre) => ({ theatre, shows: showtimesFor(movie, theatre, date) }))
    .filter((row) => row.shows.length > 0)
}

// The next few shows of a movie across the city, soonest first.
export function nextShows(movie, city, limit = 4) {
  for (const date of bookableDates(3)) {
    const all = theatresShowingMovie(movie, city).flatMap((theatre) =>
      showtimesFor(movie, theatre, date).map((s) => ({ ...s, theatre, date })),
    )
    if (all.length) return all.sort((a, b) => a.time.localeCompare(b.time)).slice(0, limit)
  }
  return []
}

// ---------- Seats ----------

export function buildSeatMap(theatre) {
  const layout = SEAT_LAYOUTS[theatre.layout]
  return layout.map((block) => ({
    category: block.category,
    ...SEAT_CATEGORIES[block.category],
    rows: block.rows.map((row) => ({
      row,
      seats: Array.from({ length: block.seats }, (_, i) => {
        const number = i + 1
        return {
          id: `${row}${number}`,
          row,
          number,
          category: block.category,
          price: SEAT_CATEGORIES[block.category].price,
          aisleAfter: block.aisles.includes(number),
        }
      }),
    })),
  }))
}

const occupancyCache = new Map()

// Seats other people "already booked". Seeded, so it never changes for a show.
export function presetBookedSeats(showId) {
  if (occupancyCache.has(showId)) return occupancyCache.get(showId)
  const show = parseShowId(showId)
  const booked = new Set()
  if (show) {
    const rand = seededRandom(showId)
    // Evening and weekend shows fill up faster.
    const hour = Number(show.time.slice(0, 2))
    const day = parseISODate(show.date).getDay()
    let occupancy = 0.06 + rand() * 0.28
    if (hour >= 18) occupancy += 0.15
    if (day === 0 || day === 6) occupancy += 0.08
    for (const block of buildSeatMap(show.theatre)) {
      for (const row of block.rows) {
        let prevBooked = false
        row.seats.forEach((seat, i) => {
          // Middle seats go first, and people book in groups next to each other.
          const centre = 1 - Math.abs(i - (row.seats.length - 1) / 2) / (row.seats.length / 2)
          let p = occupancy * (0.55 + 0.9 * centre)
          if (prevBooked) p = Math.min(0.92, p + 0.3)
          prevBooked = rand() < p
          if (prevBooked) booked.add(seat.id)
        })
      }
    }
  }
  occupancyCache.set(showId, booked)
  return booked
}

export function bookedSeatsFor(showId, bookings = []) {
  const booked = new Set(presetBookedSeats(showId))
  for (const b of bookings) {
    if (b.showId === showId && b.status === 'confirmed') b.seats.forEach((s) => booked.add(s.id))
  }
  return booked
}

export function availabilityFor(showId, bookings = []) {
  const show = parseShowId(showId)
  if (!show) return 'available'
  const total = buildSeatMap(show.theatre).reduce(
    (sum, b) => sum + b.rows.reduce((s, r) => s + r.seats.length, 0),
    0,
  )
  const filled = bookedSeatsFor(showId, bookings).size / total
  if (filled > 0.68) return 'almost-full'
  if (filled > 0.5) return 'filling-fast'
  return 'available'
}

// ---------- Money ----------

export const CONVENIENCE_FEE_PER_TICKET = 30
export const GST_RATE = 0.18

export function computeTotals(seats) {
  const ticketTotal = seats.reduce((sum, s) => sum + s.price, 0)
  const convenienceFee = seats.length * CONVENIENCE_FEE_PER_TICKET
  const gst = Math.round(convenienceFee * GST_RATE)
  return { ticketTotal, convenienceFee, gst, grandTotal: ticketTotal + convenienceFee + gst }
}   