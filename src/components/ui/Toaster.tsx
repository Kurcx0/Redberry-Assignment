import clsx from 'clsx'
import { createPortal } from 'react-dom'
import { CheckIcon, CloseIcon, ErrorIcon } from '@/components/icons'
import { useToastStore, type ToastType } from '@/stores/toast'

const icons: Record<ToastType, typeof ErrorIcon> = {
  success: CheckIcon,
  error: ErrorIcon,
  warning: ErrorIcon,
  info: ErrorIcon,
}

const colors: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-primary',
  warning: 'text-warning',
  info: 'text-white',
}

export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return createPortal(
    <div aria-live="polite" className="fixed right-8 bottom-8 z-[70] flex w-[380px] flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = icons[toast.type]
        return (
          <div
            key={toast.id}
            role="alert"
            className="flex animate-pop-in items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-2xl shadow-black/50"
          >
            <Icon className={clsx('mt-0.5 size-5 shrink-0', colors[toast.type])} />
            <p className="flex-1 text-sm leading-5">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="text-muted transition-colors hover:text-white"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
