import type { CSSProperties } from 'react'
import { assetUrl } from './api'
import type { PageFill } from '../types/background'

export function pageFillStyle(fill: PageFill): CSSProperties {
  if (!fill) return { backgroundColor: '#ffffff' }
  if (fill.kind === 'image') {
    return {
      backgroundColor: '#ffffff',
      backgroundImage: `url(${assetUrl(fill.value)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  if (fill.kind === 'color') return { backgroundColor: fill.value }
  if (fill.kind === 'gradient') return { background: fill.value }
  return { backgroundColor: '#ffffff' }
}
