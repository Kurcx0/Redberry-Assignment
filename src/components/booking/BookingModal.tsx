import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { getHold, holdSeats, releaseHold } from '@/api/booking'
import { ApiError } from '@/api/client'
import { getSeatMap, getSession } from '@/api/sessions'
import type { Order, Seat, SeatHold, Session, TicketTypeSlug } from '@/api/types'
import { CloseIcon, ErrorIcon } from '@/components/icons'
import ErrorState from '@/components/ui/ErrorState'
import Modal from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import { ageRestrictionMessage } from '@/hooks/useBookSession'
import { useFilterOptions } from '@/hooks/useFilterOptions'
import { useHoldCountdown } from '@/hooks/useHoldCountdown'
import { useMe } from '@/hooks/useMe'
import { formatLongDate } from '@/lib/format'
import { forgetHold, getStoredHold, saveHold } from '@/lib/holdStorage'
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
  const [storedHoldId] = useState(() => getStoredHold(sessionId))
  const [bodyHeight, setBodyHeight] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reset = () => setBodyHeight(0)
    window.addEventListener('resize', reset)
    return () => window.removeEventListener('resize', reset)
  }, [])

  const goTo = useCallback((next: Step) => {
    const height = bodyRef.current?.offsetHeight ?? 0
    setBodyHeight((current) => Math.max(current, height))
    setStep(next)
  }, [])

  const sessionQuery = useQuery({ queryKey: ['session', sessionId], queryFn: () => getSession(sessionId) })
  const mapQuery = useQuery({
    queryKey: ['seats', sessionId],
    queryFn: () => getSeatMap(sessionId),
    staleTime: 0,
    refetchOnMount: 'always',
  })
  const storedHoldQuery = useQuery({
    queryKey: ['hold', storedHoldId],
    queryFn: () => getHold(storedHoldId!),
    enabled: !!storedHoldId && !!user,
    retry: false,
    staleTime: 0,
  })

  const session = sessionQuery.data
  const maxSeats = options?.maxSeatsPerOrder ?? 3
  const ticketTypes = useMemo(() => options?.ticketTypes ?? [], [options])
  const storedHoldSettled = !storedHoldId || !user || storedHoldQuery.isSuccess || storedHoldQuery.isError

  useEffect(() => {
    if (restored || !mapQuery.data || !storedHoldSettled) return
    setRestored(true)

    const sections = new Map(
      mapQuery.data.sections.flatMap((section) =>
        section.rows.flatMap((row) => row.seats.map((seat) => [seat.id, section.name] as const)),
      ),
    )
    const stored = storedHoldQuery.data
    if (stored?.isLive && stored.secondsRemaining > 0) {
      setHold(stored)
      setSelected(
        stored.seats.map((seat) => ({
          id: seat.seatId,
          code: seat.code,
          section: sections.get(seat.seatId) ?? '',
          ticketType: seat.ticketType.slug,
        })),
      )
      goTo('checkout')
      return
    }

    if (storedHoldId) forgetHold(sessionId)
    const mine = mapQuery.data.sections.flatMap((section) =>
      section.rows.flatMap((row) =>
        row.seats
          .filter((seat) => seat.isMine)
          .map((seat) => ({ id: seat.id, code: seat.code, section: section.name, ticketType: 'adult' as const })),
      ),
    )
    if (mine.length) setSelected(mine.slice(0, maxSeats))
  }, [restored, mapQuery.data, storedHoldSettled, storedHoldQuery.data, storedHoldId, sessionId, maxSeats, goTo])

  useEffect(() => {
    if (!restored) return
    if (hold) saveHold(sessionId, hold.holdId)
    else forgetHold(sessionId)
  }, [hold, restored, sessionId])

  const refetchMap = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['seats', sessionId] })
  }, [queryClient, sessionId])

  const expireHold = useCallback(
    (message = HOLD_EXPIRED) => {
      setHold(null)
      setSelected([])
      goTo('seats')
      setNotice({ tone: 'warning', message })
      refetchMap()
    },
    [refetchMap, goTo],
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
        goTo('seats')
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
    [expireHold, refetchMap, goTo],
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
      goTo('checkout')
    },
    onError: handleFailure,
  })

  function close() {
    if (hold && !order) {
      releaseHold(hold.holdId).catch(() => undefined)
      forgetHold(sessionId)
    }
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

  const stepBar = (
    <div className="relative grid h-[33px] grid-cols-2 gap-2 rounded-full bg-surface" role="tablist" aria-label="Booking steps">
      <span
        aria-hidden
        className={clsx(
          'absolute inset-y-0 left-0 w-[calc(50%-4px)] rounded-full bg-primary transition-transform duration-300',
          step === 'checkout' && 'translate-x-[calc(100%+8px)]',
        )}
      />
      <button
        type="button"
        role="tab"
        aria-selected={step === 'seats'}
        onClick={() => goTo('seats')}
        className="relative text-xs font-semibold uppercase"
      >
        Seats
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={step === 'checkout'}
        disabled={!hold}
        onClick={() => goTo('checkout')}
        className="relative text-xs font-semibold uppercase disabled:cursor-not-allowed"
      >
        Checkout
      </button>
    </div>
  )

  const noticeBanner = notice && (
    <div
      role="alert"
      className={clsx(
        'mt-4 flex items-start gap-2.5 rounded-xl border px-4 py-2.5 text-xs leading-4',
        notice.tone === 'error'
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-warning/40 bg-warning/10 text-warning',
      )}
    >
      <ErrorIcon className="size-4" />
      {notice.message}
    </div>
  )

  return (
    <Modal open onClose={close} className="max-w-[1146px]" labelledBy="booking-title" closeButton={step === 'done'}>
      {step === 'done' && order ? (
        <Confirmation
          order={order}
          onBackHome={() => {
            closeBooking()
            navigate('/')
          }}
          onViewTickets={() => {
            closeBooking()
            navigate('/profile?tab=tickets')
          }}
        />
      ) : (
        <div className="p-8">
          <BookingHeader session={session} remaining={remaining} onClose={close} />

          <div ref={bodyRef} className="mt-8 flex flex-col" style={{ minHeight: bodyHeight || undefined }}>
            {step === 'seats' && (
              <div className="grid flex-1 grid-cols-[minmax(0,1fr)_1px_321px] gap-x-5">
                <div>
                  {stepBar}
                  {noticeBanner}
                  <div className="mt-5">
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
                </div>
                <div className="bg-surface" />
                <div className="relative">
                  <div className="absolute inset-0">
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
                </div>
              </div>
            )}

            {step === 'checkout' && hold && session && (
              <Checkout
                session={session}
                hold={hold}
                user={user}
                header={
                  <>
                    {stepBar}
                    {noticeBanner}
                  </>
                }
                onPaid={handlePaid}
                onFailed={handleFailure}
              />
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

type BookingHeaderProps = {
  session?: Session
  remaining: number | null
  onClose: () => void
}

function BookingHeader({ session, remaining, onClose }: BookingHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      {session ? (
        <div className="min-w-0 flex-1">
          <h2 id="booking-title" className="text-xl leading-[22px] font-extrabold uppercase">
            {session.movie.title}
          </h2>
          <p className="mt-2 text-xs leading-4 text-muted">
            {session.venue.name} · Hall {session.hall.name} · {formatLongDate(session.date)} · {session.time} ·{' '}
            {session.format.name} · {session.language.name}
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-2">
          <Skeleton className="h-[22px] w-64" />
          <Skeleton className="h-4 w-[460px]" />
        </div>
      )}
      {remaining !== null && <HoldTimer seconds={remaining} />}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="mt-[7px] flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/8 hover:text-white"
      >
        <CloseIcon className="size-5" />
      </button>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div>
      <Skeleton className="mx-5 h-[30px]" />
      <div className="mt-[31px] space-y-2.5">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="mx-auto h-[52px] w-[644px]" />
        ))}
      </div>
    </div>
  )
}
