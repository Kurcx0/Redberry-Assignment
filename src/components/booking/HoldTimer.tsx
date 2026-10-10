import clsx from 'clsx'

export default function HoldTimer({ seconds }: { seconds: number }) {
  const minutes = Math.floor(seconds / 60)
  const rest = String(seconds % 60).padStart(2, '0')

  return (
    <div
      role="timer"
      aria-label={`Seats held for ${minutes} minutes ${rest} seconds`}
      className={clsx(
        'rounded-xl border px-4 py-2 text-center transition-colors',
        seconds <= 60 ? 'border-primary/40 bg-primary/10 text-primary' : 'border-line bg-surface',
      )}
    >
      <p className="text-[10px] font-semibold tracking-[0.1em] text-muted uppercase">Seats held</p>
      <p className="text-lg leading-6 font-extrabold tabular-nums">
        {minutes}:{rest}
      </p>
    </div>
  )
}
