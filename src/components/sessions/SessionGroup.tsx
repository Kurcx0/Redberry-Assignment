import { Link } from 'react-router'
import type { Session, SessionGroup as Group } from '@/api/types'
import { AgeBadge } from '@/components/movies/Badges'
import Poster from '@/components/movies/Poster'
import Skeleton from '@/components/ui/Skeleton'
import { formatRuntime } from '@/lib/format'
import SessionCard from './SessionCard'

type SessionGroupProps = {
  group: Group
  onSelect: (session: Session) => void
}

export default function SessionGroup({ group, onSelect }: SessionGroupProps) {
  const { movie, sessions } = group

  return (
    <article className="border-t border-line pt-6 first:border-0 first:pt-0">
      <div className="flex items-center gap-4">
        <Link to={`/movies/${movie.slug}`} className="shrink-0">
          <Poster src={movie.posterUrl} alt={movie.title} className="h-[77px] w-[55px] rounded-md" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-extrabold">
              <Link to={`/movies/${movie.slug}`} className="hover:underline">
                {movie.title}
              </Link>
            </h3>
            <AgeBadge rating={movie.ageRating} />
          </div>
          <p className="mt-1.5 text-sm text-muted">{formatRuntime(movie.runtimeMinutes)}</p>
        </div>
      </div>
      <div className="thin-scrollbar mt-4 flex gap-3 overflow-x-auto pb-3">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={{ ...session, movie: session.movie ?? movie }}
            onSelect={onSelect}
          />
        ))}
      </div>
    </article>
  )
}

export function SessionGroupSkeleton() {
  return (
    <div className="border-t border-line pt-6 first:border-0 first:pt-0">
      <div className="flex items-center gap-4">
        <Skeleton className="h-[77px] w-[55px] rounded-md" />
        <div className="space-y-2.5">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="mt-4 flex gap-3 overflow-hidden pb-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-[103px] w-[252px] shrink-0 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
