import { Link } from 'react-router'
import { SearchIcon } from '@/components/icons'
import { buttonClasses } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <section className="flex flex-col items-center px-[60px] py-40 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-surface">
        <SearchIcon className="size-7 text-muted" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold">Page not found</h1>
      <p className="mt-2 text-muted">The page you are looking for does not exist or was moved.</p>
      <Link to="/" className={buttonClasses('primary', 'lg', 'mt-8')}>
        Back to home
      </Link>
    </section>
  )
}
