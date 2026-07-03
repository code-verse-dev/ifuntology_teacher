import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import {
  WTR_WEEKLY_ASSIGNMENTS,
  downloadWtrAssignmentPdf,
} from "@/constants/wtrWeeklyAssignments";
import WtrAssignmentPdfViewer from "./components/WtrAssignmentPdfViewer";

export default function WtrAssignmentPreviewPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const assignment = WTR_WEEKLY_ASSIGNMENTS.find(
    (a) => a.id === decodeURIComponent(assignmentId ?? ""),
  );

  useEffect(() => {
    document.title = assignment
      ? `${assignment.name} • iFuntology Teacher`
      : "Assignment Preview • iFuntology Teacher";
  }, [assignment]);

  if (!assignment) {
    return (
      <DashboardWithSidebarLayout>
        <section className="mx-auto w-full max-w-5xl space-y-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <Card className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Assignment not found.
          </Card>
        </section>
      </DashboardWithSidebarLayout>
    );
  }

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-5xl space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {assignment.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Preview assignment PDF in the flipbook viewer.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-full gap-2 font-bold"
            onClick={() =>
              downloadWtrAssignmentPdf(assignment.url, assignment.filename)
            }
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:p-6">
          <WtrAssignmentPdfViewer
            url={assignment.url}
            title={assignment.name}
            filename={assignment.filename}
          />
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
