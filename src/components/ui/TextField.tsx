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
  const status = error ? 'error' : valid ? 'valid' : null

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className={clsx('mb-2 block text-[13px] font-semibold', error ? 'text-primary' : 'text-white')}
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
            'h-10 w-full rounded-lg border bg-surface px-3.5 pr-10 text-[13px] text-white transition-colors outline-none placeholder:text-dim',
            'disabled:cursor-not-allowed disabled:text-muted',
            status === 'error' && 'border-primary',
            status === 'valid' && 'border-success/60',
            !status && 'border-transparent focus:border-white/25',
          )}
          {...props}
        />
        <span className="pointer-events-none absolute top-1/2 right-3.5 flex -translate-y-1/2 items-center">
          {status === 'error' && <ErrorIcon className="size-4 text-primary" />}
          {status === 'valid' && <CheckIcon className="size-4 text-success" />}
          {!status && icon}
        </span>
      </div>
      {(error || hint) && (
        <p id={messageId} className={clsx('mt-1.5 text-xs', error ? 'text-primary' : 'text-muted')}>
          {error || hint}
        </p>
      )}
    </div>
  )
}
