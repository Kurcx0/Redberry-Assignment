import clsx from 'clsx'
import { Fragment } from 'react'
import type { Seat, SeatMap as SeatMapData, SeatState } from '@/api/types'
import ZoomPan from './ZoomPan'

type DisplayState = SeatState | 'selected'

type SeatMapProps = {
  map: SeatMapData
  selectedIds: Set<number>
  contested: Set<string>
  onToggle: (seat: Seat, section: string) => void
}

const heldPattern = 'bg-[repeating-linear-gradient(135deg,#2a2c3d_0_9px,#34364a_9px_18px)]'

const seatStyles: Record<Exclude<DisplayState, 'unavailable'>, string> = {
  available:
    'border border-dim bg-surface text-white shadow-[0_1px_2px_rgb(0_0_0/0.2)] hover:border-muted hover:bg-surface-2',
  selected: 'border border-page bg-primary text-white',
  sold: 'cursor-not-allowed bg-surface text-dim',
  held: clsx('cursor-not-allowed text-muted', heldPattern),
}

const legend = [
  ['Available', 'border border-dim bg-surface'],
  ['Selected', 'bg-primary'],
  ['Sold', 'bg-surface'],
  ['Held by another user', 'bg-[repeating-linear-gradient(135deg,#2a2c3d_0_3px,#34364a_3px_6px)]'],
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
  return first === last ? `Row ${first}` : `Rows ${first}-${last}`
}

export default function SeatMap({ map, selectedIds, contested, onToggle }: SeatMapProps) {
  return (
    <div>
      <div className="mx-5 flex h-[30px] items-center justify-center rounded-b-[20px] bg-surface-2 text-xs font-semibold uppercase">
        Screen
      </div>

      <ZoomPan
        className="mt-[31px]"
        footer={
          <ul className="flex items-center gap-x-6 text-xs leading-4 whitespace-nowrap text-muted">
            {legend.map(([label, swatch]) => (
              <li key={label} className="flex items-center gap-2">
                <span className={clsx('size-4 rounded-[5px]', swatch)} />
                {label}
              </li>
            ))}
          </ul>
        }
      >
        <div className="space-y-8">
          {map.sections.map((section) => (
            <section key={section.name} aria-label={section.name}>
              <p className="mb-[22px] pl-0.5 text-xs leading-4 font-semibold text-muted uppercase">
                {section.name} · {rowRange(section.rows)}
              </p>
              <div className="flex flex-col gap-2.5">
                {section.rows.map((row) => (
                  <div key={row.label} className="flex items-center gap-2">
                    <span className="w-5 text-center text-xs font-semibold">{row.label}</span>
                    {row.seats.map((seat) => {
                      const state = displayState(seat, selectedIds, contested)

                      return (
                        <Fragment key={seat.id}>
                          {state === 'unavailable' ? (
                            <span className="size-[52px] shrink-0" aria-hidden />
                          ) : (
                            <button
                              type="button"
                              disabled={state === 'sold' || state === 'held'}
                              onClick={() => onToggle(seat, section.name)}
                              aria-pressed={state === 'selected'}
                              aria-label={`Seat ${seat.code}, ${state === 'held' ? 'held by another user' : state}`}
                              className={clsx(
                                'flex size-[52px] shrink-0 items-center justify-center rounded-[10px] text-lg font-extrabold transition-colors',
                                seatStyles[state],
                              )}
                            >
                              {seat.label}
                            </button>
                          )}
                          {seat.aisleAfter && <span className="w-4 shrink-0" aria-hidden />}
                        </Fragment>
                      )
                    })}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </ZoomPan>
    </div>
  )
}
