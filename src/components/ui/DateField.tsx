import clsx from 'clsx'
import dayjs, { type Dayjs } from 'dayjs'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { CalendarIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, ErrorIcon } from '@/components/icons'
import { useClickOutside } from '@/hooks/useClickOutside'

type View = 'days' | 'months' | 'years'

type DateFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  min: string
  max: string
  error?: string
  valid?: boolean
  placeholder?: string
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const navClass =
  'flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-white disabled:pointer-events-none disabled:text-dim'
const cellClass =
  'rounded-[10px] text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:text-dim'

export default function DateField({
  label,
  value,
  onChange,
  onBlur,
  min,
  max,
  error,
  valid,
  placeholder = 'Select a date',
}: DateFieldProps) {
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const yearsRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('days')
  const [month, setMonth] = useState(() => dayjs(value || max).startOf('month'))

  const selected = value ? dayjs(value) : null
  const minDate = dayjs(min)
  const maxDate = dayjs(max)

  const close = useCallback(() => {
    setOpen(false)
    onBlur?.()
  }, [onBlur])

  useClickOutside(rootRef, open, close)

  useEffect(() => {
    const list = yearsRef.current
    const current = list?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (open && view === 'years' && list && current) {
      list.scrollTop = current.offsetTop - list.offsetTop - list.clientHeight / 2 + current.offsetHeight / 2
    }
  }, [open, view])

  function toggle() {
    if (open) {
      close()
      return
    }
    setMonth(dayjs(value || max).startOf('month'))
    setView(value ? 'days' : 'years')
    setOpen(true)
  }

  function pick(day: Dayjs) {
    onChange(day.format('YYYY-MM-DD'))
    close()
  }

  const start = month.startOf('month')
  const offset = (start.day() + 6) % 7
  const days = Array.from({ length: month.daysInMonth() }, (_, index) => start.add(index, 'day'))
  const years = Array.from({ length: maxDate.year() - minDate.year() + 1 }, (_, index) => maxDate.year() - index)

  return (
    <div>
      <label htmlFor={id} className={clsx('mb-2 block text-xs leading-4 font-semibold', error ? 'text-primary' : 'text-white')}>
        {label}
      </label>
      <div ref={rootRef} className="relative">
        <button
          id={id}
          type="button"
          onClick={toggle}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={!!error}
          className={clsx(
            'flex h-10 w-full items-center rounded-xl border bg-surface pr-11 pl-4 text-left text-xs font-semibold transition-colors outline-none',
            error
              ? 'border-primary text-primary'
              : clsx('text-white hover:border-dim hover:bg-surface-2 focus-visible:border-dim', open ? 'border-dim' : 'border-transparent'),
          )}
        >
          {selected ? selected.format('D MMMM YYYY') : <span className="text-muted">{placeholder}</span>}
        </button>
        <span className="pointer-events-none absolute top-1/2 right-4 flex -translate-y-1/2 items-center">
          {error ? (
            <ErrorIcon className="size-4 text-primary" />
          ) : valid ? (
            <CheckIcon className="size-4 text-success" />
          ) : (
            <CalendarIcon className="size-4 text-muted" />
          )}
        </span>

        {open && (
          <div
            role="dialog"
            aria-label={label}
            className="absolute top-full left-0 z-30 mt-2 w-[308px] animate-pop-in rounded-2xl border border-line bg-page p-4 shadow-2xl shadow-black/60"
          >
            {view === 'days' && (
              <>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setMonth(month.subtract(1, 'month'))}
                    disabled={!month.isAfter(minDate, 'month')}
                    aria-label="Previous month"
                    className={navClass}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('years')}
                    className="rounded-lg px-3 py-1.5 text-sm font-extrabold transition-colors hover:bg-surface-2"
                  >
                    {month.format('MMMM YYYY')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonth(month.add(1, 'month'))}
                    disabled={!month.isBefore(maxDate, 'month')}
                    aria-label="Next month"
                    className={navClass}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                  {WEEKDAYS.map((weekday) => (
                    <span key={weekday} className="flex h-8 items-center justify-center text-xs text-muted">
                      {weekday}
                    </span>
                  ))}
                  {Array.from({ length: offset }, (_, index) => (
                    <span key={`gap-${index}`} />
                  ))}
                  {days.map((day) => {
                    const isSelected = !!selected?.isSame(day, 'day')
                    return (
                      <button
                        key={day.date()}
                        type="button"
                        onClick={() => pick(day)}
                        disabled={day.isBefore(minDate, 'day') || day.isAfter(maxDate, 'day')}
                        aria-pressed={isSelected}
                        aria-label={day.format('D MMMM YYYY')}
                        className={clsx(
                          cellClass,
                          'h-9',
                          isSelected ? 'bg-primary text-white' : 'enabled:hover:bg-surface-2',
                          !isSelected && day.isSame(dayjs(), 'day') && 'text-primary',
                        )}
                      >
                        {day.date()}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {view === 'months' && (
              <>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setMonth(month.subtract(1, 'year'))}
                    disabled={month.year() <= minDate.year()}
                    aria-label="Previous year"
                    className={navClass}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('years')}
                    className="rounded-lg px-3 py-1.5 text-sm font-extrabold transition-colors hover:bg-surface-2"
                  >
                    {month.year()}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonth(month.add(1, 'year'))}
                    disabled={month.year() >= maxDate.year()}
                    aria-label="Next year"
                    className={navClass}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {MONTHS.map((name, index) => {
                    const candidate = month.month(index)
                    const isSelected = !!selected?.isSame(candidate, 'month')
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setMonth(candidate)
                          setView('days')
                        }}
                        disabled={candidate.isAfter(maxDate, 'month') || candidate.isBefore(minDate, 'month')}
                        className={clsx(cellClass, 'h-11', isSelected ? 'bg-primary text-white' : 'enabled:hover:bg-surface-2')}
                      >
                        {name}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {view === 'years' && (
              <>
                <p className="flex h-8 items-center justify-center text-sm font-extrabold">Choose a year</p>
                <div ref={yearsRef} className="mt-3 grid max-h-[248px] grid-cols-4 gap-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
                  {years.map((year) => {
                    const isSelected = year === month.year() && !!value
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setMonth(month.year(year))
                          setView('months')
                        }}
                        aria-pressed={isSelected}
                        className={clsx(cellClass, 'h-10', isSelected ? 'bg-primary text-white' : 'hover:bg-surface-2')}
                      >
                        {year}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-primary">{error}</p>}
    </div>
  )
}
