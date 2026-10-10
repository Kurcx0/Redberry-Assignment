import clsx from 'clsx'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

const MAX_SCALE = 2
const DRAG_THRESHOLD = 4

type View = { scale: number; x: number; y: number }

function appZoom() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-zoom')) || 1
}

type ZoomPanProps = {
  children: ReactNode
  footer?: ReactNode
  className?: string
}

const controlClass =
  'flex size-8 items-center justify-center rounded-full bg-surface text-lg leading-none font-semibold transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:text-dim disabled:hover:bg-surface'

export default function ZoomPan({ children, footer, className }: ZoomPanProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 })
  const [fit, setFit] = useState(1)
  const [dragging, setDragging] = useState(false)

  const clamp = useCallback((next: View): View => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return next

    const width = content.offsetWidth * next.scale
    const height = content.offsetHeight * next.scale
    const limit = (offset: number, size: number, available: number) =>
      size <= available ? (available - size) / 2 : Math.min(0, Math.max(available - size, offset))

    return {
      scale: next.scale,
      x: limit(next.x, width, viewport.clientWidth),
      y: limit(next.y, height, viewport.clientHeight),
    }
  }, [])

  const reset = useCallback(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return
    const widthScale = Math.min(1, viewport.clientWidth / content.offsetWidth)
    viewport.style.height = `${Math.ceil(content.offsetHeight * widthScale)}px`
    const scale = Math.min(widthScale, viewport.clientHeight / content.offsetHeight)
    setFit(scale)
    setView(clamp({ scale, x: 0, y: 0 }))
  }, [clamp])

  useLayoutEffect(() => {
    reset()
    const observer = new ResizeObserver(reset)
    if (contentRef.current) observer.observe(contentRef.current)
    window.addEventListener('resize', reset)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', reset)
    }
  }, [reset])

  const zoomAt = useCallback(
    (factor: number, originX?: number, originY?: number) => {
      const viewport = viewportRef.current
      if (!viewport) return
      setView((current) => {
        const scale = Math.min(MAX_SCALE, Math.max(fit, current.scale * factor))
        const pointX = originX ?? viewport.clientWidth / 2
        const pointY = originY ?? viewport.clientHeight / 2
        const ratio = scale / current.scale
        return clamp({
          scale,
          x: pointX - (pointX - current.x) * ratio,
          y: pointY - (pointY - current.y) * ratio,
        })
      })
    },
    [clamp, fit],
  )

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    function handleWheel(event: WheelEvent) {
      event.preventDefault()
      const rect = viewport!.getBoundingClientRect()
      const zoom = appZoom()
      zoomAt(event.deltaY < 0 ? 1.12 : 1 / 1.12, (event.clientX - rect.left) / zoom, (event.clientY - rect.top) / zoom)
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', handleWheel)
  }, [zoomAt])

  const zoomed = view.scale > fit + 0.001

  return (
    <div className={className}>
      <div
        ref={viewportRef}
        className={clsx(
          'relative max-h-[calc(100vh/var(--app-zoom)-360px)] min-h-[240px] touch-none overflow-hidden select-none',
          zoomed && (dragging ? 'cursor-grabbing' : 'cursor-grab'),
        )}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          drag.current = { x: event.clientX, y: event.clientY, moved: false }
        }}
        onPointerMove={(event) => {
          const start = drag.current
          if (!start) return
          const zoom = appZoom()
          const dx = (event.clientX - start.x) / zoom
          const dy = (event.clientY - start.y) / zoom
          if (!start.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
          if (!start.moved) {
            event.currentTarget.setPointerCapture(event.pointerId)
            setDragging(true)
          }
          start.moved = true
          start.x = event.clientX
          start.y = event.clientY
          setView((current) => clamp({ ...current, x: current.x + dx, y: current.y + dy }))
        }}
        onPointerUp={() => {
          suppressClick.current = !!drag.current?.moved
          drag.current = null
          setDragging(false)
        }}
        onPointerCancel={() => {
          drag.current = null
          setDragging(false)
        }}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.stopPropagation()
            suppressClick.current = false
          }
        }}
      >
        <div
          ref={contentRef}
          className="absolute top-0 left-0 w-max origin-top-left"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        >
          {children}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="col-start-2">{footer}</div>
        <div className="flex items-center gap-2 justify-self-end">
          <button type="button" onClick={() => zoomAt(1 / 1.25)} disabled={!zoomed} aria-label="Zoom out" className={controlClass}>
            −
          </button>
          <button
            type="button"
            onClick={() => zoomAt(1.25)}
            disabled={view.scale >= MAX_SCALE - 0.001}
            aria-label="Zoom in"
            className={controlClass}
          >
            +
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={!zoomed}
            className="h-8 rounded-full bg-surface px-3 text-xs font-semibold whitespace-nowrap transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:text-dim disabled:hover:bg-surface"
          >
            Fit hall
          </button>
        </div>
      </div>
    </div>
  )
}
