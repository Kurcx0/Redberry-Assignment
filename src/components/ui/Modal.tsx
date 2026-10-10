import clsx from 'clsx'
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from '@/components/icons'

let stack: string[] = []

type ModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  labelledBy?: string
  label?: string
  bare?: boolean
  closeButton?: boolean
  position?: { top: number; left: number }
}

export default function Modal({
  open,
  onClose,
  children,
  className,
  labelledBy,
  label,
  bare = false,
  closeButton = true,
  position,
}: ModalProps) {
  const id = useId()
  const onCloseRef = useRef(onClose)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState<number | null>(null)
  const positioned = !!position

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return

    stack.push(id)
    document.body.style.overflow = 'hidden'

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && stack[stack.length - 1] === id) {
        event.stopPropagation()
        onCloseRef.current()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      stack = stack.filter((item) => item !== id)
      if (stack.length === 0) document.body.style.overflow = ''
    }
  }, [open, id])

  useLayoutEffect(() => {
    if (!open || positioned) return
    const container = containerRef.current
    const panel = panelRef.current
    if (!container || !panel) return

    setOffset(Math.max(24, Math.round((container.clientHeight - panel.offsetHeight) / 2)))
    const observer = new ResizeObserver(() => {
      const fits = Math.max(24, container.clientHeight - panel.offsetHeight - 24)
      setOffset((current) => (current === null ? current : Math.min(current, fits)))
    })
    observer.observe(panel)
    observer.observe(container)
    return () => {
      observer.disconnect()
      setOffset(null)
    }
  }, [open, positioned])

  if (!open) return null

  return createPortal(
    <div ref={containerRef} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 animate-fade-in bg-[#02040b]/65 backdrop-blur-[6px]" aria-hidden />
      <div
        className={clsx('relative min-h-full', !position && 'flex items-start justify-center px-6 pb-6')}
        style={position ? undefined : { paddingTop: offset ?? 24 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-label={label}
          style={position ? { position: 'absolute', top: position.top, left: position.left } : undefined}
          className={clsx(
            'animate-pop-in',
            !position && 'relative w-full',
            !bare && 'rounded-[28px] bg-page shadow-[0_20px_50px_-10px_rgb(0_0_0/0.2)]',
            className,
          )}
        >
          {!bare && closeButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-6 right-6 z-10 flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/8 hover:text-white"
            >
              <CloseIcon className="size-5" />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
