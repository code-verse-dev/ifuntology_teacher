import { marketingImageUrl } from "../../utils/marketingImageUrl";
import { aosData } from "../../utils/aosData";

export default function WtrCta() {
  return (
    <section className="ifi-cta-card relative overflow-visible">
      <img
        src={marketingImageUrl("wtr-15.png")}
        alt="Pop-up storybook with castle and student"
        className="wtr-float pointer-events-none absolute -bottom-6 left-4 z-20 hidden w-40 select-none object-contain sm:block md:w-48 lg:w-56"
        draggable={false}
        {...aosData("fade-right", { delay: 80, duration: 760 })}
      />

      <img
        src={marketingImageUrl("wtr-16.png")}
        alt=""
        aria-hidden
        className="wtr-drift pointer-events-none absolute right-4 top-4 z-10 w-16 select-none opacity-80 sm:w-20"
        draggable={false}
      />

      <div className="relative z-10 px-2 py-4 sm:py-6 lg:pl-48">
        <h2
          className="text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl"
          {...aosData("fade-down", { delay: 120, duration: 720 })}
        >
          Ready To Inspire The Next
          <br />
          <span className="text-orange-400">Generation Of Authors?</span>
        </h2>
      </div>
    </section>
  );
}
