import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Eye, FileText, Loader2 } from "lucide-react";
import { useGetCourseExamsForTeacherQuery } from "@/redux/services/apiSlices/lessonSlice";
import { UPLOADS_URL } from "@/constants/api";
import PdfFlipViewer from "./PdfFlipViewer";

export default function CourseExams() {
  const { courseType } = useParams<{ courseType: string }>();
  const navigate = useNavigate();
  const encodedCourseType = courseType ?? "";

  const { data, isLoading, error } = useGetCourseExamsForTeacherQuery(
    { courseType: encodedCourseType },
    { skip: !encodedCourseType },
  );

  const payload = data?.data;
  const exams: any[] = payload?.exams ?? [];
  const exam = exams[0] ?? null;

  useEffect(() => {
    document.title = courseType
      ? `${courseType} Exam • iFuntology Teacher`
      : "Course Exam • iFuntology Teacher";
  }, [courseType]);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-5xl space-y-6">
        <button
          type="button"
          onClick={() => navigate("/my-courses")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Courses
        </button>

        <div>
          <h1 className="text-2xl font-extrabold">
            {courseType} — Exam
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review the exam PDF and preview exam questions. Teachers cannot attempt exams.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && error && (
          <Card className="p-10 text-center text-sm text-muted-foreground rounded-2xl">
            Unable to load the exam for this course.
          </Card>
        )}

        {!isLoading && !error && !exam && (
          <Card className="p-10 text-center text-sm text-muted-foreground rounded-2xl border border-dashed">
            No exam is available for this course yet.
          </Card>
        )}

        {!isLoading && exam && (
          <>
            <Card className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-foreground">{exam.title}</h2>
                {exam.moduleTitle && (
                  <p className="text-sm text-muted-foreground">{exam.moduleTitle}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {exam.noOfQuestions ?? 0} question
                  {(exam.noOfQuestions ?? 0) === 1 ? "" : "s"}
                </p>
              </div>
            </Card>

            {exam.fileUrl && (exam.allowPdfPreview ?? true) ? (
              <Card className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="h-4 w-4 text-amber-600" />
                  Exam material
                </div>
                <PdfFlipViewer
                  fileUrl={`${UPLOADS_URL}${exam.fileUrl}`}
                  title={exam.title}
                  onFullWidth={() => navigate(`/my-courses/pdf/${exam._id}`)}
                />
              </Card>
            ) : (
              <Card className="p-8 text-center text-sm text-muted-foreground rounded-2xl border border-dashed">
                Exam PDF is not available yet. You can still preview the exam questions below.
              </Card>
            )}

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              {exam.fileUrl && (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full font-semibold px-8 gap-2"
                  onClick={() => navigate(`/my-courses/pdf/${exam._id}`)}
                >
                  <FileText className="h-4 w-4" />
                  View PDF
                </Button>
              )}
              <Button
                size="lg"
                className="rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 gap-2"
                onClick={() => navigate(`/my-courses/assessment/${exam._id}/preview`)}
              >
                <Eye className="h-4 w-4" />
                View Exam
              </Button>
            </div>
          </>
        )}
      </section>
    </DashboardWithSidebarLayout>
  );
}
