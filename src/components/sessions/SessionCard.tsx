import clsx from 'clsx'
import type { Session } from '@/api/types'
import { TicketIcon } from '@/components/icons'
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
        'flex h-[104px] w-[252px] shrink-0 flex-col justify-between rounded-2xl p-[15px] text-left transition-colors',
        inactive ? 'cursor-not-allowed bg-[#111526] text-dim' : 'bg-surface hover:bg-surface-2',
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-xl leading-6 font-extrabold">{session.time}</span>
        <span
          className={clsx(
            'flex h-[23px] items-center rounded-full px-3 text-xs font-extrabold uppercase',
            inactive ? 'bg-surface/60' : 'bg-surface-2',
          )}
        >
          {session.format.name}
        </span>
      </span>
      <span className="flex items-center justify-between gap-2 text-[13px]">
        <span className={clsx('truncate', !inactive && 'text-muted')} title={session.language.name}>
          {session.language.name}
        </span>
        {soldOut ? (
          <span className="shrink-0 text-muted/60">Sold out</span>
        ) : (
          <span
            className={clsx(
              'flex shrink-0 items-center gap-1.5',
              !inactive && (session.seatsLeft <= FEW_SEATS ? 'text-primary' : 'text-success'),
            )}
          >
            <TicketIcon className="size-3.5" />
            {session.seatsLeft} left
          </span>
        )}
      </span>
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-[13px] font-semibold">
          {session.venue.name} · Hall {session.hall.name}
        </span>
        <span className="shrink-0 text-base font-extrabold">{formatPrice(session.price)}</span>
      </span>
    </button>
  )
}
