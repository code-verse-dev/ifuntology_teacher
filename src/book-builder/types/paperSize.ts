/** Book trim size (portrait): width × height in millimeters. */
export type BookPaperSize =
  | { kind: 'preset'; presetId: string }
  | { kind: 'custom'; widthMm: number; heightMm: number }
