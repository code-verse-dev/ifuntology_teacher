import type { Area } from 'react-easy-crop'

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (e) => reject(e))
    image.src = url
  })
}

/** Pixel width of exported JPEG (height follows trim aspect). */
const OUTPUT_PAGE_WIDTH = 1700
const OUTPUT_SQUARE_SIZE = 720

export type PageTrimMm = { widthMm: number; heightMm: number }

/**
 * Crops the given region from the image and scales to the book trim proportion.
 */
export async function cropImageToPageJpeg(
  imageObjectUrl: string,
  pixelCrop: Area,
  trim: PageTrimMm = { widthMm: 215.9, heightMm: 279.4 },
): Promise<Blob> {
  const image = await loadImage(imageObjectUrl)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create canvas')

  const outH = Math.round(
    (OUTPUT_PAGE_WIDTH * trim.heightMm) / trim.widthMm,
  )
  canvas.width = OUTPUT_PAGE_WIDTH
  canvas.height = outH

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    OUTPUT_PAGE_WIDTH,
    outH,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Could not export image'))
        else resolve(blob)
      },
      'image/jpeg',
      0.92,
    )
  })
}

export async function cropImageToSquareJpeg(
  imageObjectUrl: string,
  pixelCrop: Area,
): Promise<Blob> {
  const image = await loadImage(imageObjectUrl)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create canvas')
  canvas.width = OUTPUT_SQUARE_SIZE
  canvas.height = OUTPUT_SQUARE_SIZE
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    OUTPUT_SQUARE_SIZE,
    OUTPUT_SQUARE_SIZE,
  )
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Could not export image'))
        else resolve(blob)
      },
      'image/png',
    )
  })
}
