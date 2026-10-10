import { formatPrice } from '@/lib/format'

export default function Subtotal({ amount }: { amount: number }) {
  return (
    <div className="flex items-center justify-between px-[5px]">
      <span className="text-xs leading-4 font-semibold uppercase">Subtotal</span>
      <span className="text-[28px] leading-[30px] font-extrabold">{formatPrice(amount)}</span>
    </div>
  )
}
