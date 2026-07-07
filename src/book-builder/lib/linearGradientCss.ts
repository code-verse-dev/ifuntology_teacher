export type GradientStopInput = { color: string; percent: number }

/** Build a CSS `linear-gradient` string from direction and color stops. */
export function buildLinearGradientCss(
  direction: string,
  stops: GradientStopInput[],
): string {
  const d = direction.trim()
  const sorted = [...stops].sort((a, b) => a.percent - b.percent)
  const parts = sorted.map(
    (s) => `${s.color.trim()} ${Number(s.percent)}%`,
  )
  return `linear-gradient(${d}, ${parts.join(', ')})`
}
