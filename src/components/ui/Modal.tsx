import clsx from 'clsx'
import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

let stack: string[] = []

type ModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  labelledBy?: string
}

export default function Modal({ open, onClose, children, className, labelledBy }: ModalProps) {
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
        className="relative flex min-h-full items-center justify-center p-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          className={clsx(
            'relative w-full animate-pop-in rounded-3xl border border-white/8 bg-[#0b0e1f] shadow-2xl shadow-black/60',
            className,
          )}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-6 right-6 z-10 flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/8 hover:text-white"
          >
            <X className="size-5" />
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
