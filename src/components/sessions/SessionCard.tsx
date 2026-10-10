import clsx from 'clsx'
import { Ticket } from 'lucide-react'
import type { Session } from '@/api/types'
import { formatPrice } from '@/lib/format'

const FEW_SEATS = 10

type SessionCardProps = {
  session: Session
  onSelect: (session: Session) => void
  disabled?: boolean
}

export default function SessionCard({ session, onSelect, disabled }: SessionCardProps) {
  const soldOut = session.isSoldOut
  const inactive = soldOut || disabled

  return (
    <button
      type="button"
      disabled={inactive}
      onClick={() => onSelect(session)}
      aria-label={`${session.time}, ${session.venue.name} hall ${session.hall.name}, ${session.format.name}${soldOut ? ', sold out' : ''}`}
      className={clsx(
        'w-[252px] shrink-0 rounded-xl bg-surface p-4 text-left transition-colors',
        inactive ? 'cursor-not-allowed text-dim' : 'hover:bg-surface-2',
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-xl font-bold">{session.time}</span>
        <span className="rounded-full bg-surface-3 px-2.5 py-1 text-[11px] font-semibold uppercase">
          {session.format.name}
        </span>
      </span>
      <span className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className={clsx('truncate', !inactive && 'text-muted')} title={session.language.name}>
          {session.language.name}
        </span>
        {soldOut ? (
          <span className="shrink-0">Sold out</span>
        ) : (
          <span
            className={clsx(
              'flex shrink-0 items-center gap-1 font-medium',
              !inactive && (session.seatsLeft <= FEW_SEATS ? 'text-primary' : 'text-success'),
            )}
          >
            <Ticket className="size-3.5" />
            {session.seatsLeft} left
          </span>
        )}
      </span>
      <span className="mt-2 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-semibold">
          {session.venue.name} · Hall {session.hall.name}
        </span>
        <span className="shrink-0 text-base font-bold">
          <span className={clsx('text-[11px] font-medium', !inactive && 'text-muted')}>from </span>
          {formatPrice(session.price)}
        </span>
      </span>
    </button>
  )
}
