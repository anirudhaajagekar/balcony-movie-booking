import { useMemo } from 'react'
import { seededRandom } from '../utils/random'

// Posters are drawn with SVG from each movie's tone and motif, so every film
// gets its own look without any image files. Two tones, like the reel's
// red-backed portrait: black shapes on red, or red shapes on black.

export const TONES = {
  red: { from: '#FF4A36', to: '#A9180F', bg: '#E8291E', main: '#0A0A0A', alt: '#FFFFFF' },
  dark: { from: '#222222', to: '#060606', bg: '#141414', main: '#FF3B2F', alt: '#F5F5F5' },
}

function Motif({ motif, colors, seed }) {
  const { main: accent, alt, bg } = colors

  const rain = useMemo(() => {
    if (motif !== 'rain') return []
    const r = seededRandom(seed)
    return Array.from({ length: 46 }, () => ({
      x: r() * 240 - 20,
      y: r() * 300 - 40,
      len: 20 + r() * 50,
      o: 0.15 + r() * 0.45,
    }))
  }, [motif, seed])

  switch (motif) {
    case 'rain':
      return (
        <g>
          {rain.map((d, i) => (
            <line key={i} x1={d.x} y1={d.y} x2={d.x - d.len * 0.35} y2={d.y + d.len} stroke={accent} strokeOpacity={d.o} strokeWidth="1.2" />
          ))}
          <circle cx="140" cy="118" r="22" fill={alt} opacity="0.95" />
          <circle cx="140" cy="118" r="54" fill={accent} opacity="0.12" />
          <path d="M0 210 L200 196 M0 222 L200 210" stroke={accent} strokeOpacity="0.5" strokeWidth="2" />
        </g>
      )
    case 'orbit':
      return (
        <g fill="none" stroke={accent}>
          {[34, 56, 80, 106].map((rx, i) => (
            <ellipse key={rx} cx="100" cy="112" rx={rx} ry={rx * 0.36} transform="rotate(-18 100 112)" strokeOpacity={0.75 - i * 0.15} strokeWidth="1.3" />
          ))}
          <circle cx="100" cy="112" r="22" fill={alt} stroke="none" />
          <circle cx="178" cy="86" r="5" fill={accent} stroke="none" />
          <circle cx="36" cy="142" r="3" fill={accent} stroke="none" opacity="0.7" />
        </g>
      )
    case 'sun':
      return (
        <g>
          <circle cx="100" cy="128" r="66" fill={accent} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x="0" y={140 + i * 11} width="200" height={3 + i * 1.6} fill={bg} />
          ))}
        </g>
      )
    case 'peaks':
      return (
        <g>
          <circle cx="146" cy="70" r="16" fill={alt} opacity="0.95" />
          <path d="M-10 230 L60 96 L104 170 L138 120 L214 230 Z" fill={accent} opacity="0.35" />
          <path d="M-10 250 L44 150 L92 214 L150 128 L214 250 Z" fill={accent} opacity="0.55" />
          <path d="M60 96 L74 124 L64 118 L56 128 L48 120 Z" fill={accent} />
        </g>
      )
    case 'bars':
      return (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={-60 + i * 48} y="-40" width="18" height="360" fill={accent} opacity={0.12 + (i % 3) * 0.12} transform="rotate(24 100 150)" />
          ))}
          <circle cx="104" cy="104" r="40" fill="none" stroke={alt} strokeWidth="5" />
        </g>
      )
    case 'bloom':
      return (
        <g transform="translate(100 112)">
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx="0" cy="-34" rx="17" ry="36" fill={accent} opacity="0.32" transform={`rotate(${i * 45})`} />
          ))}
          <circle r="13" fill={alt} />
        </g>
      )
    case 'grid':
      return (
        <g>
          {Array.from({ length: 4 }, (_, row) =>
            Array.from({ length: 4 }, (_, col) => {
              const lit = row === 1 && col === 2
              return (
                <path
                  key={`${row}-${col}`}
                  d={`M${34 + col * 36} ${66 + row * 42} v-14 a10 10 0 0 1 20 0 v14 Z`}
                  fill={lit ? alt : 'none'}
                  stroke={lit ? alt : accent}
                  strokeOpacity={lit ? 1 : 0.45}
                  strokeWidth="1.4"
                />
              )
            }),
          )}
        </g>
      )
    case 'horizon':
      return (
        <g fill="none" stroke={accent}>
          <circle cx="100" cy="112" r="34" fill={alt} stroke="none" opacity="0.95" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M-10 ${150 + i * 14} q 25 -8 50 0 t 50 0 t 50 0 t 50 0 t 50 0`}
              strokeOpacity={0.9 - i * 0.12}
              strokeWidth="2"
            />
          ))}
        </g>
      )
    case 'kite':
      return (
        <g>
          <path d="M100 40 L140 100 L100 170 L60 100 Z" fill={accent} />
          <path d="M100 40 L100 170 M60 100 L140 100" stroke={bg} strokeWidth="2" />
          <path d="M100 170 C 80 200, 130 220, 96 260 S 120 300, 110 320" fill="none" stroke={accent} strokeWidth="1.4" />
        </g>
      )
    default:
      return null
  }
}

export default function Poster({ movie, className = '', showTitle = true, rounded = 'rounded-xl' }) {
  const colors = TONES[movie.tone] ?? TONES.dark
  return (
    <div
      className={`@container relative aspect-[2/3] overflow-hidden ${rounded} ${className}`}
      style={{ background: `linear-gradient(165deg, ${colors.from} 0%, ${colors.to} 85%)` }}
      role="img"
      aria-label={`${movie.title} poster`}
    >
      <svg viewBox="0 0 200 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <Motif motif={movie.motif} colors={colors} seed={movie.id} />
      </svg>
      <div className="grain pointer-events-none absolute inset-0" />
      {showTitle && (
        <>
          {/* Dark fade at the bottom keeps the title readable on light posters too. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 via-40% to-transparent to-60%" />
          <div className="absolute inset-x-0 bottom-0 p-[7cqw] text-white [text-shadow:0_1px_10px_rgb(0_0_0/0.35)]">
            <p className="font-mono text-[3.8cqw] font-bold uppercase opacity-75">A film by {movie.director}</p>
            <p className="display mt-[1.5cqw] text-[17cqw] uppercase">{movie.title}</p>
            <p className="mt-[2.5cqw] text-[4.4cqw] leading-snug font-medium opacity-85">{movie.tagline}</p>
          </div>
        </>
      )}
    </div>
  )
}