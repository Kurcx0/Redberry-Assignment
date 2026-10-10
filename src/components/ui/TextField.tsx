import clsx from 'clsx'
import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'
import { CheckIcon, ErrorIcon } from '@/components/icons'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  valid?: boolean
  hint?: string
  icon?: ReactNode
  ref?: Ref<HTMLInputElement>
}

export default function TextField({
  label,
  error,
  valid,
  hint,
  icon,
  className,
  id,
  ref,
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className={clsx('mb-2 block text-sm font-semibold', error ? 'text-primary' : 'text-white')}
      >
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error || hint ? messageId : undefined}
          className={clsx(
            'h-10 w-full rounded-xl border bg-surface pr-11 pl-4 text-sm font-semibold transition-colors outline-none placeholder:text-muted',
            'disabled:cursor-not-allowed disabled:text-muted',
            error
              ? 'border-primary text-primary'
              : 'border-transparent text-white enabled:hover:border-dim enabled:hover:bg-surface-2 focus:border-dim focus:bg-surface',
          )}
          {...props}
        />
        <span className="pointer-events-none absolute top-1/2 right-4 flex -translate-y-1/2 items-center">
          {error ? (
            <ErrorIcon className="size-4 text-primary" />
          ) : valid ? (
            <CheckIcon className="size-4 text-success" />
          ) : (
            icon
          )}
        </span>
      </div>
      {(error || hint) && (
        <p id={messageId} className={clsx('mt-2 text-sm font-semibold', error ? 'text-primary' : 'text-muted')}>
          {error || hint}
        </p>
      )}
    </div>
  )
}
