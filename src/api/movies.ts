import { request } from './client'
import type { Movie, MovieDetail, VenueSessions } from './types'

type ListResponse<T> = { data: T[] }

export async function getFeaturedMovies() {
  const response = await request<ListResponse<Movie>>('/movies/featured')
  return response.data
}

export async function getNowPlaying(limit?: number) {
  const response = await request<ListResponse<Movie>>('/movies/now-playing', { params: { limit } })
  return response.data
}

export async function getComingSoon(limit?: number) {
  const response = await request<ListResponse<Movie>>('/movies/coming-soon', { params: { limit } })
  return response.data
}

export async function getMovie(slug: string) {
  const response = await request<{ data: MovieDetail }>(`/movies/${slug}`)
  return response.data
}

export async function getMovieSessions(slug: string, date: string) {
  const response = await request<ListResponse<VenueSessions>>(`/movies/${slug}/sessions`, {
    params: { date },
  })
  return response.data
}

export async function notifyMe(slug: string) {
  const response = await request<{ data: { movieId: number; subscribed: boolean } }>(
    `/movies/${slug}/notify`,
    { method: 'POST' },
  )
  return response.data
}

export async function searchMovies(query: string) {
  const response = await request<ListResponse<Movie>>('/search', { params: { q: query } })
  return response.data
}
