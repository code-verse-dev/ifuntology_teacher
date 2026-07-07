import { marketingImageUrl } from "../../utils/marketingImageUrl";
import { aosData } from "../../utils/aosData";
import type { CourseData } from "../../constants/courses";

interface CourseHighlightProps {
  course: CourseData;
}

export default function CourseHighlight({ course }: CourseHighlightProps) {
  return (
    <section className="ifi-highlight-card" style={{ background: course.gradient }}>
      <div className="relative flex flex-col sm:flex-row sm:items-stretch">
        <div className="relative z-10 flex flex-[3] flex-col justify-center p-6 sm:p-8 lg:p-10">
          <span className="ifi-eyebrow w-fit border-white/25 bg-white/10 text-white">
            {course.eyebrow}
          </span>
          <h2 className="font-banner mt-4 text-2xl font-bold text-white sm:text-3xl">
            {course.title}
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
            {course.shortDescription}
          </p>
        </div>

        <div
          className="relative z-10 flex min-h-[160px] flex-[2] items-end justify-center sm:min-h-[200px] sm:justify-end"
          {...aosData("fade-up", { duration: 780 })}
        >
          <div className="ifi-image-frame m-4 max-w-[280px] border-white/20 bg-black/20 sm:m-6 sm:max-w-none sm:border-0 sm:bg-transparent sm:shadow-none">
            <img
              src={marketingImageUrl(course.image)}
              alt={course.title}
              className="max-h-[200px] w-auto object-contain object-bottom sm:max-h-[240px] sm:translate-x-2 sm:translate-y-2 lg:translate-x-4 lg:translate-y-4"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
