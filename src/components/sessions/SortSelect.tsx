import clsx from 'clsx'
import { useCallback, useRef, useState } from 'react'
import { CheckIcon, ChevronDownIcon } from '@/components/icons'
import { useClickOutside } from '@/hooks/useClickOutside'

type SortSelectProps = {
  value: string
  options: { id: string; label: string }[]
  onChange: (value: string) => void
}

export default function SortSelect({ value, options, onChange }: SortSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  const current = options.find((option) => option.id === value) ?? options[0]

  useClickOutside(ref, open, close)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] transition-colors hover:bg-white/6"
      >
        <span className="text-muted">Sort:</span>
        <span className="font-semibold">{current?.label}</span>
        <ChevronDownIcon className={clsx('size-4 text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Sort sessions"
          className="absolute top-full right-0 z-20 mt-2 w-60 rounded-xl border border-line bg-[#0b0e1f] p-1.5 shadow-2xl shadow-black/50"
        >
          {options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                role="option"
                aria-selected={option.id === current?.id}
                onClick={() => {
                  onChange(option.id)
                  close()
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-white/6"
              >
                {option.label}
                {option.id === current?.id && <CheckIcon className="size-4 text-primary" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
