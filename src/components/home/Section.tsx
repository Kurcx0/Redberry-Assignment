import clsx from 'clsx'
import type { ReactNode } from 'react'

type SectionProps = {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
  uppercase?: boolean
}

export default function Section({ title, action, children, className, uppercase = true }: SectionProps) {
  return (
    <section className={clsx('pt-12', className)}>
      <div className="flex items-end justify-between px-[72px]">
        <h2 className={clsx('text-2xl font-extrabold', uppercase && 'uppercase')}>{title}</h2>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function CardRow({ children }: { children: ReactNode }) {
  return <div className="thin-scrollbar flex gap-[18px] overflow-x-auto px-[72px] pb-4">{children}</div>
}
