import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  useGetLessonByIdQuery,
  useGetQuizQuestionsQuery,
} from "@/redux/services/apiSlices/lessonSlice";
import { getAssessmentLabel } from "@/constants/quiz";

const optionClassName =
  "rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm";

export default function AssessmentPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lessonId = id ?? "";

  const { data: lessonData, isLoading: lessonLoading } = useGetLessonByIdQuery(
    { id: lessonId },
    { skip: !lessonId },
  );
  const { data: questionsData, isLoading: questionsLoading } = useGetQuizQuestionsQuery(
    { lessonId },
    { skip: !lessonId },
  );

  const lesson = lessonData?.data;
  const questions: any[] = questionsData?.data ?? [];
  const assessmentLabel = getAssessmentLabel(lesson?.type);

  const sortedQuestions = useMemo(
    () => [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [questions],
  );

  useEffect(() => {
    document.title = lesson?.title
      ? `${lesson.title} • ${assessmentLabel} Preview`
      : `${assessmentLabel} Preview • iFuntology Teacher`;
  }, [lesson?.title, assessmentLabel]);

  if (lessonLoading || questionsLoading) {
    return (
      <DashboardWithSidebarLayout>
        <div className="mx-auto w-full max-w-3xl py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardWithSidebarLayout>
    );
  }

  if (!lesson) {
    return (
      <DashboardWithSidebarLayout>
        <div className="mx-auto w-full max-w-3xl py-12 text-center text-muted-foreground">
          Assessment not found.
        </div>
      </DashboardWithSidebarLayout>
    );
  }

  return (
    <DashboardWithSidebarLayout>
      <div className="mx-auto w-full max-w-3xl space-y-6 pb-12">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="space-y-2">
          <Badge variant="secondary" className="rounded-full">
            {assessmentLabel} preview
          </Badge>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">
            Read-only preview of questions and options. Students attempt this from their learning portal.
          </p>
        </div>

        <div className="space-y-6">
          {sortedQuestions.map((q, idx) => (
            <Card key={q._id} className="p-6 rounded-2xl shadow-sm">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 font-semibold">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {q.points ?? 1} point{(q.points ?? 1) !== 1 ? "s" : ""} •{" "}
                    {String(q.type ?? "").replace("_", " ")}
                  </p>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                    {q.question}
                  </h3>

                  {q.type === "multiple_choice" && (
                    <div className="space-y-2">
                      {(q.options ?? []).map((opt: string) => (
                        <div key={opt} className={optionClassName}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === "true_false" && (
                    <div className="flex gap-3">
                      {["True", "False"].map((label) => (
                        <div
                          key={label}
                          className={`flex flex-1 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold`}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === "short_answer" && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm text-muted-foreground">
                      Short answer response
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardWithSidebarLayout>
  );
}
