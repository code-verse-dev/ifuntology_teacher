import { Link } from "react-router-dom";
import type { CourseData } from "../../constants/courses";
import InnerBanner from "../InnerBanner";
import CourseContentSection from "./CourseContentSection";
import CourseHighlight from "./CourseHighlight";
import { aosData } from "../../utils/aosData";

interface CoursePageLayoutProps {
  course: CourseData;
}

export default function CoursePageLayout({ course }: CoursePageLayoutProps) {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <InnerBanner
        eyebrow={course.eyebrow}
        title={course.fullTitle}
        description={course.bannerDescription}
      />

      <CourseHighlight course={course} />

      {course.sections.map((section, index) => (
        <CourseContentSection
          key={section.title}
          title={section.title}
          paragraphs={section.paragraphs}
          bullets={section.bullets}
          image={section.image}
          index={index}
        />
      ))}

      <section className="ifi-cta-card" {...aosData("fade-up", { duration: 760 })}>
        <h2 className="text-xl font-bold text-white sm:text-2xl">{course.ctaTitle}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
          {course.ctaParagraph}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="https://erp.ifuntology.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="green-button min-w-[140px]"
          >
            Contact Us
          </a>
          <Link to="/subscribe-to-lms" className="orange-button min-w-[140px]">
            Explore LMS
          </Link>
        </div>
      </section>
    </div>
  );
}
