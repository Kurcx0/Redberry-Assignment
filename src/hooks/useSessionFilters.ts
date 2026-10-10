import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { today, upcomingDays } from '@/lib/format'

export const LIST_FILTERS = ['venue', 'format', 'language', 'time'] as const
export const DEFAULT_SORT = 'time_asc'

export type ListFilter = (typeof LIST_FILTERS)[number]

export type SessionFilters = Record<ListFilter, string[]> & {
  date: string
  sort: string
  page: number
  search: string
}

function splitList(value: string | null) {
  return value ? value.split(',').filter(Boolean) : []
}

function toQueryString(filters: SessionFilters) {
  const parts: string[] = []

  LIST_FILTERS.forEach((key) => {
    if (filters[key].length) parts.push(`${key}=${filters[key].map(encodeURIComponent).join(',')}`)
  })
  if (filters.search) parts.push(`search=${encodeURIComponent(filters.search)}`)
  if (filters.date !== today()) parts.push(`date=${filters.date}`)
  if (filters.sort !== DEFAULT_SORT) parts.push(`sort=${encodeURIComponent(filters.sort)}`)
  if (filters.page > 1) parts.push(`page=${filters.page}`)

  return parts.length ? `?${parts.join('&')}` : ''
}

export function useSessionFilters() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const filters = useMemo<SessionFilters>(() => {
    const days = upcomingDays().map((day) => day.value)
    const date = params.get('date')

    return {
      venue: splitList(params.get('venue')),
      format: splitList(params.get('format')),
      language: splitList(params.get('language')),
      time: splitList(params.get('time')),
      search: params.get('search') ?? '',
      date: date && days.includes(date) ? date : today(),
      sort: params.get('sort') || DEFAULT_SORT,
      page: Math.max(1, Math.floor(Number(params.get('page'))) || 1),
    }
  }, [params])

  const update = useCallback(
    (changes: Partial<SessionFilters>) => {
      const next = { ...filters, page: 1, ...changes }
      navigate({ pathname, search: toQueryString(next) })
    },
    [filters, navigate, pathname],
  )

  const clear = useCallback(() => {
    update({ venue: [], format: [], language: [], time: [], search: '' })
  }, [update])

  const activeCount =
    LIST_FILTERS.reduce((count, key) => count + filters[key].length, 0) + (filters.search ? 1 : 0)

  return { filters, update, clear, activeCount }
}
