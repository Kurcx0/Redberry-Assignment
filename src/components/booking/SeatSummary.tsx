import clsx from 'clsx'
import type { TicketType, TicketTypeSlug } from '@/api/types'
import { CloseIcon } from '@/components/icons'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/format'
import Subtotal from './Subtotal'

export type SelectedSeat = {
  id: number
  code: string
  section: string
  ticketType: TicketTypeSlug
}

type SeatSummaryProps = {
  seats: SelectedSeat[]
  ticketTypes: TicketType[]
  maxSeats: number
  sessionPrice: number
  violations: Map<number, string>
  blockReason: string | null
  submitting: boolean
  onTicketTypeChange: (seatId: number, ticketType: TicketTypeSlug) => void
  onRemove: (seatId: number) => void
  onSubmit: () => void
}

function ticketPrice(sessionPrice: number, ratio: number) {
  return Math.round(sessionPrice * ratio * 100) / 100
}

export default function SeatSummary({
  seats,
  ticketTypes,
  maxSeats,
  sessionPrice,
  violations,
  blockReason,
  submitting,
  onTicketTypeChange,
  onRemove,
  onSubmit,
}: SeatSummaryProps) {
  const types = [...ticketTypes].sort((a, b) => a.priceRatio - b.priceRatio)
  const ratioOf = (slug: TicketTypeSlug) => ticketTypes.find((type) => type.slug === slug)?.priceRatio ?? 1
  const subtotal = seats.reduce((sum, seat) => sum + ticketPrice(sessionPrice, ratioOf(seat.ticketType)), 0)
  const canContinue = seats.length > 0 && violations.size === 0 && !blockReason

  return (
    <div className="flex h-full flex-col">
      <h3 className="text-sm leading-[15px] font-extrabold">
        Your seats · Max {maxSeats}
      </h3>

      {seats.length === 0 ? (
        <p className="mt-3 text-xs leading-4 text-muted">
          Pick up to {maxSeats} seats from the map. Each seat can carry its own ticket type.
        </p>
      ) : (
        <ul className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto [scrollbar-width:thin]">
          {seats.map((seat) => {
            const violation = violations.get(seat.id)
            return (
              <li
                key={seat.id}
                className={clsx('rounded-2xl bg-surface p-[15px]', violation && 'ring-1 ring-primary/60 ring-inset')}
              >
                <div className="flex h-4 items-center justify-between gap-3">
                  <p className="truncate text-xs leading-4">
                    <span className="text-muted">Seat</span>
                    <span className="ml-3 font-semibold">{seat.code}</span>
                    {seat.section && <span className="ml-1.5 text-muted">· {seat.section}</span>}
                  </p>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm leading-4 font-semibold">
                      {formatPrice(ticketPrice(sessionPrice, ratioOf(seat.ticketType)))}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(seat.id)}
                      aria-label={`Remove seat ${seat.code}`}
                      className="text-muted transition-colors hover:text-white"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>
                <div className="my-3 h-px bg-line" />
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={`Ticket type for ${seat.code}`}>
                  {types.map((type) => (
                    <button
                      key={type.slug}
                      type="button"
                      role="radio"
                      aria-checked={seat.ticketType === type.slug}
                      title={type.note ?? undefined}
                      onClick={() => onTicketTypeChange(seat.id, type.slug)}
                      className={clsx(
                        'h-8 rounded-full text-xs transition-colors',
                        seat.ticketType === type.slug ? 'bg-primary' : 'bg-surface-2 hover:bg-surface-3',
                      )}
                    >
                      {type.name} {Math.round(type.priceRatio * 100)}%
                    </button>
                  ))}
                </div>
                {violation && <p className="mt-2 text-xs text-primary">{violation}</p>}
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-auto pt-[18px]">
        {blockReason && seats.length > 0 && (
          <p className="mb-3 rounded-lg bg-warning/10 px-3 py-2 text-xs leading-5 text-warning">{blockReason}</p>
        )}
        <Subtotal amount={subtotal} />
        <Button className="mt-[11px] w-full" disabled={!canContinue} loading={submitting} onClick={onSubmit}>
          Next: Checkout
        </Button>
      </div>
    </div>
  )
}
