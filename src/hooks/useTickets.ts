import { useQuery } from '@tanstack/react-query'
import { getTickets } from '@/api/booking'

export function useTickets() {
  return useQuery({ queryKey: ['tickets'], queryFn: getTickets })
}
