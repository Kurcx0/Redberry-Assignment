import { useEffect, useRef, useState } from 'react'

export function useHoldCountdown(expiresAt: string | null, onExpire: () => void) {
  const [, setTick] = useState(0)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  })

  const remaining = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000))
    : null

  useEffect(() => {
    if (!expiresAt) return
    const timer = setInterval(() => setTick((tick) => tick + 1), 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  useEffect(() => {
    if (remaining === 0) onExpireRef.current()
  }, [remaining])

  return remaining
}
