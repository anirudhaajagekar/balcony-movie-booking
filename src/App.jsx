import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import MovieDetails from './pages/MovieDetails'
import Showtimes from './pages/Showtimes'
import SeatSelection from './pages/SeatSelection'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import MyBookings from './pages/MyBookings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:movieId" element={<MovieDetails />} />
        <Route path="/movie/:movieId/shows" element={<Showtimes />} />
        <Route path="/show/:showId/seats" element={<SeatSelection />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/booking/:bookingId" element={<Confirmation />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}