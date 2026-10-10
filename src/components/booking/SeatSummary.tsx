import clsx from 'clsx'
import type { TicketType, TicketTypeSlug } from '@/api/types'
import { CloseIcon } from '@/components/icons'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/format'

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
      <h3 className="text-sm font-extrabold">
        Your seats <span className="font-normal text-muted">· Max {maxSeats}</span>
      </h3>

      {seats.length === 0 ? (
        <p className="mt-2 text-[13px] leading-5 text-muted">
          Pick up to {maxSeats} seats from the map. Each seat can carry its own ticket type.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {seats.map((seat) => {
            const violation = violations.get(seat.id)
            return (
              <li
                key={seat.id}
                className={clsx('rounded-xl border bg-surface p-3', violation ? 'border-primary/60' : 'border-transparent')}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13px]">
                    <span className="text-muted">Seat</span> <span className="font-extrabold">{seat.code}</span>
                    <span className="ml-1.5 text-xs text-muted">· {seat.section}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold">
                      {formatPrice(ticketPrice(sessionPrice, ratioOf(seat.ticketType)))}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(seat.id)}
                      aria-label={`Remove seat ${seat.code}`}
                      className="flex size-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <CloseIcon className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={`Ticket type for ${seat.code}`}>
                  {types.map((type) => (
                    <button
                      key={type.slug}
                      type="button"
                      role="radio"
                      aria-checked={seat.ticketType === type.slug}
                      title={type.note ?? undefined}
                      onClick={() => onTicketTypeChange(seat.id, type.slug)}
                      className={clsx(
                        'h-8 rounded-full text-[11px] font-semibold transition-colors',
                        seat.ticketType === type.slug
                          ? 'bg-primary text-white'
                          : 'bg-surface-2 text-white/80 hover:bg-surface-3',
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

      <div className="mt-auto pt-6">
        {blockReason && seats.length > 0 && (
          <p className="mb-3 rounded-lg bg-warning/10 px-3 py-2 text-xs leading-5 text-warning">{blockReason}</p>
        )}
        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Subtotal</span>
          <span className="text-2xl font-extrabold">{formatPrice(subtotal)}</span>
        </div>
        <Button size="lg" className="mt-4 w-full" disabled={!canContinue} loading={submitting} onClick={onSubmit}>
          Next: Checkout
        </Button>
      </div>
    </div>
  )
}
