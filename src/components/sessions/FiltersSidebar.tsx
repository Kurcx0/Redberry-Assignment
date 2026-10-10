import type { ReactNode } from 'react'
import type { FilterOptions } from '@/api/types'
import Checkbox from '@/components/ui/Checkbox'
import DatePicker from '@/components/ui/DatePicker'
import Skeleton from '@/components/ui/Skeleton'
import type { ListFilter, SessionFilters } from '@/hooks/useSessionFilters'

type FiltersSidebarProps = {
  options: FilterOptions | undefined
  filters: SessionFilters
  activeCount: number
  onChange: (changes: Partial<SessionFilters>) => void
  onClear: () => void
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-5 first-of-type:border-0 first-of-type:pt-0">
      <legend className="float-left mb-2.5 w-full text-xs font-medium tracking-[0.08em] text-muted uppercase">
        {title}
      </legend>
      <div className="clear-left">{children}</div>
    </fieldset>
  )
}

function toggle(list: string[], value: string, checked: boolean) {
  return checked ? [...list, value] : list.filter((item) => item !== value)
}

export function availableFormats(options: FilterOptions, venues: string[]) {
  if (venues.length === 0) return options.formats

  const slugs = new Set(
    options.venues
      .filter((venue) => venues.includes(venue.slug))
      .flatMap((venue) => venue.formats ?? [])
      .map((format) => format.slug),
  )

  return options.formats.filter((format) => slugs.has(format.slug))
}

export default function FiltersSidebar({
  options,
  filters,
  activeCount,
  onChange,
  onClear,
}: FiltersSidebarProps) {
  if (!options) {
    return (
      <aside className="sticky top-6 w-[318px] shrink-0 space-y-4 self-start rounded-2xl bg-surface p-5">
        <Skeleton className="h-6 w-24 bg-surface-2" />
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-5 w-full bg-surface-2" />
        ))}
      </aside>
    )
  }

  const formats = availableFormats(options, filters.venue)

  function handleList(key: ListFilter, value: string, checked: boolean) {
    onChange({ [key]: toggle(filters[key], value, checked) })
  }

  function handleVenue(slug: string, checked: boolean) {
    const venue = toggle(filters.venue, slug, checked)
    const allowed = new Set(availableFormats(options!, venue).map((format) => format.slug))
    onChange({ venue, format: filters.format.filter((format) => allowed.has(format)) })
  }

  return (
    <aside className="sticky top-6 flex max-h-[calc(100vh-48px)] w-[318px] shrink-0 flex-col self-start rounded-2xl bg-surface">
      <div className="thin-scrollbar flex-1 space-y-5 overflow-y-auto p-5 pb-4">
        <h2 className="text-lg font-bold">Filters</h2>

        <FilterGroup title="Venue">
          {options.venues.map((venue) => (
            <Checkbox
              key={venue.slug}
              label={venue.name}
              description={venue.city}
              checked={filters.venue.includes(venue.slug)}
              onChange={(checked) => handleVenue(venue.slug, checked)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Date">
          <DatePicker value={filters.date} onChange={(date) => onChange({ date })} />
        </FilterGroup>

        <FilterGroup title="Format">
          {formats.map((format) => (
            <Checkbox
              key={format.slug}
              label={format.name}
              checked={filters.format.includes(format.slug)}
              onChange={(checked) => handleList('format', format.slug, checked)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Language">
          {options.languages.map((language) => (
            <Checkbox
              key={language.slug}
              label={language.name}
              checked={filters.language.includes(language.slug)}
              onChange={(checked) => handleList('language', language.slug, checked)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Time of day">
          {options.timeBands.map((band) => {
            const [label, range] = band.label.split(/ \((.*)\)/)
            return (
              <Checkbox
                key={band.id}
                label={label}
                description={range}
                checked={filters.time.includes(band.id)}
                onChange={(checked) => handleList('time', band.id, checked)}
              />
            )
          })}
        </FilterGroup>
      </div>

      <div className="flex items-center justify-between border-t border-line px-5 py-4">
        <span className="text-[13px] text-muted">
          {activeCount} {activeCount === 1 ? 'filter' : 'filters'} active
        </span>
        <button
          type="button"
          onClick={onClear}
          disabled={activeCount === 0}
          className="text-[13px] font-semibold text-primary transition-opacity hover:underline disabled:cursor-not-allowed disabled:text-dim disabled:no-underline"
        >
          Clear All Filters
        </button>
      </div>
    </aside>
  )
}
