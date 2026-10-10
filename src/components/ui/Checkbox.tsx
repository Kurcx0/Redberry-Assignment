import type { ReactNode } from 'react'
import { CheckIcon } from '@/components/icons'

type CheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  description?: string
}

export default function Checkbox({ checked, onChange, label, description }: CheckboxProps) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-[5px] text-sm font-semibold">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] border-dim transition-colors group-hover:border-muted peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-white/40">
        {checked && <CheckIcon className="size-3.5" />}
      </span>
      <span>{label}</span>
      {description && <span className="text-xs font-normal text-muted">· {description}</span>}
    </label>
  )
}
