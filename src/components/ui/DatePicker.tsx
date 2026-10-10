import clsx from 'clsx'
import { upcomingDays } from '@/lib/format'

type DatePickerProps = {
  value: string
  onChange: (value: string) => void
  availableDates?: string[]
  size?: 'sm' | 'lg'
}

export default function DatePicker({ value, onChange, availableDates, size = 'sm' }: DatePickerProps) {
  const days = upcomingDays()

  return (
    <div
      role="radiogroup"
      aria-label="Date"
      className={clsx('grid grid-cols-7', size === 'sm' ? 'gap-1.5' : 'w-fit gap-2.5')}
    >
      {days.map((day) => {
        const selected = day.value === value
        const disabled = availableDates ? !availableDates.includes(day.value) : false

        return (
          <button
            key={day.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(day.value)}
            className={clsx(
              'flex flex-col items-center justify-center rounded-lg font-medium transition-colors',
              size === 'sm' ? 'h-[54px] text-xs' : 'h-[62px] w-[58px] text-[13px]',
              selected ? 'bg-primary text-white' : 'bg-surface-2 text-white hover:bg-surface-3',
              disabled && 'cursor-not-allowed text-dim hover:bg-surface-2',
            )}
          >
            <span>{day.weekday}</span>
            <span className={clsx('mt-0.5 font-bold', size === 'sm' ? 'text-sm' : 'text-base')}>
              {day.day}
            </span>
          </button>
        )
      })}
    </div>
  )
}
