import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client'
import { notifyMe } from '@/api/movies'
import type { Movie } from '@/api/types'
import { ensureLoggedIn } from '@/lib/auth'
import { toast } from '@/stores/toast'

export function useNotifyMe(movie: Pick<Movie, 'slug' | 'title' | 'isNotified'>) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => notifyMe(movie.slug),
    onSuccess: () => {
      toast.success(`We'll let you know when ${movie.title} opens.`)
      queryClient.invalidateQueries({ queryKey: ['movies'] })
      queryClient.invalidateQueries({ queryKey: ['movie', movie.slug] })
    },
    onError: (error) => {
      if (error instanceof ApiError) toast.error(error.message)
    },
  })

  function notify() {
    ensureLoggedIn()
      .then(() => mutation.mutate())
      .catch(() => undefined)
  }

  return {
    notify,
    isPending: mutation.isPending,
    isNotified: !!movie.isNotified || !!mutation.data?.subscribed,
  }
}
