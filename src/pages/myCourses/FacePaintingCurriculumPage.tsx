import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import {
  FACE_PAINTING_CURRICULUM_FILENAME,
  FACE_PAINTING_CURRICULUM_PDF,
} from "@/constants/api";
import PdfFlipViewer from "./PdfFlipViewer";

async function downloadFacePaintingCurriculum() {
  try {
    const response = await fetch(FACE_PAINTING_CURRICULUM_PDF);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = FACE_PAINTING_CURRICULUM_FILENAME;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(FACE_PAINTING_CURRICULUM_PDF, "_blank", "noopener,noreferrer");
  }
}

export default function FacePaintingCurriculumPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Face Painting Curriculum • iFuntology Teacher";
  }, []);

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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Face Painting Curriculum
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Preview the workbook in the flipbook viewer.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-full gap-2 font-bold"
            onClick={() => void downloadFacePaintingCurriculum()}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:p-6">
          <PdfFlipViewer
            fileUrl={FACE_PAINTING_CURRICULUM_PDF}
            title="Face Painting Curriculum"
            onDownload={() => void downloadFacePaintingCurriculum()}
          />
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
