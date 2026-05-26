import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useGetSurveyResponseByIdQuery } from "@/redux/services/apiSlices/surveySlice";
import { cn } from "@/lib/utils";

export default function SurveyResponseView() {
  const { responseId } = useParams<{ responseId: string }>();
  const navigate = useNavigate();

  const { data: responseData, isLoading } = useGetSurveyResponseByIdQuery(
    { responseId: responseId ?? "" },
    { skip: !responseId }
  );

  const response = responseData?.data;

  React.useEffect(() => {
    document.title = "Survey Response • iFuntology User";
  }, []);

  if (isLoading) {
    return (
      <DashboardWithSidebarLayout>
        <div className="mx-auto w-full max-w-3xl py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardWithSidebarLayout>
    );
  }

  if (!response) {
    return (
      <DashboardWithSidebarLayout>
        <div className="mx-auto w-full max-w-3xl py-12 text-center text-muted-foreground">
          Response not found.
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Survey Response
          </h1>
          <Badge className="w-fit text-sm font-semibold bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400">
            <CheckCircle2 className="mr-1.5 h-4 w-4 inline" />
            Submitted
          </Badge>
        </div>

        {response.createdAt && (
          <p className="text-sm text-muted-foreground">
            Submitted on{" "}
            {new Date(response.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Your Answers
          </h2>
          {(response.answers ?? []).map((item: any, idx: number) => {
            const q = item.question ?? item;
            const qText = typeof q === "string" ? q : q.question;
            const qType = typeof q === "object" ? q.type : "text";
            const ans = item.answer;

            return (
              <Card key={item._id ?? idx} className="p-5 rounded-2xl shadow-sm">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-medium">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1 capitalize">
                      {qType?.replace("_", " ")}
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                      {qText}
                    </p>
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {ans === true ? "True" : ans === false ? "False" : String(ans ?? "—")}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Button
          variant="outline"
          className="w-full rounded-full font-semibold"
          onClick={() => navigate("/surveys")}
        >
          Back to Surveys
        </Button>
      </div>
    </DashboardWithSidebarLayout>
  );
}
