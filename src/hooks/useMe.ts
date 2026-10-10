import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/api/auth'
import { ApiError } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

export function useMe() {
  const token = useAuthStore((state) => state.token)

  const query = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await getMe()
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          useAuthStore.getState().setToken(null)
          return null
        }
        throw error
      }
    },
    enabled: !!token,
    staleTime: Infinity,
  })

  return {
    user: token ? (query.data ?? null) : null,
    isLoading: !!token && query.isPending,
  }
}
