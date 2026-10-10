import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { CalendarX2, Ticket, TriangleAlert } from 'lucide-react'
import { getMovieSessions } from '@/api/movies'
import type { MovieDetail, Session, VenueSessions } from '@/api/types'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { ageRestrictionMessage, useBookSession } from '@/hooks/useBookSession'
import { useMe } from '@/hooks/useMe'
import { formatPrice } from '@/lib/format'

type MovieSessionsProps = {
  movie: MovieDetail
  date: string
}

function groupByHall(sessions: Session[]) {
  const halls = new Map<string, Session[]>()
  sessions.forEach((session) => {
    const list = halls.get(session.hall.name) ?? []
    halls.set(session.hall.name, [...list, session])
  })
  return [...halls.entries()].sort(([a], [b]) => a.localeCompare(b))
}

export default function MovieSessions({ movie, date }: MovieSessionsProps) {
  const { user } = useMe()
  const bookSession = useBookSession()
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: ['movie', movie.slug, 'sessions', date],
    queryFn: () => getMovieSessions(movie.slug, date),
  })

  const restricted =
    !!user?.profileComplete && movie.ageRating.minAge > 0 && (user.age ?? 0) < movie.ageRating.minAge

  if (isPending) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index}>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-3 h-[134px] w-[451px] rounded-2xl" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} retrying={isRefetching} className="rounded-2xl bg-surface/50" />
  }

  const venues = data.filter((group) => group.sessions.length > 0)

  if (venues.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="No sessions on this date"
        description="This film has no showtimes on the selected day. Try another date."
        className="rounded-2xl bg-surface/50"
      />
    )
  }

  return (
    <div className="space-y-8">
      {restricted && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {ageRestrictionMessage(movie.ageRating)}
        </div>
      )}
      {venues.map((group) => (
        <VenueGroup
          key={group.venue.id}
          group={group}
          disabled={restricted}
          onSelect={(session) => bookSession(session, movie.ageRating)}
        />
      ))}
    </div>
  )
}

type VenueGroupProps = {
  group: VenueSessions
  disabled: boolean
  onSelect: (session: Session) => void
}

function VenueGroup({ group, disabled, onSelect }: VenueGroupProps) {
  return (
    <section>
      <h3 className="text-sm font-bold">
        {group.venue.name}
        <span className="ml-2 text-xs font-normal text-muted">{group.venue.city}</span>
      </h3>
      <div className="mt-3 flex flex-wrap gap-4">
        {groupByHall(group.sessions).map(([hall, sessions]) => (
          <div key={hall} className="rounded-2xl bg-surface p-3">
            <p className="px-1 text-xs font-semibold text-muted">Hall {hall}</p>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {sessions.map((session) => (
                <SessionTile key={session.id} session={session} disabled={disabled} onSelect={onSelect} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

type SessionTileProps = {
  session: Session
  disabled: boolean
  onSelect: (session: Session) => void
}

function SessionTile({ session, disabled, onSelect }: SessionTileProps) {
  const inactive = disabled || session.isSoldOut

  return (
    <button
      type="button"
      disabled={inactive}
      onClick={() => onSelect(session)}
      aria-label={`${session.time}, hall ${session.hall.name}, ${session.format.name}, ${session.language.name}${session.isSoldOut ? ', sold out' : ''}`}
      className={clsx(
        'flex h-[82px] w-[200px] items-stretch rounded-xl bg-page/70 text-left transition-colors',
        inactive ? 'cursor-not-allowed opacity-45' : 'hover:bg-surface-3',
      )}
    >
      <span className="flex flex-1 flex-col items-center justify-center gap-1.5">
        <span className="text-base font-bold">{session.time}</span>
        <span className="flex items-center gap-1.5 text-[11px]">
          <span className="text-muted" title={session.language.name}>
            {session.language.code}
          </span>
          <span className="rounded bg-surface-3 px-1.5 py-0.5 font-semibold">{session.format.name}</span>
        </span>
      </span>
      <span className="my-3 border-l border-dashed border-line" />
      <span className="flex w-[76px] flex-col items-center justify-center gap-1.5">
        <span className="text-base font-bold text-primary">{formatPrice(session.price)}</span>
        <span className="flex items-center gap-1 text-[11px] text-muted">
          {session.isSoldOut ? (
            'Sold out'
          ) : (
            <>
              <Ticket className="size-3" />
              {session.seatsLeft} left
            </>
          )}
        </span>
      </span>
    </button>
  )
}
