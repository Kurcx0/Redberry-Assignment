import clsx from 'clsx'
import { TicketIcon } from '@/components/icons'

type PosterProps = {
  src: string | null
  alt: string
  className?: string
}

export default function Poster({ src, alt, className }: PosterProps) {
  if (!src) {
    return (
      <div className={clsx('flex items-center justify-center bg-surface-2', className)}>
        <TicketIcon className="size-1/4 max-h-8 max-w-8 text-dim" />
      </div>
    )
  }

  return <img src={src} alt={alt} loading="lazy" className={clsx('bg-surface-2 object-cover', className)} />
}
