import { useEffect, useRef } from "react";
import { HEADER_BG_VIDEO_URL } from "../constants/media";
import { aosData } from "../utils/aosData";

interface InnerBannerProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export default function InnerBanner({
  eyebrow,
  title,
  description,
  className = "",
}: InnerBannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section className={`ifi-hero-card ${className}`}>
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full min-h-[220px] w-full object-cover sm:min-h-[260px]"
          {...aosData("fade-in", { duration: 1000 })}
        >
          <source src={HEADER_BG_VIDEO_URL} type="video/mp4" />
        </video>
      </div>

      <div className="ifi-hero-content px-6 py-10 text-center sm:px-10 sm:py-14">
        {eyebrow && (
          <span className="ifi-eyebrow" {...aosData("fade-right", { duration: 680 })}>
            {eyebrow}
          </span>
        )}
        <h1
          className="font-banner mt-4 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[2.125rem]"
          {...aosData("zoom-in-up", { delay: 80, duration: 860 })}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base"
            {...aosData("slide-up", { delay: 140, duration: 720 })}
          >
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
