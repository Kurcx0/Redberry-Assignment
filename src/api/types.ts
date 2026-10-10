export type AgeRating = {
  code: 'G' | 'PG' | '12+' | '16+' | '18+'
  minAge: number
  description: string
}

export type Genre = {
  id: number
  slug: string
  name: string
}

export type Format = {
  id: number
  slug: string
  name: string
  priceUplift: number
}

export type Venue = {
  id: number
  slug: string
  name: string
  city: string
  formats?: Format[]
}

export type Language = {
  id: number
  slug: string
  name: string
  code: string
}

export type TicketTypeSlug = 'adult' | 'child' | 'student'

export type TicketType = {
  id: number
  slug: TicketTypeSlug
  name: string
  priceRatio: number
  note: string | null
  blockedFromRatingAge: number | null
}

export type TimeBand = 'morning' | 'afternoon' | 'evening'

export type FilterOptions = {
  venues: Venue[]
  formats: Format[]
  languages: Language[]
  timeBands: { id: TimeBand; label: string }[]
  sorts: { id: string; label: string }[]
  ticketTypes: TicketType[]
  ageRatings: AgeRating[]
  maxSeatsPerOrder: number
  holdMinutes: number
}

export type Movie = {
  id: number
  slug: string
  title: string
  kind: 'film' | 'event'
  runtimeMinutes: number
  posterUrl: string | null
  backdropUrl: string | null
  releaseDate: string
  isComingSoon: boolean
  isNotified?: boolean
  isFeatured: boolean
  fromPrice: number
  ageRating: AgeRating
  genres: Genre[]
  formats: Format[]
  synopsis?: string
}

export type MovieDetail = Movie & {
  synopsis: string
  director: string | null
  cast: string | null
  availableDates: string[]
}

export type Session = {
  id: number
  startsAt: string
  date: string
  time: string
  timeBand: TimeBand
  price: number
  seatsLeft: number
  isSoldOut: boolean
  hall: { id: number; name: string; venue?: Venue }
  venue: Venue
  format: Format
  language: Language
  movie: Movie
}

export type SessionGroup = {
  movie: Movie
  sessions: Session[]
}

export type SessionsMeta = {
  currentPage: number
  lastPage: number
  perPage: number
  totalSessions: number
  totalMovies: number
  date: string
}

export type VenueSessions = {
  venue: Venue
  sessions: Session[]
}

export type SeatState = 'available' | 'sold' | 'held' | 'unavailable'

export type Seat = {
  id: number
  code: string
  label: string
  state: SeatState
  aisleAfter: boolean
  isMine: boolean
}

export type SeatSection = {
  name: string
  rows: { label: string; seats: Seat[] }[]
}

export type SeatMap = {
  sessionId: number
  hall: { id: number; name: string; venue: Venue }
  sections: SeatSection[]
}

export type HeldSeat = {
  seatId: number
  code: string
  ticketType: { slug: TicketTypeSlug; name: string }
  price: number
}

export type SeatHold = {
  holdId: string
  sessionId: number
  expiresAt: string
  secondsRemaining: number
  isLive: boolean
  subtotal: number
  seats: HeldSeat[]
}

export type Order = {
  id: number
  reference: string
  status: 'paid' | 'refunded'
  totalPrice: number
  paidAt: string
  refundedAt: string | null
  isUpcoming: boolean
  isRefundable: boolean
  cardLastFour: string
  contact: {
    fullName: string
    email: string
    mobileNumber: string
  }
  session: Session
  tickets: {
    id: number
    seatCode: string
    ticketType: { slug: TicketTypeSlug; name: string }
    price: number
  }[]
}

export type User = {
  id: number
  username: string
  email: string
  avatar: string | null
  fullName: string | null
  mobileNumber: string | null
  dateOfBirth: string | null
  age: number | null
  preferredVenue: Venue | null
  profileComplete: boolean
}
