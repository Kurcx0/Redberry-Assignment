import clsx from 'clsx'
import { Link } from 'react-router'

export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Kino XII home"
      className={clsx('text-[20px] leading-none font-extrabold whitespace-nowrap', className)}
    >
      KINO <span className="text-primary">XII</span>
    </Link>
  )
}
