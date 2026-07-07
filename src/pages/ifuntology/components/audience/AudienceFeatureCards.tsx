import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { marketingImageUrl } from "../../utils/marketingImageUrl";
import { aosData, aosStaggerDelay } from "../../utils/aosData";
import SectionHeader from "../SectionHeader";

export interface AudienceCardItem {
  title: string;
  image: string;
  imageAlt: string;
  features: string[];
  borderClassName: string;
  titleClassName: string;
  checkBgClassName: string;
  checkIconClassName: string;
  buttonClassName: string;
  characterPosition: "left" | "right";
  aosAnimation?: "fade-right" | "fade-left";
  ctaTo?: string;
  ctaLabel?: string;
}

interface AudienceFeatureCardsProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  cards: AudienceCardItem[];
}

export default function AudienceFeatureCards({
  eyebrow,
  title,
  description,
  cards,
}: AudienceFeatureCardsProps) {
  return (
    <section className="ifi-card p-6 sm:p-8">
      {(eyebrow || title || description) && (
        <SectionHeader
          eyebrow={eyebrow}
          title={title ?? ""}
          description={description}
        />
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {cards.map((card, i) => {
          const isLeft = card.characterPosition === "left";

          return (
            <article
              key={card.title}
              className={`ifi-audience-card border ${card.borderClassName}`}
              {...aosData("fade-up", {
                delay: aosStaggerDelay(i, 80),
                duration: 780,
              })}
            >
              <img
                src={marketingImageUrl(card.image)}
                alt={card.imageAlt}
                className={`pointer-events-none absolute bottom-0 z-10 h-36 w-auto select-none object-contain sm:h-44 md:h-48 ${
                  isLeft ? "-left-2 sm:-left-4" : "-right-2 sm:-right-4"
                }`}
                draggable={false}
              />

              <div
                className={`relative z-0 flex h-full flex-col p-5 sm:p-6 ${
                  isLeft
                    ? "sm:pl-[42%] md:pl-[44%]"
                    : "sm:pr-[42%] md:pr-[44%]"
                }`}
              >
                <h3
                  className={`text-lg font-bold sm:text-xl ${card.titleClassName}`}
                >
                  {card.title}
                </h3>
                <ul className="mt-4 flex flex-1 flex-col gap-2.5">
                  {card.features.map((item) => (
                    <li key={item} className="ifi-bullet-item text-sm">
                      <span className={`ifi-bullet-icon ${card.checkBgClassName}`}>
                        <Check
                          className={`h-3 w-3 ${card.checkIconClassName}`}
                          strokeWidth={3}
                        />
                      </span>
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
                {card.ctaLabel ? (
                  <div className="mt-5">
                    <Link
                      to={card.ctaTo ?? "/subscribe-to-lms"}
                      className={`${card.buttonClassName} w-full sm:w-auto`}
                    >
                      {card.ctaLabel}
                    </Link>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
