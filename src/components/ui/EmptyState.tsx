import clsx from 'clsx'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center px-6 py-14 text-center', className)}>
      <span className="flex size-14 items-center justify-center rounded-full bg-surface-2 text-muted [&>svg]:size-6">
        {icon}
      </span>
      <p className="mt-5 text-lg font-extrabold">{title}</p>
      {description && <p className="mt-1.5 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
