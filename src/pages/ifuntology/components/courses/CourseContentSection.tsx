import { Check } from "lucide-react";
import { marketingImageUrl } from "../../utils/marketingImageUrl";
import { aosData } from "../../utils/aosData";

interface CourseContentSectionProps {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  index: number;
  image?: string;
}

export default function CourseContentSection({
  title,
  paragraphs,
  bullets,
  index,
  image,
}: CourseContentSectionProps) {
  const imageOnLeft = index % 2 === 1;
  const sectionNum = String(index + 1).padStart(2, "0");

  const textContent = (
    <div>
      <span className="ifi-section-index">{sectionNum}</span>
      <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>

      <div className="ifi-prose mt-4">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}

        {bullets && bullets.length > 0 && (
          <ul className="ifi-bullet-list">
            {bullets.map((item) => (
              <li key={item} className="ifi-bullet-item">
                <span className="ifi-bullet-icon">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <section className="ifi-section-card" {...aosData("fade-up", { delay: index * 40 })}>
      {image ? (
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-10">
          <div className={imageOnLeft ? "lg:order-2" : undefined}>
            {textContent}
          </div>
          <div className={imageOnLeft ? "lg:order-1" : undefined}>
            <div className="ifi-image-frame aspect-[4/3] lg:aspect-auto lg:min-h-[280px]">
              <img
                src={marketingImageUrl(image)}
                alt={title}
                className="h-full min-h-[220px] object-cover"
                draggable={false}
              />
            </div>
          </div>
        </div>
      ) : (
        textContent
      )}
    </section>
  );
}
