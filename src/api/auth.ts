import { request } from './client'
import type { User } from './types'

type AuthResponse = { data: { user: User; token: string } }

export type LoginPayload = {
  email: string
  password: string
}

export type ProfilePayload = {
  fullName: string
  mobileNumber: string
  dateOfBirth: string
  preferredVenueId: number | null
}

export async function login(payload: LoginPayload) {
  const response = await request<AuthResponse>('/login', {
    method: 'POST',
    body: payload,
    replayOnUnauthorized: false,
  })
  return response.data
}

export async function register(payload: FormData) {
  const response = await request<AuthResponse>('/register', {
    method: 'POST',
    body: payload,
    replayOnUnauthorized: false,
  })
  return response.data
}

export function logout() {
  return request<void>('/logout', { method: 'POST', replayOnUnauthorized: false })
}

export async function getMe() {
  const response = await request<{ data: User }>('/me', { replayOnUnauthorized: false })
  return response.data
}

export async function updateProfile(payload: ProfilePayload) {
  const response = await request<{ data: User }>('/profile', { method: 'PUT', body: payload })
  return response.data
}
