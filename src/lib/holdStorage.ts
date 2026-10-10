const STORAGE_KEY = 'kino-holds'

type StoredHolds = Record<string, string>

function read(): StoredHolds {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

function write(holds: StoredHolds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holds))
  } catch {
    // without storage the hold simply is not restored after a reload
  }
}

export function getStoredHold(sessionId: number) {
  return read()[sessionId] ?? null
}

export function saveHold(sessionId: number, holdId: string) {
  write({ ...read(), [sessionId]: holdId })
}

export function forgetHold(sessionId: number) {
  const holds = read()
  delete holds[sessionId]
  write(holds)
}
