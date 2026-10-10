import clsx from 'clsx'
import { Film } from 'lucide-react'

type PosterProps = {
  src: string | null
  alt: string
  className?: string
}

export default function Poster({ src, alt, className }: PosterProps) {
  if (!src) {
    return (
      <div className={clsx('flex items-center justify-center bg-surface-2', className)}>
        <Film className="size-1/4 max-h-10 max-w-10 text-dim" />
      </div>
    )
  }

  return <img src={src} alt={alt} loading="lazy" className={clsx('bg-surface-2 object-cover', className)} />
}
