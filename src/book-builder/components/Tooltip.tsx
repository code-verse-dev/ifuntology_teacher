import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import './tooltip.css'

type Placement = 'top' | 'bottom'

type Props = {
  content: ReactNode
  children: ReactElement
  /** Show after hover/focus pause (ms). */
  delayMs?: number
  placement?: Placement
  /** Stretch trigger to fill parent (e.g. full sidebar button). */
  fill?: boolean
}

export function Tooltip({
  content,
  children,
  delayMs = 160,
  placement = 'top',
  fill = false,
}: Props) {
  const id = useId()
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (showTimerRef.current != null) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
  }, [])

  const scheduleShow = useCallback(() => {
    clearTimer()
    showTimerRef.current = setTimeout(() => setOpen(true), delayMs)
  }, [clearTimer, delayMs])

  const hide = useCallback(() => {
    clearTimer()
    setOpen(false)
  }, [clearTimer])

  useEffect(() => () => clearTimer(), [clearTimer])

  const updatePosition = useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const gap = 6
    if (placement === 'top') {
      setCoords({
        left: r.left + r.width / 2,
        top: r.top - gap,
      })
    } else {
      setCoords({
        left: r.left + r.width / 2,
        top: r.bottom + gap,
      })
    }
  }, [placement])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    const el = anchorRef.current
    const RO = typeof ResizeObserver !== 'undefined' ? ResizeObserver : null
    const ro =
      RO && el
        ? new RO(() => updatePosition())
        : null
    if (ro && el) ro.observe(el)
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      ro?.disconnect()
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])

  const child = cloneElement(children, {
    ...(children.props as Record<string, unknown>),
    'aria-describedby': open ? id : undefined,
  } as never)

  const layer =
    open &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        id={id}
        role="tooltip"
        className={'ui-tooltip-layer' + (open ? ' is-visible' : '')}
        data-placement={placement}
        style={{
          left: coords.left,
          top: coords.top,
          transform:
            placement === 'top'
              ? 'translate(-50%, -100%)'
              : 'translate(-50%, 0)',
        }}
      >
        <div className="ui-tooltip-layer__inner">
          {content}
          <span className="ui-tooltip-layer__arrow" aria-hidden />
        </div>
      </div>,
      document.body,
    )

  return (
    <>
      <span
        ref={anchorRef}
        className={
          'ui-tooltip-anchor' + (fill ? ' ui-tooltip-anchor--fill' : '')
        }
        onMouseEnter={scheduleShow}
        onMouseLeave={hide}
        onFocus={scheduleShow}
        onBlur={hide}
      >
        {child}
      </span>
      {layer}
    </>
  )
}
