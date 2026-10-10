import clsx from 'clsx'
import { Timer } from 'lucide-react'
import type { ReactNode } from 'react'
import type { AgeRating } from '@/api/types'

export function AgeBadge({ rating, className }: { rating: AgeRating; className?: string }) {
  return (
    <span
      title={rating.description}
      className={clsx(
        'inline-flex h-6 shrink-0 items-center rounded-full bg-primary/15 px-2.5 text-xs font-semibold text-primary',
        className,
      )}
    >
      {rating.code}
    </span>
  )
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-white/12 px-3 text-xs font-semibold',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function RuntimePill({ minutes }: { minutes: number }) {
  return (
    <Pill>
      <Timer className="size-3.5" />
      {minutes} Min
    </Pill>
  )
}
