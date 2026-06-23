import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { useGetLessonByIdQuery } from "@/redux/services/apiSlices/lessonSlice";
import { UPLOADS_URL } from "@/constants/api";
import PdfFlipViewer from "./PdfFlipViewer";

export default function PdfFullscreenPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viewerHeightCap, setViewerHeightCap] = React.useState(
    () => Math.max(520, window.innerHeight - 56)
  );

  React.useEffect(() => {
    const updateHeightCap = () => {
      setViewerHeightCap(Math.max(520, window.innerHeight - 56));
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
      ? `${lesson.title} — Full View • iFuntology Teacher`
      : "PDF Full View • iFuntology Teacher";
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

  const exitFullscreen = () => {
    if (id) {
      navigate(`/my-courses/pdf/${id}`);
      return;
    }
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 py-2.5">
        <button
          type="button"
          onClick={exitFullscreen}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit full view
        </button>

        <p className="min-w-0 flex-1 truncate text-center text-sm font-medium text-foreground">
          {lesson?.title ?? "PDF document"}
        </p>

        <div className="flex items-center gap-2">
          {lesson?.fileUrl && canDownload ? (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full gap-1.5"
              onClick={handleDownload}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          ) : (
            <span className="w-[88px]" aria-hidden />
          )}
        </div>
      </header>

      <main className="flex min-h-0 flex-1 w-full flex-col">
        {isLoading ? (
          <Card className="m-4 flex flex-1 items-center justify-center rounded-2xl border-none shadow-sm">
            <p className="text-sm text-muted-foreground animate-pulse">Loading PDF…</p>
          </Card>
        ) : !lesson?.fileUrl ? (
          <Card className="m-4 flex flex-1 items-center justify-center rounded-2xl border-none shadow-sm">
            <p className="text-sm text-muted-foreground">No PDF file attached to this lesson.</p>
          </Card>
        ) : (
          <div className="flex min-h-0 flex-1 w-full flex-col">
            <PdfFlipViewer
              fileUrl={UPLOADS_URL + lesson.fileUrl}
              title={lesson.title}
              onDownload={canDownload ? handleDownload : undefined}
              maxPageWidth={2400}
              viewerHeightCap={viewerHeightCap}
              className="min-h-0 flex-1"
            />
          </div>
        )}
      </main>
    </div>
  );
}
