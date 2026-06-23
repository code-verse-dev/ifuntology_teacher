type Props = {
  line: string
  useFlexLeader: boolean
}

/** Renders a TOC line; optional flex dot leader when `useFlexLeader` and line has the · · · suffix. */
export function TocLinePreview({ line, useFlexLeader }: Props) {
  const marker = '\u00A0\u00A0· · ·'
  if (!useFlexLeader || !line.includes(marker)) {
    return <span className="toc-style-modal__line-plain">{line}</span>
  }
  const left = line.split(marker)[0]
  return (
    <>
      <span className="toc-style-modal__line-text">{left}</span>
      <span className="toc-style-modal__line-leader" aria-hidden />
    </>
  )
}
