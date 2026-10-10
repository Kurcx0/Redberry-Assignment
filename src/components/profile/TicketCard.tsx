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

const labelClass = 'text-xs leading-[14px] font-semibold tracking-[0.06em] text-muted uppercase'

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className="mt-0.5 text-sm leading-4 font-semibold whitespace-nowrap">{children}</p>
    </div>
  )
}

export default function TicketCard({ order, onRefund }: TicketCardProps) {
  const { session } = order
  const refundDeadline = sessionDateTime(session.date, session.time).subtract(2, 'hour')

  return (
    <article className="flex h-[183px] items-center rounded-[26px] bg-surface pl-[30px]">
      <Poster
        src={session.movie.posterUrl}
        alt={session.movie.title}
        className="h-[133.5px] w-[100px] shrink-0 rounded-[10px]"
      />

      <div className="ml-[18px] min-w-0 flex-1 pr-6">
        <div className="flex h-[22px] items-center gap-2.5">
          <h3 className="truncate text-xl leading-[22px] font-extrabold uppercase">{session.movie.title}</h3>
          <AgeBadge rating={session.movie.ageRating} size="sm" />
          <span className="shrink-0 text-sm text-muted">{formatRuntime(session.movie.runtimeMinutes)}</span>
        </div>
        <div className="mt-3 flex gap-10">
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
        <div className="mt-3 flex items-center gap-2">
          <span className={labelClass}>Seats</span>
          {order.tickets.map((ticket) => (
            <span
              key={ticket.id}
              className="flex h-[21px] items-center rounded-md bg-white/10 px-2.5 text-xs font-semibold whitespace-nowrap"
            >
              {ticket.seatCode} · {ticket.ticketType.name}
            </span>
          ))}
        </div>
      </div>

      <div className="relative flex h-full w-[300px] shrink-0 flex-col justify-between py-5 pr-6 pl-[25px]">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-px bg-[repeating-linear-gradient(to_bottom,#2a2c3d_0_3.05px,transparent_3.05px_9.15px,#2a2c3d_9.15px_12.2px)]"
        />
        <div>
          <p className={labelClass}>Order</p>
          <p className="text-sm leading-4 font-semibold">#{order.reference}</p>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-muted">Total paid</span>
            <span className="text-[28px] leading-[26px] font-extrabold">{formatPrice(order.totalPrice)}</span>
          </div>
          {order.isUpcoming && onRefund ? (
            <>
              <Button
                variant="subtle"
                size="md"
                className="mt-2.5 w-full hover:bg-white/15 disabled:text-dim disabled:hover:bg-white/10"
                disabled={!order.isRefundable}
                onClick={() => onRefund(order)}
              >
                Refund
              </Button>
              <p className="mt-2.5 text-center text-xs leading-4 text-muted">
                {order.isRefundable
                  ? `Refundable until ${refundDeadline.format('HH:mm, ddd D MMM')}`
                  : 'Refunds close 2 hours before the session starts'}
              </p>
            </>
          ) : (
            <p className="mt-2.5 flex h-[34px] items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-muted">
              {order.status === 'refunded' ? 'Refunded' : 'Session ended'}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
