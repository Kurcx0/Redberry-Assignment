import type { ReactNode } from 'react'
import type { Order } from '@/api/types'
import { AgeBadge } from '@/components/movies/Badges'
import Poster from '@/components/movies/Poster'
import Button from '@/components/ui/Button'
import { formatPrice, formatRuntime, formatShortDate, sessionDateTime } from '@/lib/format'

type TicketCardProps = {
  order: Order
  onRefund?: (order: Order) => void
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium tracking-[0.1em] text-muted uppercase">{label}</p>
      <p className="mt-1 text-[13px] font-semibold">{children}</p>
    </div>
  )
}

export default function TicketCard({ order, onRefund }: TicketCardProps) {
  const { session } = order
  const refundDeadline = sessionDateTime(session.date, session.time).subtract(2, 'hour')

  return (
    <article className="flex items-stretch gap-6 rounded-2xl bg-surface p-5">
      <Poster src={session.movie.posterUrl} alt={session.movie.title} className="h-[124px] w-[84px] shrink-0 rounded-lg" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h3 className="truncate text-lg font-bold">{session.movie.title}</h3>
          <AgeBadge rating={session.movie.ageRating} />
          <span className="text-[13px] text-muted">{formatRuntime(session.movie.runtimeMinutes)}</span>
        </div>
        <div className="mt-4 grid max-w-[640px] grid-cols-3 gap-6">
          <Info label="Date">
            {formatShortDate(session.date)} · {session.time}
          </Info>
          <Info label="Venue">
            {session.venue.name} · Hall {session.hall.name}
          </Info>
          <Info label="Format">
            {session.format.name} · {session.language.name}
          </Info>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-medium tracking-[0.1em] text-muted uppercase">Seats</span>
          {order.tickets.map((ticket) => (
            <span key={ticket.id} className="rounded-md bg-surface-2 px-2 py-1 text-xs font-semibold">
              {ticket.seatCode} · {ticket.ticketType.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex w-[220px] shrink-0 flex-col border-l border-dashed border-line pl-6">
        <p className="text-[10px] font-medium tracking-[0.1em] text-muted uppercase">Order</p>
        <p className="text-sm font-bold">#{order.reference}</p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="text-xs text-muted">Total paid</span>
          <span className="text-2xl font-bold">{formatPrice(order.totalPrice)}</span>
        </div>
        {order.isUpcoming && onRefund ? (
          <>
            <Button
              variant="secondary"
              size="md"
              className="mt-3 w-full"
              disabled={!order.isRefundable}
              onClick={() => onRefund(order)}
              title={order.isRefundable ? undefined : 'Refunds close 2 hours before the session starts'}
            >
              Refund
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted">
              {order.isRefundable
                ? `Refundable until ${refundDeadline.format('HH:mm, ddd D MMM')}`
                : 'Refunds close 2 hours before the session starts'}
            </p>
          </>
        ) : (
          <p className="mt-3 rounded-full bg-surface-2 py-1.5 text-center text-xs font-semibold text-muted">
            {order.status === 'refunded' ? 'Refunded' : 'Session ended'}
          </p>
        )}
      </div>
    </article>
  )
}
