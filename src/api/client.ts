import { useAuthStore } from '@/stores/auth'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://api.kinoxii.redberryinternship.ge/api'

type ErrorBody = {
  message?: string
  errors?: Record<string, string[]>
  contested?: string[]
}

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>
  contested?: string[]

  constructor(status: number, body: ErrorBody = {}) {
    super(body.message || defaultMessage(status))
    this.name = 'ApiError'
    this.status = status
    this.errors = body.errors
    this.contested = body.contested
  }

  get isValidation() {
    return this.status === 422 && !!this.errors
  }
}

function defaultMessage(status: number) {
  if (status === 0) return 'Could not reach the server. Check your connection and try again.'
  if (status === 404) return 'We could not find what you were looking for.'
  if (status >= 500) return 'Something went wrong on our side. Please try again.'
  return 'Something went wrong. Please try again.'
}

type QueryValue = string | number | boolean | null | undefined | (string | number)[]

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  params?: Record<string, QueryValue>
  replayOnUnauthorized?: boolean
}

let unauthorizedHandler: (() => Promise<void>) | null = null

export function setUnauthorizedHandler(handler: () => Promise<void>) {
  unauthorizedHandler = handler
}

function buildUrl(path: string, params?: RequestOptions['params']) {
  const url = new URL(BASE_URL + path)

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(`${key}[]`, String(item)))
    } else {
      url.searchParams.set(key, String(value))
    }
  })

  return url
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, replayOnUnauthorized = true } = options
  const token = useAuthStore.getState().token
  const headers: Record<string, string> = { Accept: 'application/json' }

  if (token) headers.Authorization = `Bearer ${token}`

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path, params), { method, headers, body: payload })
  } catch {
    throw new ApiError(0)
  }

  if (response.status === 401 && replayOnUnauthorized && unauthorizedHandler) {
    await unauthorizedHandler()
    return request<T>(path, { ...options, replayOnUnauthorized: false })
  }

  if (response.status === 204) return undefined as T

  const data = await response.json().catch(() => ({}))

  if (!response.ok) throw new ApiError(response.status, data)

  return data as T
}
