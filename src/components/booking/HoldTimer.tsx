import clsx from 'clsx'

export default function HoldTimer({ seconds }: { seconds: number }) {
  const minutes = Math.floor(seconds / 60)
  const rest = String(seconds % 60).padStart(2, '0')

  return (
    <div
      role="timer"
      aria-label={`Seats held for ${minutes} minutes ${rest} seconds`}
      className={clsx(
        'h-[46px] w-[102px] shrink-0 rounded-xl pt-[7px] text-center transition-colors',
        seconds <= 60 ? 'bg-primary/10 text-primary' : 'bg-surface',
      )}
    >
      <p className="text-xs leading-4 font-semibold text-muted uppercase">Seats held</p>
      <p className="text-sm leading-[15px] font-extrabold tabular-nums">
        {minutes}:{rest}
      </p>
    </div>
  )
}
