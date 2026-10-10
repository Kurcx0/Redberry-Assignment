import { create } from 'zustand'

type BookingState = {
  sessionId: number | null
  open: (sessionId: number) => void
  close: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  sessionId: null,
  open: (sessionId) => set({ sessionId }),
  close: () => set({ sessionId: null }),
}))
