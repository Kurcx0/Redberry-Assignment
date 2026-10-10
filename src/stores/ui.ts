import { create } from 'zustand'

type UiState = {
  searchOpen: boolean
  openSearch: () => void
  closeSearch: () => void
}

export const useUiStore = create<UiState>((set) => ({
  searchOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}))
