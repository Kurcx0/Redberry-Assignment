import clsx from 'clsx'

export default function Skeleton({ className }: { className?: string }) {
  const rounded = className?.includes('rounded') ? undefined : 'rounded-lg'
  return <div aria-hidden className={clsx('animate-pulse bg-surface', rounded, className)} />
}
