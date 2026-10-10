import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { useState } from 'react'
import { getComingSoon } from '@/api/movies'
import type { Movie } from '@/api/types'
import { BellIcon, CalendarIcon, CheckIcon } from '@/components/icons'
import { AgeBadge } from '@/components/movies/Badges'
import Poster from '@/components/movies/Poster'
import Button, { buttonClasses } from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useMe } from '@/hooks/useMe'
import { useNotifyMe } from '@/hooks/useNotifyMe'
import { formatRuntime } from '@/lib/format'
import Section from './Section'

export default function ComingSoon() {
  const { user } = useMe()
  const [expanded, setExpanded] = useState(false)
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: ['movies', 'coming-soon', user?.id ?? 'guest'],
    queryFn: () => getComingSoon(),
  })

  return (
    <Section
      title="Coming Soon"
      className="pb-16"
      action={
        !!data?.length && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            {expanded ? 'Show less' : 'See all'}
          </button>
        )
      }
    >
      {isPending && (
        <div className="flex gap-6 overflow-hidden px-[72px]">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[148px] w-[465px] shrink-0 rounded-2xl" />
          ))}
        </div>
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
        <div
          className={clsx(
            'flex gap-6 px-[72px]',
            expanded ? 'flex-wrap' : 'thin-scrollbar overflow-x-auto pb-4',
          )}
        >
          {data.map((movie) => (
            <ComingSoonCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </Section>
  )
}

function ComingSoonCard({ movie }: { movie: Movie }) {
  const { notify, isPending, isNotified } = useNotifyMe(movie)
  const genre = movie.genres[0]?.name

  return (
    <article className="flex h-[148px] w-[465px] shrink-0 gap-4 rounded-2xl border border-line bg-surface p-2">
      <Poster
        src={movie.backdropUrl ?? movie.posterUrl}
        alt={movie.title}
        className="h-full w-[231px] shrink-0 rounded-xl"
      />
      <div className="flex min-w-0 flex-1 flex-col py-1.5 pr-2">
        <p className="text-[11px] font-extrabold tracking-wide text-primary uppercase">
          In cinemas {dayjs(movie.releaseDate).format('D MMMM')}
        </p>
        <h3 className="mt-1.5 truncate text-base font-extrabold" title={movie.title}>
          {movie.title}
        </h3>
        <p className="mt-1 truncate text-xs text-muted">
          {genre ? `${genre} · ` : ''}
          {formatRuntime(movie.runtimeMinutes)}
        </p>
        <AgeBadge rating={movie.ageRating} className="mt-2 self-start" />
        <div className="mt-auto">
          {isNotified ? (
            <span className={buttonClasses('subtle', 'sm', 'cursor-default')}>
              <CheckIcon />
              Reminder set
            </span>
          ) : (
            <Button variant="outline" size="sm" onClick={notify} loading={isPending}>
              {!isPending && <BellIcon />}
              Notify Me
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
