import clsx from 'clsx'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'

type PaginationProps = {
  page: number
  lastPage: number
  onChange: (page: number) => void
}

function pageItems(page: number, lastPage: number): (number | 'gap')[] {
  if (lastPage <= 7) return Array.from({ length: lastPage }, (_, index) => index + 1)

  const items: (number | 'gap')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(lastPage - 1, page + 1)

  if (start > 2) items.push('gap')
  for (let item = start; item <= end; item++) items.push(item)
  if (end < lastPage - 1) items.push('gap')
  items.push(lastPage)

  return items
}

const itemClasses =
  'flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-colors'

export default function Pagination({ page, lastPage, onChange }: PaginationProps) {
  if (lastPage <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between">
      <p className="text-sm text-muted">
        Page <span className="font-semibold text-white">{page}</span> of {lastPage}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className={clsx(itemClasses, 'bg-surface hover:bg-surface-2 disabled:cursor-not-allowed disabled:text-dim disabled:hover:bg-surface')}
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        {pageItems(page, lastPage).map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} className="w-6 text-center text-muted">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={clsx(itemClasses, item === page ? 'bg-primary' : 'bg-surface hover:bg-surface-2')}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page === lastPage}
          aria-label="Next page"
          className={clsx(itemClasses, 'bg-surface hover:bg-surface-2 disabled:cursor-not-allowed disabled:text-dim disabled:hover:bg-surface')}
        >
          <ChevronRightIcon className="size-5" />
        </button>
      </div>
    </nav>
  )
}
