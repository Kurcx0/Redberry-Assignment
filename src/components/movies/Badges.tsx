import clsx from 'clsx'
import type { ReactNode } from 'react'
import type { AgeRating } from '@/api/types'
import { TimerIcon } from '@/components/icons'

type AgeBadgeProps = {
  rating: AgeRating
  size?: 'sm' | 'md'
  className?: string
}

export function AgeBadge({ rating, size = 'md', className }: AgeBadgeProps) {
  return (
    <span
      title={rating.description}
      className={clsx(
        'inline-flex shrink-0 items-center rounded-full bg-primary/10 text-xs font-semibold text-primary',
        size === 'sm' ? 'h-[19px] px-2' : 'h-[22px] px-2.5',
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
        'inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 text-xs font-semibold',
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
      <TimerIcon className="size-3.5" />
      {minutes} Min
    </Pill>
  )
}
