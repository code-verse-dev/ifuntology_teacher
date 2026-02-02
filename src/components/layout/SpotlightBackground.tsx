import * as React from "react";

function shouldReduceMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

/**
 * Signature moment: subtle spotlight that follows the pointer.
 * Uses CSS variables so styling stays token-driven.
 */
export default function SpotlightBackground({ children }: { children: React.ReactNode }) {
  const reduce = React.useMemo(() => shouldReduceMotion(), []);
  const ref = React.useRef<HTMLDivElement | null>(null);

  const onMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (reduce) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--spot-x", `${x}%`);
      el.style.setProperty("--spot-y", `${y}%`);
    },
    [reduce],
  );

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="relative min-h-screen bg-app"
      style={
        {
          // fallback to nice default
          "--spot-x": "72%",
          "--spot-y": "32%",
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(700px 480px at var(--spot-x) var(--spot-y), hsl(var(--primary) / 0.16), transparent 62%)",
        }}
      />
      {children}
    </div>
  );
}
