import clsx from 'clsx'
import { useEffect, useId, useRef, type ReactNode } from 'react'
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
  align?: 'center' | 'top'
  bare?: boolean
}

export default function Modal({
  open,
  onClose,
  children,
  className,
  labelledBy,
  label,
  align = 'center',
  bare = false,
}: ModalProps) {
  const id = useId()
  const onCloseRef = useRef(onClose)

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

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 animate-fade-in bg-[#02040b]/65 backdrop-blur-[6px]" aria-hidden />
      <div
        className={clsx(
          'relative flex min-h-full justify-center p-6',
          align === 'center' ? 'items-center' : 'items-start',
        )}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-label={label}
          className={clsx(
            'relative w-full animate-pop-in',
            !bare && 'rounded-3xl border border-white/8 bg-[#0b0e1f] shadow-2xl shadow-black/60',
            className,
          )}
        >
          {!bare && (
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
