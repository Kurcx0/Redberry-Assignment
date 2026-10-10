import clsx from 'clsx'
import { Link } from 'react-router'

export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Kino XII home"
      className={clsx('text-[22px] leading-none font-extrabold tracking-tight', className)}
    >
      KINO <span className="text-primary">XII</span>
    </Link>
  )
}
