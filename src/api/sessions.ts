import { request } from './client'
import type { FilterOptions, SeatMap, Session, SessionGroup, SessionsMeta } from './types'

export type SessionsQuery = {
  date?: string
  venues?: string[]
  formats?: string[]
  languages?: string[]
  bands?: string[]
  search?: string
  sort?: string
  page?: number
}

export async function getFilterOptions() {
  const response = await request<{ data: FilterOptions }>('/filter-options')
  return response.data
}

export function getSessions(query: SessionsQuery) {
  return request<{ data: SessionGroup[]; meta: SessionsMeta }>('/sessions', { params: query })
}

export async function getSession(id: number) {
  const response = await request<{ data: Session }>(`/sessions/${id}`)
  return response.data
}

export async function getSeatMap(id: number) {
  const response = await request<{ data: SeatMap }>(`/sessions/${id}/seats`)
  return response.data
}
