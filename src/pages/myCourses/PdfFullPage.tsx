import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { useGetLessonByIdQuery } from "@/redux/services/apiSlices/lessonSlice";
import { UPLOADS_URL } from "@/constants/api";
import PdfFlipViewer from "./PdfFlipViewer";

export default function PdfFullPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viewerHeightCap, setViewerHeightCap] = React.useState(920);

  React.useEffect(() => {
    const updateHeightCap = () => {
      setViewerHeightCap(Math.max(520, window.innerHeight - 280));
    };

    updateHeightCap();
    window.addEventListener("resize", updateHeightCap);
    return () => window.removeEventListener("resize", updateHeightCap);
  }, []);

  const { data: lessonData, isLoading } = useGetLessonByIdQuery(
    { id: id ?? "" },
    { skip: !id }
  );
  const lesson = lessonData?.data;
  const canDownload = lesson?.allowPdfDownload ?? true;

  React.useEffect(() => {
    document.title = lesson?.title
      ? `${lesson.title} — PDF • iFuntology Teacher`
      : "PDF Viewer • iFuntology Teacher";
  }, [lesson?.title]);

  const handleDownload = async () => {
    if (!lesson?.fileUrl) return;
    try {
      const res = await fetch(UPLOADS_URL + lesson.fileUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = lesson.title ?? lesson.fileUrl.split("/").pop() ?? "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(UPLOADS_URL + lesson.fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <DashboardWithSidebarLayout>
      <div className="w-full space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </button>

          {lesson?.fileUrl && canDownload && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full gap-1.5"
              onClick={handleDownload}
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          )}
        </div>

        {lesson?.title && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>
            )}
          </div>
        )}

        {isLoading ? (
          <Card className="rounded-2xl h-64 flex items-center justify-center">
            <p className="text-sm text-muted-foreground animate-pulse">Loading PDF…</p>
          </Card>
        ) : !lesson?.fileUrl ? (
          <Card className="rounded-2xl h-64 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No PDF file attached to this lesson.</p>
          </Card>
        ) : (
          <Card className="rounded-2xl overflow-visible border-none shadow-sm">
            <PdfFlipViewer
              fileUrl={UPLOADS_URL + lesson.fileUrl}
              title={lesson.title}
              onDownload={canDownload ? handleDownload : undefined}
              onFullWidth={() => navigate(`/my-courses/pdf/${id}/fullscreen`)}
              maxPageWidth={1200}
              viewerHeightCap={viewerHeightCap}
            />
          </Card>
        )}
      </div>
    </DashboardWithSidebarLayout>
  );
}
