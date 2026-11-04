import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Overlay = {
  visible: boolean
  addEventListener(type: 'geometrychange', listener: () => void): void
  removeEventListener(type: 'geometrychange', listener: () => void): void
}

/** Decoration only. Windows keeps its caption buttons, glyphs and hit testing. */
export function WindowCaptionPlates(): ReactNode {
  const overlay = (navigator as Navigator & { windowControlsOverlay?: Overlay }).windowControlsOverlay
  const [visible, setVisible] = useState(overlay?.visible ?? false)
  useEffect(() => {
    if (!overlay) return
    const update = (): void => setVisible(overlay.visible)
    update()
    overlay.addEventListener('geometrychange', update)
    return () => overlay.removeEventListener('geometrychange', update)
  }, [overlay])
  return visible ? <div className="window-caption-plates" aria-hidden="true"><span /><span /><span /></div> : null
}
