import { useQuery } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ApiError } from '@/api/client'
import { getMovie } from '@/api/movies'
import type { MovieDetail } from '@/api/types'
import { BellIcon, CalendarIcon, CheckIcon, SearchIcon } from '@/components/icons'
import { AgeBadge, Pill, RuntimePill } from '@/components/movies/Badges'
import MovieSessions from '@/components/movies/MovieSessions'
import Poster from '@/components/movies/Poster'
import Button, { buttonClasses } from '@/components/ui/Button'
import DatePicker from '@/components/ui/DatePicker'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useMe } from '@/hooks/useMe'
import { useNotifyMe } from '@/hooks/useNotifyMe'
import { formatPrice, formatReleaseDate, today, upcomingDays } from '@/lib/format'
import { addRecentlyViewed } from '@/lib/recentlyViewed'

export default function MoviePage() {
  const { slug = '' } = useParams()
  const { user } = useMe()
  const { data: movie, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['movie', slug, user?.id ?? 'guest'],
    queryFn: () => getMovie(slug),
  })

  useEffect(() => {
    if (movie) addRecentlyViewed(movie)
  }, [movie])

  useEffect(() => {
    if (movie) document.title = `${movie.title} | Kino XII`
    return () => {
      document.title = 'Kino XII'
    }
  }, [movie])

  if (isPending) return <MovieSkeleton />

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <EmptyState
          icon={<SearchIcon />}
          title="Film not found"
          description="This title does not exist or is no longer available."
          action={
            <Link to="/sessions" className={buttonClasses('primary', 'md')}>
              Browse sessions
            </Link>
          }
          className="pt-40"
        />
      )
    }
    return <ErrorState onRetry={() => refetch()} retrying={isRefetching} className="pt-40" />
  }

  return (
    <>
      <MovieHero movie={movie} />
      <div className="flex gap-16 px-[52px] pt-10 pb-24">
        <div className="min-w-0 flex-1">
          {movie.isComingSoon ? <ComingSoonNotice movie={movie} /> : <SessionsSection movie={movie} />}
        </div>
        <MovieDetails movie={movie} />
      </div>
    </>
  )
}

function MovieHero({ movie }: { movie: MovieDetail }) {
  return (
    <section className="relative h-[566px] overflow-hidden">
      {movie.backdropUrl && (
        <img src={movie.backdropUrl} alt="" className="absolute inset-0 size-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-page/95 via-page/60 to-page/10" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-page to-transparent" />

      <div className="absolute bottom-12 left-[60px] flex items-end gap-10">
        <Poster
          src={movie.posterUrl}
          alt={movie.title}
          className="h-[374px] w-[288px] shrink-0 rounded-2xl shadow-2xl shadow-black/50"
        />
        <div className="max-w-[600px] pb-2">
          {movie.genres.length > 0 && (
            <span className="inline-flex h-6 items-center rounded-full bg-primary/15 px-2.5 text-[11px] font-extrabold tracking-wide text-primary uppercase">
              {movie.genres.map((genre) => genre.name).join(' · ')}
            </span>
          )}
          <h1 className="mt-4 text-[40px] leading-[1.1] font-extrabold">{movie.title}</h1>
          <p className="mt-4 line-clamp-3 text-sm leading-[1.5] text-white/80">{movie.synopsis}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <AgeBadge rating={movie.ageRating} />
            <RuntimePill minutes={movie.runtimeMinutes} />
            {movie.formats.map((format) => (
              <Pill key={format.id}>{format.name}</Pill>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SessionsSection({ movie }: { movie: MovieDetail }) {
  const [params, setParams] = useSearchParams()
  const days = upcomingDays().map((day) => day.value)
  const available = movie.availableDates.filter((date) => days.includes(date))
  const requested = params.get('date')
  const date =
    requested && days.includes(requested)
      ? requested
      : available.includes(today())
        ? today()
        : (available[0] ?? today())

  return (
    <section>
      <h2 className="text-xl font-extrabold">Sessions</h2>
      <div className="mt-4">
        <DatePicker
          size="lg"
          value={date}
          availableDates={movie.availableDates}
          onChange={(value) => setParams({ date: value }, { replace: true, preventScrollReset: true })}
        />
      </div>
      <div className="mt-8">
        {available.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon />}
            title="No upcoming sessions"
            description="This film has no showtimes scheduled for the next 7 days."
            className="rounded-2xl bg-surface/50"
          />
        ) : (
          <MovieSessions movie={movie} date={date} />
        )}
      </div>
    </section>
  )
}

function ComingSoonNotice({ movie }: { movie: MovieDetail }) {
  const { notify, isPending, isNotified } = useNotifyMe(movie)

  return (
    <section className="rounded-2xl bg-surface p-8">
      <span className="text-xs font-extrabold tracking-wide text-warning uppercase">Coming soon</span>
      <h2 className="mt-2 text-xl font-extrabold">In cinemas from {formatReleaseDate(movie.releaseDate)}</h2>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Sessions for this title are not on sale yet. Get notified as soon as tickets become available.
      </p>
      <Button className="mt-6" onClick={notify} loading={isPending} disabled={isNotified} variant={isNotified ? 'secondary' : 'primary'}>
        {!isPending && (isNotified ? <CheckIcon /> : <BellIcon />)}
        {isNotified ? "You'll be notified" : 'Notify Me'}
      </Button>
    </section>
  )
}

function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{children}</dd>
    </div>
  )
}

function MovieDetails({ movie }: { movie: MovieDetail }) {
  return (
    <aside className="w-[405px] shrink-0">
      <h2 className="text-xl font-extrabold">Details</h2>
      <dl className="mt-5 space-y-4">
        {movie.director && <DetailItem label="Director">{movie.director}</DetailItem>}
        {movie.cast && <DetailItem label="Main cast">{movie.cast}</DetailItem>}
        <DetailItem label="Duration">{movie.runtimeMinutes} minutes</DetailItem>
        <DetailItem label="Release date">{formatReleaseDate(movie.releaseDate)}</DetailItem>
        {movie.genres.length > 0 && (
          <DetailItem label="Genre">{movie.genres.map((genre) => genre.name).join(', ')}</DetailItem>
        )}
        {movie.formats.length > 0 && (
          <DetailItem label="Formats">{movie.formats.map((format) => format.name).join(', ')}</DetailItem>
        )}
        {!movie.isComingSoon && <DetailItem label="From">{formatPrice(movie.fromPrice)}</DetailItem>}
      </dl>
      <div className="mt-6 rounded-xl border border-warning/30 bg-warning/8 p-4">
        <p className="text-[11px] font-extrabold tracking-[0.08em] text-warning uppercase">Rating note</p>
        <p className="mt-1.5 text-[13px] leading-5 text-warning/90">
          {movie.ageRating.code} · {movie.ageRating.description}
        </p>
      </div>
    </aside>
  )
}

function MovieSkeleton() {
  return (
    <>
      <section className="relative h-[566px] bg-surface/30">
        <div className="absolute bottom-12 left-[60px] flex items-end gap-10">
          <Skeleton className="h-[374px] w-[288px] rounded-2xl" />
          <div className="w-[560px] pb-2">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="mt-5 h-11 w-96" />
            <Skeleton className="mt-5 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-6 h-6 w-64 rounded-full" />
          </div>
        </div>
      </section>
      <div className="flex gap-16 px-[52px] pt-10 pb-24">
        <div className="flex-1">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-4 h-[62px] w-[460px]" />
          <Skeleton className="mt-8 h-[134px] w-[451px] rounded-2xl" />
        </div>
        <div className="w-[405px] space-y-4">
          <Skeleton className="h-7 w-28" />
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </>
  )
}
