import { Link } from 'react-router-dom'

export default function NotFound({ message = 'This page doesn’t exist.', action }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="outline-word text-[clamp(4.5rem,16vw,9rem)] uppercase">Intermission</p>
      <h1 className="heading mt-6 text-2xl">{message}</h1>
      <div className="mt-8 flex justify-center gap-3">
        {action}
        <Link to="/" className="btn-primary">
          Browse movies
        </Link>
      </div>
    </div>
  )
}