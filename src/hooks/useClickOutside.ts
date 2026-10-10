import { useEffect, type RefObject } from 'react'

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onOutside: () => void,
) {
  useEffect(() => {
    if (!active) return

    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) onOutside()
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onOutside()
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [ref, active, onOutside])
}
