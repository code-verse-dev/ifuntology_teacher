import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useBuilderPaths } from "@/book-builder/lib/builderPaths";
import {
  getDailyAssignmentCount,
  getDailyAssignmentImageUrl,
  getDailyAssignmentTitle,
  type DailyAssignmentVariant,
} from "@/constants/dailyAssignments";
import { cn } from "@/lib/utils";

type DailyAssignmentsGalleryPageProps = {
  variant: DailyAssignmentVariant;
};

export function DailyAssignmentsGalleryPage({
  variant,
}: DailyAssignmentsGalleryPageProps) {
  const { builderHref } = useBuilderPaths();
  const total = getDailyAssignmentCount(variant);
  const title = getDailyAssignmentTitle(variant);
  const [index, setIndex] = useState(1);

  const imageUrl = useMemo(
    () => getDailyAssignmentImageUrl(variant, index),
    [variant, index]
  );

  useEffect(() => {
    document.title = `${title} • iFuntology`;
  }, [title]);

  const goPrev = () => setIndex((current) => Math.max(1, current - 1));
  const goNext = () => setIndex((current) => Math.min(total, current + 1));

  return (
    <div className="daily-assignments-gallery flex h-full min-h-0 flex-1 flex-col bg-[#0b1220] text-white">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <Link
          to={builderHref}
          className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-300 transition-colors hover:bg-orange-500/20"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Builder
        </Link>

        <div className="text-center">
          <h1 className="text-base font-bold sm:text-lg">{title}</h1>
          <p className="text-xs text-white/60">
            Assignment {index} of {total}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-white/15 px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 disabled:opacity-40"
            onClick={goPrev}
            disabled={index <= 1}
          >
            Previous
          </button>
          <select
            className="h-10 rounded-full border border-white/15 bg-white/5 px-3 text-sm font-medium text-white outline-none"
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
            aria-label="Jump to assignment"
          >
            {Array.from({ length: total }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day} className="text-slate-900">
                Day {day}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-full border border-white/15 px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 disabled:opacity-40"
            onClick={goNext}
            disabled={index >= total}
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-6">
          <div className="flex h-full w-full items-center justify-center rounded-2xl border border-white/10 bg-black/20 p-4">
            <img
              key={imageUrl}
              src={imageUrl}
              alt={`${title} ${index}`}
              className="max-h-full max-w-full object-contain shadow-2xl"
              loading="lazy"
            />
          </div>
        </div>

        <aside
          className="flex h-full w-[min(100%,220px)] shrink-0 flex-col border-l border-white/10 bg-[#0f172a]/80 sm:w-[240px] md:w-[260px]"
          aria-label="Assignment thumbnails"
        >
          <div className="shrink-0 border-b border-white/10 px-3 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white/50">
              All assignments
            </p>
            <p className="mt-0.5 text-sm font-semibold text-white/90">
              {total} total
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 custom-scrollbar">
            <div className="flex flex-col gap-2">
              {Array.from({ length: total }, (_, i) => i + 1).map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setIndex(day)}
                  className={cn(
                    "group flex w-full items-center gap-2 overflow-hidden rounded-xl border p-1.5 text-left transition-all",
                    day === index
                      ? "border-lime-500 bg-lime-500/10 ring-1 ring-lime-500/40"
                      : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                  )}
                >
                  <img
                    src={getDailyAssignmentImageUrl(variant, day)}
                    alt={`${title} thumbnail ${day}`}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <span
                    className={cn(
                      "min-w-0 text-xs font-semibold",
                      day === index ? "text-lime-300" : "text-white/70"
                    )}
                  >
                    Day {day}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
