const EDITOR_HANDLE_SELECTORS = [
  '.book-page__character__resize-handle',
  '.book-page__character__rotate-handle',
  '.book-page__text-box__resize-handle',
  '.book-page__thought-bubble__resize-handle',
  '.book-page__shape__resize-handle',
  '.book-page__shape__rotate-handle',
  '.book-page__shape-group-resize-handle',
].join(', ')

const EDITOR_SELECTION_CLASSES = [
  'book-page__character--selected',
  'book-page__character--multi',
  'book-page__text-box-wrap--selected',
  'book-page__text-box-wrap--multi',
  'book-page__thought-bubble-wrap--selected',
  'book-page__thought-bubble-wrap--multi',
  'book-page__shape-wrap--selected',
  'book-page__shape-wrap--multi',
]

/** Strip selection chrome from clone — never remove the placed elements themselves. */
export function stripEditorChromeFromClone(clonedRoot: HTMLElement): void {
  clonedRoot.querySelectorAll(EDITOR_HANDLE_SELECTORS).forEach((node) => node.remove())
  for (const cls of EDITOR_SELECTION_CLASSES) {
    clonedRoot.querySelectorAll(`.${cls}`).forEach((node) => {
      node.classList.remove(cls)
    })
  }
}

/** Clone a live page surface for server export (Puppeteer renders cover + PDF). */
export function clonePageHtmlForExport(el: HTMLElement): string {
  const clone = el.cloneNode(true) as HTMLElement
  stripEditorChromeFromClone(clone)
  clone.querySelectorAll('img[crossorigin]').forEach((img) => {
    img.removeAttribute('crossorigin')
  })
  /* Fill the print wrapper — builder CSS uses min(560px, 88vw) which shrinks in headless PDF. */
  clone.style.width = '100%'
  clone.style.height = '100%'
  clone.style.maxWidth = 'none'
  clone.style.minWidth = '0'
  clone.style.aspectRatio = 'auto'
  clone.style.boxShadow = 'none'
  clone.style.borderRadius = '0'
  return clone.outerHTML
}
