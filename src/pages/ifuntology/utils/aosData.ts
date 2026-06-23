export type AosAnimation =
  | "fade"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "fade-in"
  | "zoom-in"
  | "zoom-in-up"
  | "flip-up"
  | "slide-up";

export interface AosDataProps {
  "data-aos"?: AosAnimation;
  "data-aos-delay"?: number;
  "data-aos-duration"?: number;
}

export function aosData(
  _animation: AosAnimation,
  _options?: { delay?: number; duration?: number },
): AosDataProps {
  return {};
}

export function aosStaggerDelay(index: number, stepMs = 72): number {
  return index * stepMs;
}
