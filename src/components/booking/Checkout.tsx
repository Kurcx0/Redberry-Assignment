import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import type { ChangeEvent, ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { createOrder } from '@/api/booking'
import { ApiError } from '@/api/client'
import type { Order, SeatHold, Session, User } from '@/api/types'
import Button from '@/components/ui/Button'
import TextField from '@/components/ui/TextField'
import { formatShortDate } from '@/lib/format'
import { applyServerErrors } from '@/lib/forms'
import { checkoutSchema, type CheckoutValues } from '@/lib/validation'
import Subtotal from './Subtotal'

type CheckoutProps = {
  session: Session
  hold: SeatHold
  user: User | null
  header: ReactNode
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

export default function Checkout({ session, hold, user, header, onPaid, onFailed }: CheckoutProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, isValid },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
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
      className="grid flex-1 grid-cols-[minmax(0,1fr)_1px_321px] gap-x-5"
    >
      <div>
        {header}
        <div className="mt-[23px] space-y-[23px]">
          <TextField label="Full name" autoComplete="name" placeholder="e.g. Nino Beridze" {...fieldState('fullName')} {...register('fullName')} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Email" type="email" autoComplete="email" placeholder="example@gmail.com" {...fieldState('email')} {...register('email')} />
            <TextField label="Mobile number" type="tel" autoComplete="tel-national" placeholder="5XX XXX XXX" {...fieldState('mobileNumber')} {...register('mobileNumber')} />
          </div>
        </div>
        <div className="mt-6 space-y-[23px] border-t border-surface pt-[23px]">
          <TextField
            label="Card number"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="e.g. 1234 4567 8901 2345"
            {...fieldState('cardNumber')}
            {...formatted('cardNumber', formatCardNumber)}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="e.g. 12/34" {...fieldState('expiry')} {...formatted('expiry', formatExpiry)} />
            <TextField label="CVV" type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="e.g. 123" {...fieldState('cvv')} {...formatted('cvv', formatDigits(3))} />
          </div>
        </div>
      </div>

      <div className="bg-surface" />

      <div className="flex flex-col">
        <h3 className="text-sm leading-[15px] font-extrabold">Summary</h3>
        <div className="mt-3 rounded-xl bg-surface p-4">
          <p className="text-sm leading-[15px] font-extrabold uppercase">{session.movie.title}</p>
          <p className="mt-2 text-xs leading-4 text-muted">
            Hall {session.hall.name} · {formatShortDate(session.date)} · {session.time}
          </p>
          <div className="my-2.5 h-px bg-line" />
          <dl className="space-y-2.5 text-xs leading-4">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Seats</dt>
              <dd className="text-right font-semibold">{hold.seats.map((seat) => seat.code).join(', ')}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Tickets</dt>
              <dd className="text-right">{ticketBreakdown(hold)}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-auto pt-[18px]">
          <Subtotal amount={hold.subtotal} />
          <Button type="submit" className="mt-[11px] w-full" disabled={!isValid} loading={mutation.isPending}>
            Pay: Complete order
          </Button>
        </div>
      </div>
    </form>
  )
}
