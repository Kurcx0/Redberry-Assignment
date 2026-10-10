import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { Popcorn, Search, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { searchMovies } from '@/api/movies'
import type { Movie } from '@/api/types'
import Poster from '@/components/movies/Poster'
import Button from '@/components/ui/Button'
import ErrorState from '@/components/ui/ErrorState'
import Modal from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import { formatPrice, formatRuntime } from '@/lib/format'
import { useUiStore } from '@/stores/ui'

export default function SearchOverlay() {
  const open = useUiStore((state) => state.searchOpen)
  const close = useUiStore((state) => state.closeSearch)

  return (
    <Modal open={open} onClose={close} align="top" bare label="Search" className="mt-2 max-w-[760px]">
      <SearchPanel onClose={close} />
    </Modal>
  )
}

function useDebounced(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

function Highlight({ text, query }: { text: string; query: string }) {
  const index = text.toLowerCase().indexOf(query.toLowerCase())
  if (!query || index === -1) return <span className="text-white">{text}</span>

  return (
    <span className="text-muted">
      {text.slice(0, index)}
      <span className="font-bold text-white">{text.slice(index, index + query.length)}</span>
      {text.slice(index + query.length)}
    </span>
  )
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const query = useDebounced(text.trim(), 300)

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchMovies(query),
    enabled: query.length > 0,
    staleTime: 60_000,
  })

  const typing = text.trim() !== query
  const loading = !!text.trim() && (typing || (isFetching && !data))

  function browseSessions() {
    onClose()
    navigate('/sessions')
  }

  return (
    <>
      <div className="flex h-[60px] items-center gap-3 rounded-full border border-white/10 bg-[#161616] pr-2.5 pl-6 shadow-2xl shadow-black/60">
        <Search className="size-5 shrink-0 text-muted" />
        <input
          autoFocus
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Search films and live events"
          aria-label="Search films and live events"
          className="h-full flex-1 bg-transparent text-lg outline-none placeholder:text-dim"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-[#070c1c] shadow-2xl shadow-black/60">
        {!text.trim() && (
          <Message
            icon={<Popcorn className="size-7" />}
            title="What do you want to watch?"
            description="Search by title, director or cast"
            onBrowse={browseSessions}
          />
        )}

        {loading && (
          <div className="space-y-5 p-6">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-[64px] w-[46px] rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && isError && <ErrorState onRetry={() => refetch()} />}

        {!loading && !isError && data && query && data.length === 0 && (
          <Message
            icon={<Search className="size-7" />}
            title={`No results for “${query}”`}
            description="Check the spelling or try another film or live event."
            onBrowse={browseSessions}
          />
        )}

        {!loading && !isError && data && data.length > 0 && (
          <div className="p-6 pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold tracking-[0.08em] text-muted uppercase">Films &amp; Events</p>
              <p className="text-sm text-muted">
                {data.length} {data.length === 1 ? 'result' : 'results'}
              </p>
            </div>
            <ul className="mt-3">
              {data.map((movie) => (
                <SearchResult key={movie.id} movie={movie} query={query} onSelect={onClose} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  )
}

type MessageProps = {
  icon: ReactNode
  title: string
  description: string
  onBrowse: () => void
}

function Message({ icon, title, description, onBrowse }: MessageProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-surface-2 text-white">
        {icon}
      </span>
      <p className="mt-6 text-xl font-bold">{title}</p>
      <p className="mt-2 text-muted">{description}</p>
      <Button variant="secondary" size="lg" className="mt-7 px-8" onClick={onBrowse}>
        Browse all sessions
      </Button>
    </div>
  )
}

function SearchResult({ movie, query, onSelect }: { movie: Movie; query: string; onSelect: () => void }) {
  return (
    <li>
      <Link
        to={`/movies/${movie.slug}`}
        onClick={onSelect}
        className="-mx-3 flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
      >
        <Poster src={movie.posterUrl} alt="" className="h-[64px] w-[46px] shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg">
            <Highlight text={movie.title} query={query} />
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {movie.kind === 'event' ? 'Event' : 'Film'} · {movie.ageRating.code} ·{' '}
            {formatRuntime(movie.runtimeMinutes)}
          </p>
        </div>
        <span
          className={clsx(
            'shrink-0 text-base font-bold',
            movie.isComingSoon ? 'text-warning' : 'text-white',
          )}
        >
          {movie.isComingSoon ? 'Coming Soon' : `from ${formatPrice(movie.fromPrice)}`}
        </span>
      </Link>
    </li>
  )
}
