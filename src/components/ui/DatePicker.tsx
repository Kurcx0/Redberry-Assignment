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
    <div role="radiogroup" aria-label="Date" className={clsx('flex', size === 'sm' ? 'gap-1' : 'gap-2')}>
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
              'flex shrink-0 flex-col items-center justify-center font-semibold transition-colors',
              size === 'sm'
                ? 'h-[54px] w-9 gap-0.5 rounded-lg text-xs'
                : 'size-20 gap-1 rounded-2xl text-sm',
              selected && 'bg-primary text-white',
              !selected && (size === 'sm' ? 'bg-surface-2 hover:bg-surface-3' : 'bg-surface hover:bg-surface-2'),
              disabled && 'cursor-not-allowed text-dim hover:bg-surface',
            )}
          >
            <span>{day.weekday}</span>
            <span className={clsx(size === 'lg' && 'text-xl font-extrabold')}>{day.day}</span>
          </button>
        )
      })}
    </div>
  )
}
