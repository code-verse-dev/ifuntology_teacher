import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { cropImageToPageJpeg, type PageTrimMm } from '../lib/cropImage'

type Props = {
  disabled: boolean
  onCancel: () => void
  setFormError: (msg: string | null) => void
  onCroppedUpload: (file: File, label: string) => Promise<void>
  /** Book trim in mm (portrait); drives crop aspect and export pixels. */
  trimMm: PageTrimMm
}

export function BackgroundImageCropForm({
  disabled,
  onCancel,
  setFormError,
  onCroppedUpload,
  trimMm,
}: Props) {
  const cropAspect = trimMm.widthMm / trimMm.heightMm
  const [label, setLabel] = useState('')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const busy = disabled || submitting

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc)
    }
  }, [imageSrc])

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormError(null)
    const f = e.target.files?.[0]
    if (!f) return
    if (imageSrc) URL.revokeObjectURL(imageSrc)
    setImageSrc(URL.createObjectURL(f))
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const name = label.trim()
    if (!name) {
      setFormError('Name is required')
      return
    }
    if (!imageSrc) {
      setFormError('Choose an image file')
      return
    }
    if (!croppedAreaPixels) {
      setFormError('Adjust the crop, then try again')
      return
    }
    setSubmitting(true)
    try {
      const blob = await cropImageToPageJpeg(imageSrc, croppedAreaPixels, trimMm)
      const file = new File([blob], 'page-background.jpg', {
        type: 'image/jpeg',
      })
      await onCroppedUpload(file, name)
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not process image',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="bg-modal-sub__form" onSubmit={submit}>
      <label className="bg-modal-sub__label">
        Name
        <input
          className="bg-modal-sub__input"
          placeholder="e.g. My photo"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          autoFocus
          disabled={busy}
        />
      </label>
      <label className="bg-modal-sub__label">
        Image file
        <span className="bg-modal-sub__file-wrap">
          <span className="bg-modal-sub__file-btn">Choose file…</span>
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={onFileChange}
          />
        </span>
      </label>
      {imageSrc ? (
        <>
          <p className="bg-modal-sub__hint bg-modal-sub__hint--crop">
            Drag to position, use the slider to zoom. The frame matches your book
            trim ({trimMm.widthMm} × {trimMm.heightMm} mm).
          </p>
          <div className="bg-modal__crop-wrap">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={cropAspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              restrictPosition={false}
            />
          </div>
          <label className="bg-modal-sub__label bg-modal__crop-zoom-label">
            Zoom
            <input
              type="range"
              className="bg-modal__crop-zoom"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={busy}
            />
          </label>
        </>
      ) : null}
      <div className="bg-modal-sub__actions">
        <button
          type="button"
          className="bg-modal-sub__btn bg-modal-sub__btn--ghost"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-modal-sub__btn bg-modal-sub__btn--primary"
          disabled={busy || !imageSrc}
        >
          {busy ? 'Adding…' : 'Add to library'}
        </button>
      </div>
    </form>
  )
}
