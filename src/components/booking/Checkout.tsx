import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import type { ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { createOrder } from '@/api/booking'
import { ApiError } from '@/api/client'
import type { Order, SeatHold, Session, User } from '@/api/types'
import Button from '@/components/ui/Button'
import TextField from '@/components/ui/TextField'
import { formatPrice, formatShortDate } from '@/lib/format'
import { applyServerErrors } from '@/lib/forms'
import { checkoutSchema, type CheckoutValues } from '@/lib/validation'

type CheckoutProps = {
  session: Session
  hold: SeatHold
  user: User | null
  onPaid: (order: Order) => void
  onFailed: (error: unknown) => void
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

function formatDigits(limit: number) {
  return (value: string) => value.replace(/\D/g, '').slice(0, limit)
}

function ticketBreakdown(hold: SeatHold) {
  const counts = new Map<string, number>()
  hold.seats.forEach((seat) => counts.set(seat.ticketType.name, (counts.get(seat.ticketType.name) ?? 0) + 1))
  return [...counts.entries()].map(([name, count]) => `${count} x ${name}`).join(', ')
}

export default function Checkout({ session, hold, user, onPaid, onFailed }: CheckoutProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      mobileNumber: user?.mobileNumber ?? '',
      cardNumber: '',
      expiry: '',
      cvv: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (values: CheckoutValues) =>
      createOrder({
        holdId: hold.holdId,
        ...values,
        mobileNumber: values.mobileNumber.replace(/\s/g, ''),
        cardNumber: values.cardNumber.replace(/\s/g, ''),
      }),
    onSuccess: onPaid,
    onError: (error) => {
      if (error instanceof ApiError && error.isValidation) {
        applyServerErrors(error, setError)
        return
      }
      onFailed(error)
    },
  })

  function formatted(name: 'cardNumber' | 'expiry' | 'cvv', format: (value: string) => string) {
    const field = register(name)
    return {
      ...field,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        event.target.value = format(event.target.value)
        return field.onChange(event)
      },
    }
  }

  const fieldState = (name: keyof CheckoutValues) => ({
    error: errors[name]?.message,
    valid: !!touchedFields[name] && !errors[name],
  })

  return (
    <form
      onSubmit={handleSubmit((values) => {
        if (!mutation.isPending) mutation.mutate(values)
      })}
      noValidate
      className="grid grid-cols-[1fr_320px] gap-8"
    >
      <div className="space-y-4">
        <TextField label="Full name" autoComplete="name" placeholder="e.g. Nino Beridze" {...fieldState('fullName')} {...register('fullName')} />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Email" type="email" autoComplete="email" placeholder="example@gmail.com" {...fieldState('email')} {...register('email')} />
          <TextField label="Mobile number" type="tel" autoComplete="tel-national" placeholder="5XX XXX XXX" {...fieldState('mobileNumber')} {...register('mobileNumber')} />
        </div>
        <TextField
          label="Card number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="e.g. 1234 5678 9012 3456"
          {...fieldState('cardNumber')}
          {...formatted('cardNumber', formatCardNumber)}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" {...fieldState('expiry')} {...formatted('expiry', formatExpiry)} />
          <TextField label="CVV" type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="123" {...fieldState('cvv')} {...formatted('cvv', formatDigits(3))} />
        </div>
      </div>

      <div className="flex flex-col">
        <h3 className="text-sm font-extrabold">Summary</h3>
        <div className="mt-4 rounded-xl bg-surface p-4">
          <p className="font-extrabold">{session.movie.title}</p>
          <p className="mt-1 text-xs text-muted">
            Hall {session.hall.name} · {formatShortDate(session.date)} · {session.time}
          </p>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-xs">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Seats</dt>
              <dd className="text-right font-semibold">{hold.seats.map((seat) => seat.code).join(', ')}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Tickets</dt>
              <dd className="text-right font-semibold">{ticketBreakdown(hold)}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between border-t border-line pt-4">
            <span className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Total</span>
            <span className="text-2xl font-extrabold">{formatPrice(hold.subtotal)}</span>
          </div>
          <Button type="submit" size="lg" className="mt-4 w-full" loading={mutation.isPending}>
            Pay &amp; Complete Order
          </Button>
        </div>
      </div>
    </form>
  )
}
