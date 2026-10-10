import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo } from 'react'
import { getSessions, type SessionsQuery } from '@/api/sessions'
import { CalendarIcon } from '@/components/icons'
import FiltersSidebar from '@/components/sessions/FiltersSidebar'
import SessionGroup, { SessionGroupSkeleton } from '@/components/sessions/SessionGroup'
import SessionSearch from '@/components/sessions/SessionSearch'
import SortSelect from '@/components/sessions/SortSelect'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useBookSession } from '@/hooks/useBookSession'
import { useFilterOptions } from '@/hooks/useFilterOptions'
import { DEFAULT_SORT, useSessionFilters } from '@/hooks/useSessionFilters'

export default function SessionsPage() {
  const { filters, update, clear, activeCount } = useSessionFilters()
  const { data: options, isError: optionsFailed, refetch: refetchOptions } = useFilterOptions()
  const bookSession = useBookSession()

  const query = useMemo<SessionsQuery | null>(() => {
    if (!options) return null

    const known = (values: string[], allowed: string[]) =>
      values.filter((value) => allowed.includes(value))

    return {
      date: filters.date,
      venues: known(filters.venue, options.venues.map((venue) => venue.slug)),
      formats: known(filters.format, options.formats.map((format) => format.slug)),
      languages: known(filters.language, options.languages.map((language) => language.slug)),
      bands: known(filters.time, options.timeBands.map((band) => band.id)),
      search: filters.search || undefined,
      sort: options.sorts.some((sort) => sort.id === filters.sort) ? filters.sort : DEFAULT_SORT,
      page: filters.page,
    }
  }, [filters, options])

  const sessions = useQuery({
    queryKey: ['sessions', query],
    queryFn: () => getSessions(query!),
    enabled: !!query,
  })

  const lastPage = sessions.data?.meta.lastPage ?? 0

  useEffect(() => {
    if (lastPage > 0 && filters.page > lastPage) update({ page: lastPage }, { replace: true })
  }, [lastPage, filters.page, update])

  const handleSearch = useCallback((search: string) => update({ search }), [update])

  function changePage(page: number) {
    update({ page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const meta = sessions.data?.meta
  const groups = sessions.data?.data ?? []
  const loading = !query || sessions.isPending

  return (
    <section className="px-[52px] pt-6 pb-24">
      <h1 className="text-[28px] font-bold">Sessions</h1>
      <p className="mt-1.5 text-sm text-muted">Browse showtimes across all venues</p>

      <div className="mt-8 flex items-start gap-[52px]">
        <FiltersSidebar
          options={options}
          filters={filters}
          activeCount={activeCount}
          onChange={update}
          onClear={clear}
        />

        <div className="min-w-0 flex-1">
          <div className="flex h-10 items-center justify-between gap-4">
            {loading ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              <p className="text-sm font-semibold" aria-live="polite">
                {meta && meta.totalSessions > 0
                  ? `Showing ${meta.totalSessions} ${meta.totalSessions === 1 ? 'session' : 'sessions'}`
                  : 'No sessions found'}
              </p>
            )}
            <div className="flex items-center gap-3">
              <SessionSearch value={filters.search} onChange={handleSearch} />
              {options && (
                <SortSelect
                  value={filters.sort}
                  options={options.sorts}
                  onChange={(sort) => update({ sort })}
                />
              )}
            </div>
          </div>

          <div className="mt-5 space-y-6">
            {loading && !optionsFailed && !sessions.isError &&
              Array.from({ length: 3 }, (_, index) => <SessionGroupSkeleton key={index} />)}

            {(optionsFailed || sessions.isError) && (
              <ErrorState
                message={sessions.error?.message}
                onRetry={() => (optionsFailed ? refetchOptions() : sessions.refetch())}
                retrying={sessions.isRefetching}
                className="rounded-2xl bg-surface/50"
              />
            )}

            {!loading && !sessions.isError && groups.length === 0 && (
              <EmptyState
                icon={<CalendarIcon />}
                title="No sessions found"
                description={
                  activeCount > 0
                    ? 'No showtimes match these filters on this date. Try removing some filters or picking another day.'
                    : 'There are no showtimes on this date. Try picking another day.'
                }
                action={
                  activeCount > 0 && (
                    <Button variant="secondary" onClick={clear}>
                      Clear All Filters
                    </Button>
                  )
                }
                className="rounded-2xl bg-surface/50"
              />
            )}

            {!loading &&
              groups.map((group) => (
                <SessionGroup key={group.movie.id} group={group} onSelect={(session) => bookSession(session)} />
              ))}
          </div>

          {meta && !loading && (
            <div className="mt-10">
              <Pagination page={meta.currentPage} lastPage={meta.lastPage} onChange={changePage} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
