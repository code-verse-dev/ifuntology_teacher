import { GraduationCap } from "lucide-react";
import { marketingImageUrl } from "../../utils/marketingImageUrl";
import { aosData, aosStaggerDelay } from "../../utils/aosData";
import SectionHeader from "../SectionHeader";

const features = [
  {
    label: "Create",
    description: "Write & design amazing books.",
    iconClassName: "bg-gradient-to-br from-emerald-400 to-emerald-600",
  },
  {
    label: "Review",
    description: "Write & design amazing books.",
    iconClassName: "bg-gradient-to-br from-orange-400 to-orange-600",
  },
  {
    label: "Publish",
    description: "Write & design amazing books.",
    iconClassName: "bg-gradient-to-br from-red-400 to-red-600",
  },
  {
    label: "Earn",
    description: "Write & design amazing books.",
    iconClassName: "bg-gradient-to-br from-purple-400 to-purple-600",
  },
  {
    label: "Share",
    description: "Write & design amazing books.",
    iconClassName: "bg-gradient-to-br from-sky-400 to-blue-600",
  },
];

export default function WtrFeatureBar() {
  return (
    <section className="ifi-card relative overflow-visible p-6 sm:p-8">
      <img
        src={marketingImageUrl("wtr-2.png")}
        alt="Student writing in a notebook"
        className="wtr-float pointer-events-none absolute -top-10 left-4 z-20 w-24 select-none object-contain sm:-top-14 sm:w-32 md:w-36"
        draggable={false}
        {...aosData("fade-up", { delay: 200, duration: 760 })}
      />

      <SectionHeader
        eyebrow="How It Works"
        title="From Idea to Published Book"
        align="left"
        className="relative z-10 pt-8 sm:pt-4"
      />

      <div
        className="relative z-10 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4"
        {...aosData("fade-up", { delay: 260, duration: 780 })}
      >
        {features.map((feature, i) => (
          <div
            key={feature.label}
            className={`flex flex-col items-center rounded-xl border border-white/8 bg-white/[0.03] p-4 text-center ${
              i === features.length - 1 ? "col-span-2 sm:col-span-1" : ""
            }`}
            {...aosData("fade-up", {
              delay: aosStaggerDelay(i, 70) + 300,
              duration: 680,
            })}
          >
            <div
              className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md ${feature.iconClassName}`}
            >
              <GraduationCap className="h-5 w-5" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-semibold text-white">{feature.label}</h3>
            <p className="mt-1 text-xs leading-snug text-slate-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
