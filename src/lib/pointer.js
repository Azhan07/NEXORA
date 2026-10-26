/**
 * Global normalized pointer (-1..1) tracked on the window.
 * 3D scenes read this every frame, so the orb and lights react to the
 * cursor even when HTML content sits on top of the canvas.
 */
export const pointer = { x: 0, y: 0 }

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
    },
    { passive: true },
  )
}
