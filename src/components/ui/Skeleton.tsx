import clsx from 'clsx'

export default function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={clsx('animate-pulse rounded-lg bg-surface', className)} />
}
