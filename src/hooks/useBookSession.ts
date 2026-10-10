import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { getMe } from '@/api/auth'
import type { AgeRating, Session } from '@/api/types'
import { ensureLoggedIn, getCurrentUser } from '@/lib/auth'
import { queryClient } from '@/lib/queryClient'
import { useBookingStore } from '@/stores/booking'
import { toast } from '@/stores/toast'

export function ageRestrictionMessage(rating: AgeRating) {
  return `This film is rated ${rating.code}. You cannot buy tickets for it with this account.`
}

export function useBookSession() {
  const navigate = useNavigate()

  return useCallback(
    async (session: Session, rating: AgeRating = session.movie.ageRating) => {
      if (session.isSoldOut) return

      try {
        await ensureLoggedIn()
      } catch {
        return
      }

      const user =
        getCurrentUser() ?? (await queryClient.fetchQuery({ queryKey: ['me'], queryFn: getMe }))

      if (!user) return

      if (!user.profileComplete) {
        toast.warning('Please complete your profile to enable booking.')
        navigate('/profile')
        return
      }

      if (rating.minAge > 0 && (user.age ?? 0) < rating.minAge) {
        toast.error(ageRestrictionMessage(rating))
        return
      }

      useBookingStore.getState().open(session.id)
    },
    [navigate],
  )
}
