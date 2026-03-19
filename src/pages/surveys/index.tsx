import * as React from "react";
import { useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, CheckCircle2, Loader2 } from "lucide-react";
import { useGetAvailableSurveysQuery } from "@/redux/services/apiSlices/surveySlice";
import { cn } from "@/lib/utils";

export default function SurveysList() {
  const navigate = useNavigate();
  const { data: surveysData, isLoading } = useGetAvailableSurveysQuery();
  const surveys: any[] = surveysData?.data ?? [];

  React.useEffect(() => {
    document.title = "Surveys • iFuntology Teacher";
  }, []);

  return (
    <DashboardWithSidebarLayout>
      <div className="mx-auto w-full max-w-4xl space-y-6 pb-12">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Surveys</h1>
        <p className="text-sm text-muted-foreground">
          Share your feedback and help us improve. Surveys can only be submitted once.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : surveys.length === 0 ? (
          <Card className="p-12 rounded-2xl text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              No surveys available
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Check back later for new surveys.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {surveys.map((survey: any) => {
              const isSubmitted = survey.isSubmitted === true;
              const responseId = survey.responseId;

              return (
                <Card
                  key={survey._id}
                  className={cn(
                    "p-6 rounded-2xl shadow-sm flex flex-col",
                    isSubmitted && "border-lime-200 dark:border-lime-800/50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                        isSubmitted
                          ? "bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {isSubmitted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <ClipboardList className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {survey.title}
                      </h3>
                      {survey.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {survey.description}
                        </p>
                      )}
                      {survey.type && (
                        <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                          {survey.type}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-5">
                    {isSubmitted ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-full font-semibold border-lime-400 text-lime-600 hover:bg-lime-50 dark:hover:bg-lime-900/20"
                        onClick={() =>
                          responseId && navigate(`/surveys/response/${responseId}`)
                        }
                        disabled={!responseId}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        View Response
                      </Button>
                    ) : (
                      <Button
                        className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                        onClick={() => navigate(`/surveys/${survey._id}`)}
                      >
                        Take Survey
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardWithSidebarLayout>
  );
}
