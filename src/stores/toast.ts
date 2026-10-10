import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

type Toast = {
  id: number
  type: ToastType
  message: string
}

type ToastState = {
  toasts: Toast[]
  show: (message: string, type?: ToastType) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, type = 'info') => {
    const id = nextId++
    set({ toasts: [...get().toasts.filter((toast) => toast.message !== message), { id, type, message }] })
    setTimeout(() => get().dismiss(id), 5000)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
}))

export const toast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
  warning: (message: string) => useToastStore.getState().show(message, 'warning'),
  info: (message: string) => useToastStore.getState().show(message, 'info'),
}
