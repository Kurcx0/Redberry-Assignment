import clsx from 'clsx'
import { Fragment } from 'react'
import type { Seat, SeatMap as SeatMapData, SeatState } from '@/api/types'

type DisplayState = SeatState | 'selected'

type SeatMapProps = {
  map: SeatMapData
  selectedIds: Set<number>
  contested: Set<string>
  onToggle: (seat: Seat, section: string) => void
}

const seatStyles: Record<Exclude<DisplayState, 'unavailable'>, string> = {
  available: 'border border-white/12 bg-surface-2 text-white hover:border-white/50 hover:bg-surface-3',
  selected: 'bg-primary text-white shadow-[0_0_0_3px_rgba(232,51,26,0.25)]',
  sold: 'cursor-not-allowed bg-surface text-dim line-through',
  held: 'cursor-not-allowed border border-dashed border-warning/50 bg-warning/10 text-warning/70',
}

const legend = [
  ['Available', 'border border-white/12 bg-surface-2'],
  ['Selected', 'bg-primary'],
  ['Sold', 'bg-surface'],
  ['Held by another user', 'border border-dashed border-warning/50 bg-warning/10'],
] as const

function displayState(seat: Seat, selectedIds: Set<number>, contested: Set<string>): DisplayState {
  if (contested.has(seat.code)) return 'sold'
  if (selectedIds.has(seat.id)) return 'selected'
  if (seat.isMine) return 'available'
  return seat.state
}

function rowRange(rows: { label: string }[]) {
  if (rows.length === 0) return ''
  const first = rows[0].label
  const last = rows[rows.length - 1].label
  return first === last ? `Row ${first}` : `Rows ${first}–${last}`
}

export default function SeatMap({ map, selectedIds, contested, onToggle }: SeatMapProps) {
  return (
    <div>
      <div className="mx-auto mb-8 flex h-8 w-full items-center justify-center rounded-lg bg-surface-2 text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">
        Screen
      </div>

      <div className="space-y-7">
        {map.sections.map((section) => (
          <section key={section.name} aria-label={section.name}>
            <p className="mb-3 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
              {section.name} · {rowRange(section.rows)}
            </p>
            <div className="flex flex-col items-center gap-1.5">
              {section.rows.map((row) => (
                <div key={row.label} className="flex items-center gap-1.5">
                  <span className="w-6 text-center text-xs font-semibold text-muted">{row.label}</span>
                  {row.seats.map((seat) => {
                    const state = displayState(seat, selectedIds, contested)

                    return (
                      <Fragment key={seat.id}>
                        {state === 'unavailable' ? (
                          <span className="size-[38px]" aria-hidden />
                        ) : (
                          <button
                            type="button"
                            disabled={state === 'sold' || state === 'held'}
                            onClick={() => onToggle(seat, section.name)}
                            aria-pressed={state === 'selected'}
                            aria-label={`Seat ${seat.code}, ${state === 'held' ? 'held by another user' : state}`}
                            className={clsx(
                              'flex size-[38px] items-center justify-center rounded-lg text-xs font-semibold transition-colors',
                              seatStyles[state],
                            )}
                          >
                            {seat.label}
                          </button>
                        )}
                        {seat.aisleAfter && <span className="w-5" aria-hidden />}
                      </Fragment>
                    )
                  })}
                  <span className="w-6 text-center text-xs font-semibold text-muted">{row.label}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs text-muted">
        {legend.map(([label, swatch]) => (
          <li key={label} className="flex items-center gap-2">
            <span className={clsx('size-4 rounded', swatch)} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}
