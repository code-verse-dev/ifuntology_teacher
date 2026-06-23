export type CatalogVariation = {
  id: string
  categoryId: string
  label: string
  imagePath: string
  sortOrder: number
  isDefault?: boolean
}

export type CatalogCategory = {
  id: string
  name: string
  slug: string
  layerOrder: number
  iconPath?: string
  iconTooltip?: string
  variations: CatalogVariation[]
}

export type CategoryDoc = {
  _id: string
  name: string
  slug: string
  layerOrder: number
  iconPath?: string
  iconTooltip?: string
  createdAt?: string
  updatedAt?: string
}
