import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import {
  useGetAvailableSurveysQuery,
  useGetSurveryQuestionsQuery,
  useSubmitSurveyAnswersMutation,
} from "@/redux/services/apiSlices/surveySlice";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SurveyAttempt() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const surveyId = id ?? "";

  const { data: surveysData } = useGetAvailableSurveysQuery();
  const surveys: any[] = surveysData?.data ?? [];
  const survey = surveys.find((s: any) => s._id === surveyId);

  const { data: questionsData, isLoading: questionsLoading } = useGetSurveryQuestionsQuery(
    { surveyId },
    { skip: !surveyId }
  );
  const [submitSurveyAnswers, { isLoading: isSubmitting }] = useSubmitSurveyAnswersMutation();

  const questions: any[] = questionsData?.data ?? [];
  const sortedQuestions = React.useMemo(
    () => [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [questions]
  );

  const [answers, setAnswers] = React.useState<Record<string, string>>({});

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const requiredMissing = sortedQuestions.filter(
      (q) => q.required && (answers[q._id] === undefined || String(answers[q._id] ?? "").trim() === "")
    );
    if (requiredMissing.length > 0) {
      toast.error("Please answer all required questions.");
      return;
    }

    const answersPayload = sortedQuestions.map((q) => ({
      question: q._id,
      answer: String(answers[q._id] ?? ""),
    }));

    try {
      const res: any = await submitSurveyAnswers({ surveyId, answers: answersPayload }).unwrap();
      const responseId = res?.data?.responseId ?? res?.data?._id;
      if (res?.status && responseId) {
        toast.success(res?.message ?? "Survey submitted successfully");
        navigate(`/surveys/response/${responseId}`, { replace: true });
      } else {
        toast.success("Survey submitted successfully");
        navigate("/surveys", { replace: true });
      }
    } catch (error: any) {
      toast.error(error?.data?.message ?? error?.message ?? "Failed to submit survey");
    }
  };

  const answeredCount = sortedQuestions.filter((q) => {
    const v = answers[q._id];
    return v !== undefined && v !== "" && v !== null;
  }).length;

  React.useEffect(() => {
    document.title = survey?.title ? `${survey.title} • Survey` : "Survey • iFuntology Student";
  }, [survey?.title]);

  if (survey?.isSubmitted) {
    return (
      <DashboardWithSidebarLayout>
        <div className="mx-auto w-full max-w-3xl py-12 text-center">
          <p className="text-muted-foreground mb-4">You have already submitted this survey.</p>
          <Button variant="outline" onClick={() => navigate("/surveys")}>
            Back to Surveys
          </Button>
        </div>
      </DashboardWithSidebarLayout>
    );
  }

  if (questionsLoading) {
    return (
      <DashboardWithSidebarLayout>
        <div className="mx-auto w-full max-w-3xl py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardWithSidebarLayout>
    );
  }

  if (!survey) {
    return (
      <DashboardWithSidebarLayout>
        <div className="mx-auto w-full max-w-3xl py-12 text-center text-muted-foreground">
          Survey not found.
        </div>
      </DashboardWithSidebarLayout>
    );
  }

  return (
    <DashboardWithSidebarLayout>
      <div className="mx-auto w-full max-w-3xl space-y-6 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{survey.title}</h1>
          {survey.description && (
            <p className="mt-2 text-sm text-muted-foreground">{survey.description}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {answeredCount} of {sortedQuestions.length} answered
          </p>
        </div>

        <div className="space-y-6">
          {sortedQuestions.map((q, idx) => (
            <Card key={q._id} className="p-6 rounded-2xl shadow-sm">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-semibold">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                    {q.question}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>

                  {q.type === "yes_no" && (
                    <RadioGroup
                      value={answers[q._id] ?? ""}
                      onValueChange={(v) => setAnswer(q._id, v)}
                      className="flex gap-4"
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-4 flex-1 cursor-pointer transition-colors",
                          answers[q._id] === "yes"
                            ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        )}
                      >
                        <RadioGroupItem value="yes" id={`${q._id}-yes`} />
                        <Label htmlFor={`${q._id}-yes`} className="cursor-pointer font-semibold">
                          Yes
                        </Label>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-4 flex-1 cursor-pointer transition-colors",
                          answers[q._id] === "no"
                            ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        )}
                      >
                        <RadioGroupItem value="no" id={`${q._id}-no`} />
                        <Label htmlFor={`${q._id}-no`} className="cursor-pointer font-semibold">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  )}

                  {q.type === "multiple_choice" && (
                    <RadioGroup
                      value={answers[q._id] ?? ""}
                      onValueChange={(v) => setAnswer(q._id, v)}
                      className="space-y-3"
                    >
                      {(q.options ?? []).map((opt: string) => (
                        <div
                          key={opt}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                            answers[q._id] === opt
                              ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                          )}
                        >
                          <RadioGroupItem value={opt} id={`${q._id}-${opt}`} />
                          <Label htmlFor={`${q._id}-${opt}`} className="cursor-pointer flex-1">
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {q.type === "rating" && (
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setAnswer(q._id, String(n))}
                          className={cn(
                            "h-10 w-10 rounded-xl border font-semibold transition-colors",
                            answers[q._id] === String(n)
                              ? "border-amber-400 bg-amber-500 text-white"
                              : "border-slate-200 dark:border-slate-700 hover:border-amber-300"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === "text" && (
                    <Input
                      placeholder="Type your answer..."
                      value={answers[q._id] ?? ""}
                      onChange={(e) => setAnswer(q._id, e.target.value)}
                      className="rounded-xl"
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          size="lg"
          className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white gap-2 font-semibold py-6"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          {isSubmitting ? "Submitting…" : "Submit Survey"}
        </Button>
      </div>
    </DashboardWithSidebarLayout>
  );
}
