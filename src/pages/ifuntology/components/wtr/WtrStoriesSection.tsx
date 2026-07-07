import { marketingImageUrl } from "../../utils/marketingImageUrl";
import { aosData, aosStaggerDelay } from "../../utils/aosData";
import SectionHeader from "../SectionHeader";

const storyFeatures = [
  { label: "Discover", image: "wtr-6.png" },
  { label: "Build", image: "wtr-7.png" },
  { label: "Reviewing", image: "wtr-8.png" },
  { label: "Sharing", image: "wtr-9.png" },
];

export default function WtrStoriesSection() {
  return (
    <section className="ifi-card relative overflow-visible p-6 sm:p-8">
      <img
        src={marketingImageUrl("wtr-5.png")}
        alt=""
        aria-hidden
        className="wtr-drift pointer-events-none absolute left-4 top-4 z-10 w-20 select-none opacity-80 sm:w-24"
        draggable={false}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="relative z-10">
          <SectionHeader
            eyebrow="Stories"
            title="Bring Stories to Life"
            align="left"
          />
          <div className="ifi-prose -mt-2">
            <p>
              Not just another platform but built specifically for the future
              of educational commerce.
            </p>
            <p>
              Prepare kids for a high-tech world with AI-powered literacy.
              Students write unique stories and read them as leveled books
              forever—building skills, confidence, and a love of learning.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
            {storyFeatures.map((item, i) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3"
                {...aosData("zoom-in", {
                  delay: aosStaggerDelay(i, 64) + 160,
                  duration: 680,
                })}
              >
                <img
                  src={marketingImageUrl(item.image)}
                  alt=""
                  aria-hidden
                  className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11"
                  draggable={false}
                />
                <span className="text-sm font-semibold text-white">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative z-10 flex justify-center lg:justify-end"
          {...aosData("fade-left", { delay: 100, duration: 820 })}
        >
          <img
            src={marketingImageUrl("wtr-10.png")}
            alt="Character creator and open storybook on tablet"
            className="wtr-float w-full max-w-md select-none object-contain lg:max-w-lg"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
