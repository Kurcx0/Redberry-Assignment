import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Link } from 'react-router'
import { getComingSoon } from '@/api/movies'
import type { Movie } from '@/api/types'
import { BellIcon, CalendarIcon, CheckIcon } from '@/components/icons'
import { AgeBadge } from '@/components/movies/Badges'
import Poster from '@/components/movies/Poster'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useMe } from '@/hooks/useMe'
import { useNotifyMe } from '@/hooks/useNotifyMe'
import { formatRuntime } from '@/lib/format'
import Section, { CardRow } from './Section'

export default function ComingSoon() {
  const { user } = useMe()
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: ['movies', 'coming-soon', user?.id ?? 'guest'],
    queryFn: () => getComingSoon(12),
  })

  return (
    <Section title="Coming Soon" className="pb-16">
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
          icon={<CalendarIcon />}
          title="No upcoming releases yet"
          description="New titles will show up here as soon as they are announced."
        />
      )}
      {!!data?.length && (
        <CardRow>
          {data.map((movie) => (
            <ComingSoonCard key={movie.id} movie={movie} />
          ))}
        </CardRow>
      )}
    </Section>
  )
}

function ComingSoonCard({ movie }: { movie: Movie }) {
  const { notify, isPending, isNotified } = useNotifyMe(movie)

  return (
    <article className="flex w-[258px] shrink-0 flex-col rounded-2xl bg-surface p-2.5">
      <Link
        to={`/movies/${movie.slug}`}
        className="relative block h-[357px] overflow-hidden rounded-xl"
        aria-label={movie.title}
      >
        <Poster
          src={movie.posterUrl}
          alt={movie.title}
          className="size-full transition-transform duration-500 hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-full bg-page/80 px-2.5 py-1 text-[11px] font-bold tracking-wide text-warning uppercase backdrop-blur-sm">
          Coming soon
        </span>
      </Link>
      <div className="flex flex-1 flex-col px-1.5 pt-3.5 pb-1">
        <h3 className="truncate text-base font-bold">
          <Link to={`/movies/${movie.slug}`} className="hover:underline">
            {movie.title}
          </Link>
        </h3>
        <div className="mt-2 flex items-center gap-2 text-[13px] text-muted">
          <AgeBadge rating={movie.ageRating} />
          <span>{formatRuntime(movie.runtimeMinutes)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[13px] text-muted">
            <span className="block text-[11px] tracking-wide uppercase">Release</span>
            <span className="font-semibold text-white">{dayjs(movie.releaseDate).format('D MMM YYYY')}</span>
          </span>
          <Button
            variant={isNotified ? 'secondary' : 'outline'}
            size="sm"
            onClick={notify}
            loading={isPending}
            disabled={isNotified}
          >
            {!isPending && (isNotified ? <CheckIcon /> : <BellIcon />)}
            {isNotified ? 'Notified' : 'Notify Me'}
          </Button>
        </div>
      </div>
    </article>
  )
}
