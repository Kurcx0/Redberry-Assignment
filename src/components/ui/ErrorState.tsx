import clsx from 'clsx'
import { CircleAlert, RotateCw } from 'lucide-react'
import Button from './Button'

type ErrorStateProps = {
  message?: string
  onRetry?: () => void
  retrying?: boolean
  className?: string
}

export default function ErrorState({ message, onRetry, retrying, className }: ErrorStateProps) {
  return (
    <div className={clsx('flex flex-col items-center px-6 py-12 text-center', className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
        <CircleAlert className="size-6 text-primary" />
      </span>
      <p className="mt-4 font-semibold">Something went wrong</p>
      <p className="mt-1 max-w-sm text-sm text-muted">
        {message ?? 'We could not load this content. Please try again.'}
      </p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry} loading={retrying}>
          {!retrying && <RotateCw className="size-4" />}
          Try again
        </Button>
      )}
    </div>
  )
}
