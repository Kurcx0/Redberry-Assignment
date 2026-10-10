import { useSyncExternalStore } from 'react'
import type { Movie } from '@/api/types'

const STORAGE_KEY = 'kino-recently-viewed'
const LIMIT = 8

export type RecentMovie = Pick<
  Movie,
  'slug' | 'title' | 'posterUrl' | 'runtimeMinutes' | 'ageRating' | 'genres' | 'kind'
>

const listeners = new Set<() => void>()

function read(): RecentMovie[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

let items = read()

export function addRecentlyViewed(movie: RecentMovie) {
  const entry: RecentMovie = {
    slug: movie.slug,
    title: movie.title,
    posterUrl: movie.posterUrl,
    runtimeMinutes: movie.runtimeMinutes,
    ageRating: movie.ageRating,
    genres: movie.genres.slice(0, 1),
    kind: movie.kind,
  }

  items = [entry, ...items.filter((item) => item.slug !== movie.slug)].slice(0, LIMIT)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // storage can be unavailable in private mode, the list still works for this visit
  }

  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useRecentlyViewed() {
  return useSyncExternalStore(subscribe, () => items)
}
