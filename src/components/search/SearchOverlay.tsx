import { useQuery } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { searchMovies } from '@/api/movies'
import type { Movie } from '@/api/types'
import { CloseIcon, PopcornIcon, SearchIcon } from '@/components/icons'
import Poster from '@/components/movies/Poster'
import Button from '@/components/ui/Button'
import ErrorState from '@/components/ui/ErrorState'
import Modal from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import { formatPrice, formatRuntime } from '@/lib/format'
import { useUiStore } from '@/stores/ui'

const PANEL_WIDTH = 480

function useAnchorPosition(open: boolean) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!open) return
    const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-zoom')) || 1
    const anchor = document.querySelector<HTMLElement>('[data-search-anchor]')
    const viewport = document.documentElement.clientWidth / zoom
    if (anchor) {
      const rect = anchor.getBoundingClientRect()
      setPosition({
        top: Math.max(30, rect.top / zoom),
        left: Math.max(24, Math.min(rect.right / zoom, viewport - 24) - PANEL_WIDTH),
      })
    } else {
      setPosition({ top: 30, left: (viewport - PANEL_WIDTH) / 2 })
    }
  }, [open])

  return position
}

export default function SearchOverlay() {
  const open = useUiStore((state) => state.searchOpen)
  const close = useUiStore((state) => state.closeSearch)
  const position = useAnchorPosition(open)

  return (
    <Modal open={open && !!position} onClose={close} bare label="Search" position={position ?? undefined}>
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
      <span className="text-white">{text.slice(index, index + query.length)}</span>
      {text.slice(index + query.length)}
    </span>
  )
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
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

  function clearText() {
    setText('')
    inputRef.current?.focus()
  }

  return (
    <div style={{ width: PANEL_WIDTH }}>
      <div className="flex h-[41px] items-center gap-2 rounded-full bg-white/10 pr-2 pl-4 backdrop-blur-md">
        <SearchIcon />
        <input
          ref={inputRef}
          autoFocus
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Search films and live events"
          aria-label="Search films and live events"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
        {text && (
          <button
            type="button"
            onClick={clearText}
            aria-label="Clear search"
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
          >
            <CloseIcon className="size-3.5" />
          </button>
        )}
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-line bg-page shadow-2xl shadow-black/60">
        {!text.trim() && (
          <Message
            icon={<PopcornIcon className="size-5" />}
            title="What do you want to watch?"
            description="Search by title, director or cast"
            onBrowse={browseSessions}
          />
        )}

        {loading && (
          <div className="space-y-[18px] px-[18px] py-5">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex items-center gap-3.5">
                <Skeleton className="h-14 w-10 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && isError && <ErrorState onRetry={() => refetch()} />}

        {!loading && !isError && data && query && data.length === 0 && (
          <Message
            icon={<SearchIcon className="size-5" />}
            title={`No results for “${query}”`}
            description="Check the spelling or try another film or live event."
            onBrowse={browseSessions}
          />
        )}

        {!loading && !isError && data && data.length > 0 && (
          <div className="px-[18px] pt-5 pb-3">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <p className="font-semibold tracking-[0.08em] uppercase">Films &amp; Events</p>
              <p>
                {data.length} {data.length === 1 ? 'result' : 'results'}
              </p>
            </div>
            <ul className="mt-2">
              {data.map((movie) => (
                <SearchResult key={movie.id} movie={movie} query={query} onSelect={onClose} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
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
    <div className="flex flex-col items-center px-6 pt-10 pb-9 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface text-white">{icon}</span>
      <p className="mt-6 text-sm font-semibold">{title}</p>
      <p className="mt-1.5 text-[13px] text-muted">{description}</p>
      <Button variant="dark" className="mt-6" onClick={onBrowse}>
        Browse all sessions
      </Button>
    </div>
  )
}

function SearchResult({ movie, query, onSelect }: { movie: Movie; query: string; onSelect: () => void }) {
  const content = (
    <>
      <Poster src={movie.posterUrl} alt="" className="h-14 w-10 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          <Highlight text={movie.title} query={query} />
        </p>
        <p className="mt-1 text-xs text-muted">
          {movie.kind === 'event' ? 'Event' : 'Film'} · {movie.ageRating.code} · {formatRuntime(movie.runtimeMinutes)}
        </p>
      </div>
      {movie.isComingSoon ? (
        <span className="shrink-0 text-[13px] font-extrabold text-warning">Coming Soon</span>
      ) : (
        <span className="shrink-0 text-[13px] font-extrabold">from {formatPrice(movie.fromPrice)}</span>
      )}
    </>
  )

  return (
    <li>
      {movie.isComingSoon ? (
        <div className="-mx-2 flex items-center gap-3.5 px-2 py-2">{content}</div>
      ) : (
        <Link
          to={`/movies/${movie.slug}`}
          onClick={onSelect}
          className="-mx-2 flex items-center gap-3.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/5"
        >
          {content}
        </Link>
      )}
    </li>
  )
}
