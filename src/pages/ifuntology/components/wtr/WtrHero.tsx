import { marketingImageUrl } from "../../utils/marketingImageUrl";
import { aosData } from "../../utils/aosData";

export default function WtrHero() {
  return (
    <section className="ifi-hero-card overflow-visible">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, #040C15 0%, #164A82 45%, #040C15 100%)",
        }}
      />

      <div className="ifi-hero-content grid gap-6 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-2 lg:items-center lg:gap-8">
        <div className="text-center lg:text-left">
          <span className="ifi-eyebrow">Write to Read</span>
          <h1
            className="font-banner mt-4 text-[1.75rem] font-bold leading-[1.15] text-white min-[400px]:text-[2rem] sm:text-4xl lg:text-[2.75rem]"
            {...aosData("fade-down", { duration: 900 })}
          >
            Write Today
            <br />
            <span className="text-orange-400">Read Forever.</span>
          </h1>
          <p
            className="mx-auto mt-4 max-w-prose text-sm leading-relaxed text-slate-300 sm:text-base lg:mx-0"
            {...aosData("slide-up", { delay: 100, duration: 720 })}
          >
            Prepare Kids For A High-Tech World With AI-Powered Literacy.
            Students Write Unique Stories And Read Them As Leveled Books
            Forever—Building Skills, Confidence, And A Love Of Learning.
          </p>
        </div>

        <div
          className="flex items-center justify-center lg:justify-end"
          {...aosData("zoom-in-up", { delay: 120, duration: 880 })}
        >
          <img
            src={marketingImageUrl("wtr-1.png")}
            alt="Write to Read publishing dashboard on laptop"
            className="wtr-float w-full max-w-md select-none object-contain lg:max-w-lg"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
