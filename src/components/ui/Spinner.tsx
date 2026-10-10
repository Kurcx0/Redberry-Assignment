import clsx from 'clsx'

export default function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={clsx(
        'inline-block animate-spin rounded-full border-2 border-current border-r-transparent',
        className ?? 'size-5',
      )}
    />
  )
}
