// Fictional cinema chains placed in real neighbourhoods.

export const CITIES = [
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
]

const AREAS = {
  Mumbai: ['Andheri West', 'Lower Parel', 'Ghatkopar', 'Thane West', 'Vashi'],
  'Delhi NCR': ['Saket', 'Connaught Place', 'Rajouri Garden', 'Noida Sector 18', 'Gurugram'],
  Bengaluru: ['Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar', 'Malleshwaram'],
  Hyderabad: ['Banjara Hills', 'Kukatpally', 'Gachibowli', 'Ameerpet', 'Dilsukhnagar'],
  Chennai: ['T. Nagar', 'Velachery', 'Anna Nagar', 'Vadapalani', 'OMR'],
  Pune: ['Koregaon Park', 'Kothrud', 'Hinjewadi', 'Viman Nagar', 'Aundh'],
  Kolkata: ['Park Street', 'Salt Lake', 'Gariahat', 'New Town', 'Behala'],
  Ahmedabad: ['SG Highway', 'Navrangpura', 'Satellite', 'Maninagar', 'Bopal'],
}

// `layout` picks a seat plan from SEAT_LAYOUTS below.
const CHAINS = [
  { chain: 'Starlight Multiplex', layout: 'multiplex', features: ['Recliners', 'Dolby Atmos', 'Food & drinks'] },
  { chain: 'Cineverse', layout: 'multiplex', features: ['4K Laser', 'Food & drinks', 'Parking'] },
  { chain: 'Moonbeam Cinemas', layout: 'compact', features: ['Dolby 7.1', 'Parking'] },
  { chain: 'Picture Palace', layout: 'palace', features: ['Single screen', 'Balcony seats'] },
  { chain: 'Reel Street', layout: 'compact', features: ['Food & drinks', 'Wheelchair access'] },
]

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const THEATRES = CITIES.flatMap((city) =>
  AREAS[city].map((area, i) => {
    const c = CHAINS[i % CHAINS.length]
    return {
      id: slug(`${city}-${c.chain}-${area}`),
      city,
      name: `${c.chain}: ${area}`,
      chain: c.chain,
      area,
      layout: c.layout,
      features: c.features,
    }
  }),
)

export const getTheatre = (id) => THEATRES.find((t) => t.id === id)
export const theatresInCity = (city) => THEATRES.filter((t) => t.city === city)

// ---------- Seat plans ----------
// Rows nearest the screen come first. `aisles` lists seat numbers that have
// a gap after them. `gapBefore` adds breathing room above a block.

export const SEAT_CATEGORIES = {
  regular: { label: 'Regular', price: 180 },
  premium: { label: 'Premium', price: 260 },
  recliner: { label: 'Recliner', price: 450 },
  balcony: { label: 'Balcony', price: 220 },
}

export const SEAT_LAYOUTS = {
  multiplex: [
    { category: 'regular', rows: ['A', 'B', 'C', 'D'], seats: 16, aisles: [4, 12] },
    { category: 'premium', rows: ['E', 'F', 'G', 'H', 'I'], seats: 16, aisles: [4, 12] },
    { category: 'recliner', rows: ['J', 'K'], seats: 8, aisles: [4] },
  ],
  compact: [
    { category: 'regular', rows: ['A', 'B', 'C', 'D', 'E'], seats: 14, aisles: [7] },
    { category: 'premium', rows: ['F', 'G', 'H', 'I'], seats: 14, aisles: [7] },
  ],
  palace: [
    { category: 'regular', rows: ['A', 'B', 'C', 'D', 'E', 'F'], seats: 20, aisles: [5, 15] },
    { category: 'balcony', rows: ['G', 'H', 'I', 'J'], seats: 16, aisles: [8] },
  ],
}