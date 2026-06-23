import { useCallback, useEffect, useRef, useState } from "react";
import { marketingImageUrl } from "../../utils/marketingImageUrl";
import { aosData, aosStaggerDelay } from "../../utils/aosData";
import SectionHeader from "../SectionHeader";

export type WtrStatItem = {
  label: string;
  image: string;
  end: number;
  suffix: string;
};

const defaultStats: WtrStatItem[] = [
  { end: 10, suffix: "K+", label: "Books Created", image: "wtr-11.png" },
  { end: 5, suffix: "K+", label: "Young Authors", image: "wtr-12.png" },
  { end: 2, suffix: "K+", label: "Books Printed", image: "wtr-13.png" },
  { end: 98, suffix: "%", label: "Kids Love It", image: "wtr-14.png" },
];

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

interface WtrStatsBarProps {
  stats?: WtrStatItem[];
}

export default function WtrStatsBar({ stats = defaultStats }: WtrStatsBarProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const hasAnimated = useRef(false);
  const [values, setValues] = useState(() => stats.map(() => 0));

  const runAnimation = useCallback(() => {
    const durationMs = 1600;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(t);

      setValues(stats.map((s) => Math.round(s.end * eased)));

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        setValues(stats.map((s) => s.end));
      }
    };

    requestAnimationFrame(tick);
  }, [stats]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            runAnimation();
            obs.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [runAnimation]);

  return (
    <section className="ifi-stat-card" ref={cardRef} {...aosData("zoom-in", { duration: 760 })}>
      <SectionHeader eyebrow="Impact" title="By The Numbers" />

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="ifi-stat-item"
            {...aosData("fade-up", {
              delay: aosStaggerDelay(i, 80),
              duration: 680,
            })}
          >
            <img
              src={marketingImageUrl(stat.image)}
              alt=""
              aria-hidden
              className="h-12 w-12 object-contain sm:h-14 sm:w-14"
              draggable={false}
            />
            <div className="text-2xl font-bold tabular-nums text-white sm:text-3xl">
              {values[i]}
              {stat.suffix}
            </div>
            <div className="text-center text-xs text-slate-400 sm:text-sm">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
