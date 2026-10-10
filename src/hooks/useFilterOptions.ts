import { useQuery } from '@tanstack/react-query'
import { getFilterOptions } from '@/api/sessions'

export function useFilterOptions() {
  return useQuery({
    queryKey: ['filter-options'],
    queryFn: getFilterOptions,
    staleTime: Infinity,
  })
}
