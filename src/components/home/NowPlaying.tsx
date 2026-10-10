import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { getNowPlaying } from '@/api/movies'
import type { Movie } from '@/api/types'
import { TicketIcon } from '@/components/icons'
import { AgeBadge } from '@/components/movies/Badges'
import Poster from '@/components/movies/Poster'
import { buttonClasses } from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { formatPrice, formatRuntime } from '@/lib/format'
import Section, { CardRow } from './Section'

export default function NowPlaying() {
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: ['movies', 'now-playing'],
    queryFn: () => getNowPlaying(12),
  })

  return (
    <Section
      title="Now Playing"
      action={
        <Link to="/sessions" className="text-[13px] font-semibold text-primary hover:underline">
          See all
        </Link>
      }
    >
      {isPending && (
        <CardRow>
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-[450px] w-[260px] shrink-0 rounded-[18px]" />
          ))}
        </CardRow>
      )}
      {isError && <ErrorState onRetry={() => refetch()} retrying={isRefetching} />}
      {data?.length === 0 && (
        <EmptyState
          icon={<TicketIcon />}
          title="Nothing is playing right now"
          description="Check back soon, new sessions are added every week."
        />
      )}
      {!!data?.length && (
        <CardRow>
          {data.map((movie) => (
            <NowPlayingCard key={movie.id} movie={movie} />
          ))}
        </CardRow>
      )}
    </Section>
  )
}

function NowPlayingCard({ movie }: { movie: Movie }) {
  const genre = movie.genres[0]?.name

  return (
    <article className="group flex h-[450px] w-[260px] shrink-0 flex-col rounded-[18px] border border-line bg-surface p-3.5 transition-[width] duration-500 ease-out focus-within:w-[445px] hover:w-[445px]">
      <Link
        to={`/movies/${movie.slug}`}
        className="relative block h-[285px] shrink-0 overflow-hidden rounded-xl bg-surface-2 transition-[height] duration-500 ease-out group-focus-within:h-[219px] group-hover:h-[219px]"
        aria-label={movie.title}
      >
        <Poster
          src={movie.posterUrl}
          alt={movie.title}
          className="absolute inset-0 size-full transition-opacity duration-500 group-focus-within:opacity-0 group-hover:opacity-0"
        />
        {movie.backdropUrl && (
          <img
            src={movie.backdropUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100"
          />
        )}
      </Link>
      <h3 className="mt-3.5 truncate text-xl font-extrabold">
        <Link to={`/movies/${movie.slug}`} className="hover:underline">
          {movie.title}
        </Link>
      </h3>
      <p className="mt-1 truncate text-sm text-muted">
        {genre ? `${genre} · ` : ''}
        {formatRuntime(movie.runtimeMinutes)}
      </p>
      <AgeBadge rating={movie.ageRating} className="mt-2.5 self-start" />
      {movie.synopsis && (
        <p className="line-clamp-3 max-h-0 text-sm leading-5 text-muted opacity-0 transition-all duration-500 group-focus-within:mt-3 group-focus-within:max-h-[60px] group-focus-within:opacity-100 group-hover:mt-3 group-hover:max-h-[60px] group-hover:opacity-100">
          {movie.synopsis}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between gap-3">
        <span className="text-sm font-extrabold">From {formatPrice(movie.fromPrice)}</span>
        <Link to={`/movies/${movie.slug}`} className={buttonClasses('primary', 'md')}>
          Buy Ticket
        </Link>
      </div>
    </article>
  )
}
