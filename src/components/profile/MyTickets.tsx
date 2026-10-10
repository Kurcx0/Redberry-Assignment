import { useMutation, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { refundOrder } from '@/api/booking'
import { ApiError } from '@/api/client'
import type { Order } from '@/api/types'
import { TicketIcon, TimerIcon } from '@/components/icons'
import Button, { buttonClasses } from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Modal from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import { useTickets } from '@/hooks/useTickets'
import { formatPrice, formatShortDate } from '@/lib/format'
import { toast } from '@/stores/toast'
import TicketCard from './TicketCard'

export default function MyTickets() {
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'past' ? 'past' : 'upcoming'
  const { data, isPending, isError, refetch, isRefetching } = useTickets()
  const [refunding, setRefunding] = useState<Order | null>(null)

  const upcoming = data?.filter((order) => order.isUpcoming) ?? []
  const past = data?.filter((order) => !order.isUpcoming) ?? []
  const orders = view === 'upcoming' ? upcoming : past

  function changeView(next: 'upcoming' | 'past') {
    setParams({ tab: 'tickets', view: next }, { replace: true, preventScrollReset: true })
  }

  return (
    <div>
      <div className="inline-flex rounded-xl bg-surface p-[5px]" role="tablist" aria-label="Tickets">
        {(
          [
            ['upcoming', 'Upcoming', upcoming.length],
            ['past', 'Past', past.length],
          ] as const
        ).map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={view === value}
            onClick={() => changeView(value)}
            className={clsx(
              'flex h-[29px] items-center gap-2 rounded-[10px] px-4 text-sm font-semibold transition-colors',
              view === value ? 'bg-surface-2 text-white' : 'text-muted hover:text-white',
            )}
          >
            {label}
            {data && <span className={view === value ? 'text-white' : 'text-dim'}>{count}</span>}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {isPending &&
          Array.from({ length: 2 }, (_, index) => <Skeleton key={index} className="h-[183px] w-full rounded-[26px]" />)}

        {isError && <ErrorState onRetry={() => refetch()} retrying={isRefetching} className="rounded-2xl bg-surface/50" />}

        {data && orders.length === 0 && (
          <EmptyState
            icon={view === 'upcoming' ? <TicketIcon /> : <TimerIcon />}
            title={view === 'upcoming' ? 'No upcoming tickets' : 'No past tickets'}
            description={
              view === 'upcoming'
                ? 'When you book a session, your tickets will show up here.'
                : 'Tickets for sessions you have attended or refunded will appear here.'
            }
            action={
              view === 'upcoming' && (
                <Link to="/sessions" className={buttonClasses('primary', 'md')}>
                  Browse sessions
                </Link>
              )
            }
            className="rounded-2xl bg-surface/50"
          />
        )}

        {orders.map((order) => (
          <TicketCard key={order.id} order={order} onRefund={setRefunding} />
        ))}
      </div>

      <RefundDialog order={refunding} onClose={() => setRefunding(null)} />
    </div>
  )
}

function RefundDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (reference: string) => refundOrder(reference),
    onSuccess: (refunded) => {
      toast.success(`Order #${refunded.reference} was refunded. ${formatPrice(refunded.totalPrice)} is on its way back to you.`)
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['movie'] })
      onClose()
    },
    onError: (error) => {
      if (error instanceof ApiError) toast.error(error.message)
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      onClose()
    },
  })

  return (
    <Modal open={!!order} onClose={() => !mutation.isPending && onClose()} className="max-w-[440px]" labelledBy="refund-title">
      {order && (
        <div className="p-8">
          <h2 id="refund-title" className="text-xl font-extrabold">
            Refund this order?
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Your seats for <span className="font-semibold text-white">{order.session.movie.title}</span> on{' '}
            {formatShortDate(order.session.date)} at {order.session.time} will be released and{' '}
            <span className="font-semibold text-white">{formatPrice(order.totalPrice)}</span> will be refunded. This
            cannot be undone.
          </p>
          <div className="mt-7 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
              Keep tickets
            </Button>
            <Button onClick={() => mutation.mutate(order.reference)} loading={mutation.isPending}>
              Refund
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
