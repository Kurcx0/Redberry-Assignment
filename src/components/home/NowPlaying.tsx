import { useQuery } from '@tanstack/react-query'
import { Clapperboard } from 'lucide-react'
import { Link } from 'react-router'
import { getNowPlaying } from '@/api/movies'
import type { Movie } from '@/api/types'
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
            <Skeleton key={index} className="h-[477px] w-[258px] shrink-0 rounded-2xl" />
          ))}
        </CardRow>
      )}
      {isError && <ErrorState onRetry={() => refetch()} retrying={isRefetching} />}
      {data?.length === 0 && (
        <EmptyState
          icon={Clapperboard}
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
    <article className="group flex w-[258px] shrink-0 flex-col rounded-2xl bg-surface p-2.5 transition-[width] duration-500 ease-out hover:w-[444px]">
      <Link
        to={`/movies/${movie.slug}`}
        className="relative block h-[357px] overflow-hidden rounded-xl bg-surface-2"
        aria-label={movie.title}
      >
        <Poster
          src={movie.posterUrl}
          alt={movie.title}
          className="absolute inset-0 size-full transition-opacity duration-500 group-hover:opacity-0"
        />
        {movie.backdropUrl && (
          <img
            src={movie.backdropUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col px-1.5 pt-3.5 pb-1">
        <h3 className="truncate text-base font-bold">
          <Link to={`/movies/${movie.slug}`} className="hover:underline">
            {movie.title}
          </Link>
        </h3>
        <div className="mt-2 flex items-center gap-2 text-[13px] text-muted">
          <AgeBadge rating={movie.ageRating} />
          <span className="truncate">
            {genre ? `${genre} · ` : ''}
            {formatRuntime(movie.runtimeMinutes)}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[13px] text-muted">
            from <span className="text-base font-bold text-white">{formatPrice(movie.fromPrice)}</span>
          </span>
          <Link to={`/movies/${movie.slug}`} className={buttonClasses('primary', 'sm')}>
            Buy Ticket
          </Link>
        </div>
      </div>
    </article>
  )
}
