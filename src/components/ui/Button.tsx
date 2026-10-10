import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'
import Spinner from './Spinner'

type Variant = 'primary' | 'secondary' | 'dark' | 'light' | 'glass' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white disabled:bg-dim disabled:text-muted',
  secondary: 'bg-surface-2 text-white hover:bg-surface-3 disabled:text-dim disabled:hover:bg-surface-2',
  dark: 'bg-surface text-white hover:bg-surface-2 disabled:text-dim',
  light: 'bg-white text-page disabled:opacity-60',
  glass: 'bg-white/10 text-white backdrop-blur-[22px] hover:bg-muted disabled:opacity-60',
  outline: 'border border-muted text-white hover:bg-white/10 disabled:text-muted',
}

const sizes: Record<Size, string> = {
  sm: 'h-7 px-3 text-sm font-semibold',
  md: 'h-[34px] px-5 text-sm font-extrabold',
  lg: 'h-[42px] px-6 text-sm font-extrabold',
}

export function buttonClasses(variant: Variant = 'primary', size: Size = 'lg', className?: string) {
  return clsx(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className,
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  )
}
