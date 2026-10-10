import type { Order } from '@/api/types'
import { CheckIcon } from '@/components/icons'
import Poster from '@/components/movies/Poster'
import Button from '@/components/ui/Button'
import { formatPrice, formatShortDate } from '@/lib/format'

type ConfirmationProps = {
  order: Order
  onViewTickets: () => void
  onBackHome: () => void
}

function ticketBreakdown(order: Order) {
  const counts = new Map<string, number>()
  order.tickets.forEach((ticket) =>
    counts.set(ticket.ticketType.name, (counts.get(ticket.ticketType.name) ?? 0) + 1),
  )
  return [...counts.entries()].map(([name, count]) => `${count} x ${name}`).join(', ')
}

export default function Confirmation({ order, onViewTickets, onBackHome }: ConfirmationProps) {
  const { session } = order

  return (
    <div className="flex flex-col items-center px-10 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-success text-page">
        <CheckIcon className="size-7" />
      </span>
      <h2 id="booking-title" className="mt-5 text-2xl font-extrabold">
        Booking confirmed!
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Your tickets are ready. We&apos;ve sent the confirmation to {order.contact.email}.
      </p>
      <span className="mt-4 rounded-full bg-surface-2 px-4 py-1.5 text-xs font-extrabold tracking-wide">
        ORDER #{order.reference}
      </span>

      <div className="mt-7 w-full max-w-[560px] rounded-2xl bg-surface p-5 text-left">
        <div className="flex items-center gap-4">
          <Poster src={session.movie.posterUrl} alt="" className="h-[68px] w-12 shrink-0 rounded-md" />
          <div className="min-w-0">
            <p className="truncate font-extrabold uppercase">{session.movie.title}</p>
            <p className="mt-1 text-xs text-muted">
              {session.venue.name} · Hall {session.hall.name} · {formatShortDate(session.date)} · {session.time}
            </p>
          </div>
        </div>
        <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Seats</dt>
            <dd className="font-extrabold">{order.tickets.map((ticket) => ticket.seatCode).join(', ')}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Tickets</dt>
            <dd>{ticketBreakdown(order)}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-3">
            <dt className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Total paid</dt>
            <dd className="text-xl font-extrabold">{formatPrice(order.totalPrice)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex gap-3">
        <Button onClick={onViewTickets}>View my tickets</Button>
        <Button variant="dark" onClick={onBackHome}>
          Back to home
        </Button>
      </div>
    </div>
  )
}
