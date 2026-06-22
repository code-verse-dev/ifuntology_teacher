import { Navigate } from "react-router-dom";
import { getCourseBySlug } from "../constants/courses";
import CoursePageLayout from "../components/courses/CoursePageLayout";
import IfuntologyPageLayout from "../IfuntologyPageLayout";

export function createIfuntologyCoursePage(slug: string) {
  return function IfuntologyCourseMarketingPage() {
    const course = getCourseBySlug(slug);

    if (!course) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <IfuntologyPageLayout title={course.title}>
        <CoursePageLayout course={course} />
      </IfuntologyPageLayout>
    );
  };
}
