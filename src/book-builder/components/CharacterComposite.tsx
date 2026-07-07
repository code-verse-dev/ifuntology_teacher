import { useMemo } from 'react'
import { assetUrl } from '../lib/api'
import type { CatalogCategory } from '../types/character'

export type SelectionMap = Record<string, string | null>

type Props = {
  catalog: CatalogCategory[]
  selection: SelectionMap
  layerOrder?: string[]
  layerVisibility?: Record<string, boolean>
  opacity?: number
  className?: string
}

export function CharacterComposite({
  catalog,
  selection,
  layerOrder,
  layerVisibility,
  opacity,
  className,
}: Props) {
  const layers = useMemo(() => {
    const byId = new Map(catalog.map((c) => [c.id, c]))
    const orderedByDefault = [...catalog].sort((a, b) => a.layerOrder - b.layerOrder)
    const ordered =
      layerOrder && layerOrder.length > 0
        ? layerOrder.map((id) => byId.get(id)).filter((x): x is CatalogCategory => !!x)
        : orderedByDefault
    const imgs: { src: string; key: string }[] = []
    for (const cat of ordered) {
      if (layerVisibility && layerVisibility[cat.id] === false) continue
      const vid = selection[cat.id]
      if (!vid) continue
      const v = cat.variations.find((x) => x.id === vid)
      if (v) imgs.push({ src: assetUrl(v.imagePath), key: v.id })
    }
    return imgs
  }, [catalog, layerOrder, layerVisibility, selection])

  return (
    <div
      className={`character-composite ${className ?? ''}`}
      style={opacity != null && opacity < 1 ? { opacity } : undefined}
    >
      {layers.map(({ src, key }) => (
        <img
          key={key}
          src={src}
          alt=""
          className="character-layer"
          draggable={false}
          crossOrigin="anonymous"
        />
      ))}
    </div>
  )
}
