import { useEffect, useState } from 'react'
import { CloseIcon, SearchIcon } from '@/components/icons'

type SessionSearchProps = {
  value: string
  onChange: (value: string) => void
}

export default function SessionSearch({ value, onChange }: SessionSearchProps) {
  const [text, setText] = useState(value)
  const [synced, setSynced] = useState(value)

  if (value !== synced) {
    setSynced(value)
    setText(value)
  }

  useEffect(() => {
    const next = text.trim()
    if (next === value) return
    const timer = setTimeout(() => onChange(next), 400)
    return () => clearTimeout(timer)
  }, [text, value, onChange])

  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Search by title"
        aria-label="Search sessions by film title"
        maxLength={100}
        className="h-10 w-64 rounded-full border border-transparent bg-surface pr-9 pl-10 text-[13px] outline-none placeholder:text-dim focus:border-white/25 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => setText('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-white"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </div>
  )
}
