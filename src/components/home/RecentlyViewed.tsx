import { Link } from 'react-router'
import { AgeBadge } from '@/components/movies/Badges'
import Poster from '@/components/movies/Poster'
import { formatRuntime } from '@/lib/format'
import { useRecentlyViewed } from '@/lib/recentlyViewed'
import Section, { CardRow } from './Section'

export default function RecentlyViewed() {
  const movies = useRecentlyViewed()

  if (movies.length === 0) return null

  return (
    <Section title="Recently viewed" uppercase={false}>
      <CardRow>
        {movies.map((movie) => (
          <Link
            key={movie.slug}
            to={`/movies/${movie.slug}`}
            className="flex w-[288px] shrink-0 items-center gap-3.5 rounded-2xl bg-surface p-3 transition-colors hover:bg-surface-2"
          >
            <Poster src={movie.posterUrl} alt={movie.title} className="h-[68px] w-12 shrink-0 rounded-md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold uppercase">{movie.title}</p>
              <p className="mt-1 truncate text-xs text-muted">
                {movie.genres[0]?.name ?? (movie.kind === 'event' ? 'Event' : 'Film')} ·{' '}
                {formatRuntime(movie.runtimeMinutes)}
              </p>
              <AgeBadge rating={movie.ageRating} className="mt-2 h-5 px-2 text-[11px]" />
            </div>
          </Link>
        ))}
      </CardRow>
    </Section>
  )
}
