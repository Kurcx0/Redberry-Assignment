import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getFeaturedMovies } from '@/api/movies'
import type { Movie } from '@/api/types'
import { ChevronLeftIcon, ChevronRightIcon, TicketIcon } from '@/components/icons'
import { AgeBadge, Pill, RuntimePill } from '@/components/movies/Badges'
import { buttonClasses } from '@/components/ui/Button'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'

const SLIDE_DURATION = 7000

function releaseLabel(movie: Movie) {
  const release = dayjs(movie.releaseDate)
  if (release.isAfter(dayjs().subtract(3, 'week'))) {
    return `Premiere · Week of ${release.format('D MMM')}`
  }
  return 'Now showing'
}

export default function Hero() {
  const { data: movies, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: ['movies', 'featured'],
    queryFn: getFeaturedMovies,
  })
  const [active, setActive] = useState(0)
  const count = movies?.length ?? 0

  useEffect(() => {
    if (count < 2) return
    const timer = setTimeout(() => setActive((index) => (index + 1) % count), SLIDE_DURATION)
    return () => clearTimeout(timer)
  }, [active, count])

  if (isPending) {
    return (
      <section className="relative h-[760px] bg-surface/40">
        <div className="absolute bottom-[150px] left-[68px] w-[560px]">
          <Skeleton className="h-6 w-56 rounded-full" />
          <Skeleton className="mt-6 h-12 w-96" />
          <Skeleton className="mt-6 h-5 w-full" />
          <Skeleton className="mt-2 h-5 w-4/5" />
          <Skeleton className="mt-8 h-10 w-72 rounded-full" />
        </div>
      </section>
    )
  }

  if (isError || count === 0) {
    return (
      <section className="flex h-[760px] items-center justify-center bg-surface/30">
        <ErrorState
          message={isError ? undefined : 'There are no featured films right now.'}
          onRetry={isError ? () => refetch() : undefined}
          retrying={isRefetching}
        />
      </section>
    )
  }

  const movie = movies[active]

  return (
    <section className="relative h-[760px] overflow-hidden" aria-roledescription="carousel">
      {movies.map((item, index) => (
        <img
          key={item.id}
          src={item.backdropUrl ?? item.posterUrl ?? undefined}
          alt=""
          className={clsx(
            'absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[1200ms] ease-out',
            index === active ? 'scale-100 opacity-100' : 'scale-105 opacity-0',
          )}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-page/95 via-page/55 to-page/0" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-page to-transparent" />

      <div key={movie.id} className="absolute bottom-[150px] left-[68px] w-[580px] animate-pop-in">
        <span className="inline-flex h-6 items-center rounded-full bg-primary/15 px-2.5 text-[11px] font-extrabold tracking-wide text-primary uppercase">
          {releaseLabel(movie)}
        </span>
        <h1 className="mt-4 text-[44px] leading-[1.1] font-extrabold">{movie.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <AgeBadge rating={movie.ageRating} />
          <RuntimePill minutes={movie.runtimeMinutes} />
          {movie.formats.map((format) => (
            <Pill key={format.id}>{format.name}</Pill>
          ))}
        </div>
        {movie.synopsis && (
          <p className="mt-5 line-clamp-3 text-base leading-[1.4] text-white/85">{movie.synopsis}</p>
        )}
        <div className="mt-6 flex gap-3">
          <Link to={`/movies/${movie.slug}`} className={buttonClasses('primary', 'lg')}>
            <TicketIcon />
            Buy tickets
          </Link>
          <Link to="/sessions" className={buttonClasses('glass', 'lg')}>
            All sessions
          </Link>
        </div>
      </div>

      {count > 1 && (
        <div className="absolute right-[68px] bottom-[66px] left-[68px] flex items-center gap-8">
          <div className="flex flex-1 gap-1.5">
            {movies.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show ${item.title}`}
                aria-current={index === active}
                className="group py-2"
                style={{ flex: 1 }}
              >
                <span className="block h-[3px] overflow-hidden rounded-full bg-white/90 transition-colors group-hover:bg-white">
                  {index === active && (
                    <span
                      key={active}
                      className="block h-full animate-progress bg-primary"
                      style={{ animationDuration: `${SLIDE_DURATION}ms` }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActive((active - 1 + count) % count)}
              aria-label="Previous film"
              className="flex size-10 items-center justify-center rounded-full bg-white/12 backdrop-blur-md transition-colors hover:bg-white/25"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setActive((active + 1) % count)}
              aria-label="Next film"
              className="flex size-10 items-center justify-center rounded-full bg-white/12 backdrop-blur-md transition-colors hover:bg-white/25"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
