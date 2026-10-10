import { create } from 'zustand'

export type AuthModalType = 'login' | 'register'

type AuthModalState = {
  modal: AuthModalType | null
  open: (modal: AuthModalType) => void
  close: () => void
}

export const useAuthModal = create<AuthModalState>((set) => ({
  modal: null,
  open: (modal) => set({ modal }),
  close: () => set({ modal: null }),
}))
