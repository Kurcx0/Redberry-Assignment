import { request } from './client'
import type { Order, SeatHold, TicketTypeSlug } from './types'

export type HoldSeat = {
  seatId: number
  ticketType: TicketTypeSlug
}

export type OrderPayload = {
  holdId: string
  fullName: string
  email: string
  mobileNumber: string
  cardNumber: string
  expiry: string
  cvv: string
}

export async function holdSeats(sessionId: number, seats: HoldSeat[]) {
  const response = await request<{ data: SeatHold }>(`/sessions/${sessionId}/holds`, {
    method: 'POST',
    body: { seats },
  })
  return response.data
}

export function releaseHold(holdId: string) {
  return request<void>(`/holds/${holdId}`, { method: 'DELETE', replayOnUnauthorized: false })
}

export async function createOrder(payload: OrderPayload) {
  const response = await request<{ data: Order }>('/orders', { method: 'POST', body: payload })
  return response.data
}

export async function getTickets() {
  const response = await request<{ data: Order[] }>('/tickets')
  return response.data
}

export async function refundOrder(reference: string) {
  const response = await request<{ data: Order }>(`/orders/${reference}/refund`, {
    method: 'POST',
  })
  return response.data
}
