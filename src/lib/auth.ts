import { setUnauthorizedHandler } from '@/api/client'
import type { User } from '@/api/types'
import { useAuthStore } from '@/stores/auth'
import { useAuthModal, type AuthModalType } from '@/stores/authModal'
import { queryClient } from './queryClient'

export class LoginCancelledError extends Error {
  constructor() {
    super('Login was cancelled')
    this.name = 'LoginCancelledError'
  }
}

type PendingLogin = {
  promise: Promise<void>
  resolve: () => void
  reject: (reason: unknown) => void
}

let pending: PendingLogin | null = null

export function requestLogin(modal: AuthModalType = 'login') {
  if (!pending) {
    let resolve!: () => void
    let reject!: (reason: unknown) => void
    const promise = new Promise<void>((res, rej) => {
      resolve = res
      reject = rej
    })
    pending = { promise, resolve, reject }
  }

  useAuthModal.getState().open(modal)
  return pending.promise
}

export function ensureLoggedIn() {
  return useAuthStore.getState().token ? Promise.resolve() : requestLogin()
}

export function completeLogin(user: User, token: string) {
  useAuthStore.getState().setToken(token)
  queryClient.setQueryData(['me'], user)
  useAuthModal.getState().close()
  pending?.resolve()
  pending = null
}

export function cancelLogin() {
  useAuthModal.getState().close()
  pending?.reject(new LoginCancelledError())
  pending = null
}

export function clearSession() {
  useAuthStore.getState().setToken(null)
  queryClient.setQueryData(['me'], null)
  queryClient.removeQueries({ queryKey: ['tickets'] })
}

export function getCurrentUser() {
  return queryClient.getQueryData<User | null>(['me']) ?? null
}

setUnauthorizedHandler(() => {
  clearSession()
  return requestLogin()
})
