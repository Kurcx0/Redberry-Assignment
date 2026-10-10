import type { Order } from '@/api/types'
import { CheckIcon } from '@/components/icons'
import Poster from '@/components/movies/Poster'
import Button from '@/components/ui/Button'
import { formatPrice, formatShortDate } from '@/lib/format'

type ConfirmationProps = {
  order: Order
  onViewTickets: () => void
  onClose: () => void
}

export default function Confirmation({ order, onViewTickets, onClose }: ConfirmationProps) {
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
      <span className="mt-4 rounded-full bg-surface-2 px-4 py-1.5 text-xs font-bold tracking-wide">
        ORDER #{order.reference}
      </span>

      <div className="mt-7 w-full max-w-[560px] rounded-2xl bg-surface p-5 text-left">
        <div className="flex items-center gap-4">
          <Poster src={session.movie.posterUrl} alt="" className="h-[68px] w-12 shrink-0 rounded-md" />
          <div className="min-w-0">
            <p className="truncate font-bold">{session.movie.title}</p>
            <p className="mt-1 text-xs text-muted">
              {session.venue.name} · Hall {session.hall.name} · {formatShortDate(session.date)} · {session.time}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {session.format.name} · {session.language.name}
            </p>
          </div>
        </div>
        <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
          {order.tickets.map((ticket) => (
            <div key={ticket.id} className="flex justify-between">
              <dt className="text-muted">
                Seat <span className="font-semibold text-white">{ticket.seatCode}</span> · {ticket.ticketType.name}
              </dt>
              <dd className="font-semibold">{formatPrice(ticket.price)}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-line pt-3">
            <dt className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Total paid</dt>
            <dd className="text-xl font-bold">{formatPrice(order.totalPrice)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex gap-3">
        <Button onClick={onViewTickets}>View my tickets</Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
