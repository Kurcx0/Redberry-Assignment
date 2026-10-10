import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { holdSeats, releaseHold } from '@/api/booking'
import { ApiError } from '@/api/client'
import { getSeatMap, getSession } from '@/api/sessions'
import { ErrorIcon } from '@/components/icons'
import type { Order, Seat, SeatHold, Session, TicketTypeSlug } from '@/api/types'
import ErrorState from '@/components/ui/ErrorState'
import Modal from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import { ageRestrictionMessage } from '@/hooks/useBookSession'
import { useFilterOptions } from '@/hooks/useFilterOptions'
import { useHoldCountdown } from '@/hooks/useHoldCountdown'
import { useMe } from '@/hooks/useMe'
import { formatLongDate } from '@/lib/format'
import { useBookingStore } from '@/stores/booking'
import Checkout from './Checkout'
import Confirmation from './Confirmation'
import HoldTimer from './HoldTimer'
import SeatMap from './SeatMap'
import SeatSummary, { type SelectedSeat } from './SeatSummary'

type Step = 'seats' | 'checkout' | 'done'
type Notice = { tone: 'error' | 'warning'; message: string }

const HOLD_EXPIRED = 'Your hold time expired. Please re-select your seats.'

function joinCodes(codes: string[]) {
  if (codes.length <= 1) return codes.join('')
  return `${codes.slice(0, -1).join(', ')} and ${codes[codes.length - 1]}`
}

export default function BookingModal() {
  const sessionId = useBookingStore((state) => state.sessionId)
  if (sessionId === null) return null
  return <BookingFlow key={sessionId} sessionId={sessionId} />
}

function BookingFlow({ sessionId }: { sessionId: number }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const closeBooking = useBookingStore((state) => state.close)
  const { user } = useMe()
  const { data: options } = useFilterOptions()

  const [step, setStep] = useState<Step>('seats')
  const [selected, setSelected] = useState<SelectedSeat[]>([])
  const [contested, setContested] = useState<Set<string>>(new Set())
  const [hold, setHold] = useState<SeatHold | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [restored, setRestored] = useState(false)

  const sessionQuery = useQuery({ queryKey: ['session', sessionId], queryFn: () => getSession(sessionId) })
  const mapQuery = useQuery({
    queryKey: ['seats', sessionId],
    queryFn: () => getSeatMap(sessionId),
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const session = sessionQuery.data
  const maxSeats = options?.maxSeatsPerOrder ?? 3
  const ticketTypes = useMemo(() => options?.ticketTypes ?? [], [options])

  if (mapQuery.data && !restored) {
    setRestored(true)
    const mine = mapQuery.data.sections.flatMap((section) =>
      section.rows.flatMap((row) =>
        row.seats
          .filter((seat) => seat.isMine)
          .map((seat) => ({ id: seat.id, code: seat.code, section: section.name, ticketType: 'adult' as const })),
      ),
    )
    if (mine.length) setSelected(mine.slice(0, maxSeats))
  }

  const refetchMap = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['seats', sessionId] })
  }, [queryClient, sessionId])

  const expireHold = useCallback(
    (message = HOLD_EXPIRED) => {
      setHold(null)
      setSelected([])
      setStep('seats')
      setNotice({ tone: 'warning', message })
      refetchMap()
    },
    [refetchMap],
  )

  const remaining = useHoldCountdown(step !== 'done' ? (hold?.expiresAt ?? null) : null, expireHold)

  useEffect(() => {
    if (notice?.tone !== 'warning' || notice.message === HOLD_EXPIRED) return
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  const handleFailure = useCallback(
    (error: unknown) => {
      if (!(error instanceof ApiError)) return

      if (error.status === 409) {
        const lost = error.contested ?? []
        setContested((current) => new Set([...current, ...lost]))
        setSelected((current) => current.filter((seat) => !lost.includes(seat.code)))
        setHold(null)
        setStep('seats')
        setNotice({
          tone: 'error',
          message: lost.length
            ? `Sorry, ${lost.length === 1 ? 'seat' : 'seats'} ${joinCodes(lost)} ${lost.length === 1 ? 'was' : 'were'} just taken by someone else. The rest of your selection is still here.`
            : error.message,
        })
        refetchMap()
        return
      }

      if (error.status === 422 && !error.errors && error.message === HOLD_EXPIRED) {
        expireHold(error.message)
        return
      }

      const fieldMessage = error.errors ? Object.values(error.errors)[0]?.[0] : null
      setNotice({ tone: 'error', message: fieldMessage ?? error.message })
    },
    [expireHold, refetchMap],
  )

  const holdMutation = useMutation({
    mutationFn: () =>
      holdSeats(
        sessionId,
        selected.map((seat) => ({ seatId: seat.id, ticketType: seat.ticketType })),
      ),
    onSuccess: (data) => {
      setHold(data)
      setNotice(null)
      setStep('checkout')
    },
    onError: handleFailure,
  })

  function close() {
    if (hold && !order) releaseHold(hold.holdId).catch(() => undefined)
    closeBooking()
  }

  function toggleSeat(seat: Seat, section: string) {
    if (selected.some((item) => item.id === seat.id)) {
      setSelected(selected.filter((item) => item.id !== seat.id))
      return
    }
    if (selected.length >= maxSeats) {
      setNotice({ tone: 'warning', message: `You can select up to ${maxSeats} seats per order.` })
      return
    }
    setNotice(null)
    setSelected([...selected, { id: seat.id, code: seat.code, section, ticketType: 'adult' }])
  }

  function changeTicketType(seatId: number, ticketType: TicketTypeSlug) {
    setSelected(selected.map((seat) => (seat.id === seatId ? { ...seat, ticketType } : seat)))
  }

  function handlePaid(paid: Order) {
    setOrder(paid)
    setHold(null)
    setStep('done')
    queryClient.invalidateQueries({ queryKey: ['tickets'] })
    queryClient.invalidateQueries({ queryKey: ['sessions'] })
    queryClient.invalidateQueries({ queryKey: ['movie'] })
    refetchMap()
  }

  const violations = useMemo(() => {
    const result = new Map<number, string>()
    if (!session) return result
    const rating = session.movie.ageRating
    selected.forEach((seat) => {
      const type = ticketTypes.find((item) => item.slug === seat.ticketType)
      if (type?.blockedFromRatingAge != null && rating.minAge >= type.blockedFromRatingAge) {
        result.set(seat.id, `${type.name} tickets are not available for ${rating.code} titles.`)
      }
    })
    return result
  }, [selected, session, ticketTypes])

  let blockReason: string | null = null
  if (!user) blockReason = 'Log in to continue with your booking.'
  else if (!user.profileComplete) blockReason = 'Please complete your profile to enable booking.'
  else if (session && session.movie.ageRating.minAge > (user.age ?? 0)) {
    blockReason = ageRestrictionMessage(session.movie.ageRating)
  }

  return (
    <Modal open onClose={close} className="max-w-[1150px]" labelledBy="booking-title">
      {step === 'done' && order ? (
        <Confirmation
          order={order}
          onClose={closeBooking}
          onViewTickets={() => {
            closeBooking()
            navigate('/profile?tab=tickets')
          }}
        />
      ) : (
        <div className="p-8">
          <BookingHeader session={session} remaining={remaining} />

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-surface p-1" role="tablist" aria-label="Booking steps">
            <button
              type="button"
              role="tab"
              aria-selected={step === 'seats'}
              onClick={() => setStep('seats')}
              className={clsx(
                'h-9 rounded-full text-xs font-bold tracking-[0.08em] uppercase transition-colors',
                step === 'seats' ? 'bg-primary' : 'text-muted hover:text-white',
              )}
            >
              1. Seats
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={step === 'checkout'}
              disabled={!hold}
              onClick={() => setStep('checkout')}
              className={clsx(
                'h-9 rounded-full text-xs font-bold tracking-[0.08em] uppercase transition-colors',
                step === 'checkout' ? 'bg-primary' : 'text-muted enabled:hover:text-white disabled:cursor-not-allowed',
              )}
            >
              2. Checkout
            </button>
          </div>

          {notice && (
            <div
              role="alert"
              className={clsx(
                'mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
                notice.tone === 'error'
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-warning/40 bg-warning/10 text-warning',
              )}
            >
              <ErrorIcon className="mt-0.5 size-4" />
              {notice.message}
            </div>
          )}

          <div className="mt-6">
            {step === 'seats' && (
              <div className="grid grid-cols-[1fr_320px] gap-8">
                <div className="min-w-0">
                  {mapQuery.isPending && <MapSkeleton />}
                  {mapQuery.isError && (
                    <ErrorState onRetry={() => mapQuery.refetch()} retrying={mapQuery.isRefetching} />
                  )}
                  {mapQuery.data && (
                    <SeatMap
                      map={mapQuery.data}
                      selectedIds={new Set(selected.map((seat) => seat.id))}
                      contested={contested}
                      onToggle={toggleSeat}
                    />
                  )}
                </div>
                <SeatSummary
                  seats={selected}
                  ticketTypes={ticketTypes}
                  maxSeats={maxSeats}
                  sessionPrice={session?.price ?? 0}
                  violations={violations}
                  blockReason={blockReason}
                  submitting={holdMutation.isPending}
                  onTicketTypeChange={changeTicketType}
                  onRemove={(seatId) => setSelected(selected.filter((seat) => seat.id !== seatId))}
                  onSubmit={() => {
                    if (!holdMutation.isPending) holdMutation.mutate()
                  }}
                />
              </div>
            )}

            {step === 'checkout' && hold && session && (
              <Checkout session={session} hold={hold} user={user} onPaid={handlePaid} onFailed={handleFailure} />
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

function BookingHeader({ session, remaining }: { session?: Session; remaining: number | null }) {
  if (!session) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-[520px]" />
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between gap-6 pr-10">
      <div>
        <h2 id="booking-title" className="text-[22px] font-extrabold uppercase">
          {session.movie.title}
        </h2>
        <p className="mt-1.5 text-[13px] text-muted">
          {session.venue.name} · Hall {session.hall.name} · {formatLongDate(session.date)} · {session.time} ·{' '}
          {session.format.name} · {session.language.name}
        </p>
      </div>
      {remaining !== null && <HoldTimer seconds={remaining} />}
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="mb-8 h-8 w-full" />
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="mx-auto h-[38px] w-[560px]" />
      ))}
    </div>
  )
}
