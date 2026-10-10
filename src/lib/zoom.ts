const DESIGN_WIDTH = 1728
const MAX_ZOOM = 1920 / DESIGN_WIDTH

function applyZoom(width: number) {
  const zoom = Math.min(Math.max(width / DESIGN_WIDTH, 1), MAX_ZOOM)
  document.documentElement.style.setProperty('--app-zoom', zoom.toFixed(4))
}

export function startZoomSync() {
  const root = document.documentElement
  applyZoom(root.clientWidth)
  new ResizeObserver(([entry]) => applyZoom(entry.contentRect.width)).observe(root)
  window.addEventListener('load', () => applyZoom(root.clientWidth))
}
