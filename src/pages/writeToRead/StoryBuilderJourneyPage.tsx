import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { STORY_BUILDER_JOURNEY_PDF } from "@/constants/api";

const OFFICE_EMBED_URL = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
  STORY_BUILDER_JOURNEY_PDF,
)}`;

const DOWNLOAD_FILENAME = "StoryBuilderJourney.docx";

async function downloadStoryBuilderJourney() {
  try {
    const response = await fetch(STORY_BUILDER_JOURNEY_PDF);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = DOWNLOAD_FILENAME;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = STORY_BUILDER_JOURNEY_PDF;
    anchor.download = DOWNLOAD_FILENAME;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}

export default function StoryBuilderJourneyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Story Builder Journey • iFuntology Teacher";
  }, []);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
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
              Story Builder Journey
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Preview the Word guide here. Use Download if you want a copy.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-full gap-2 font-bold"
            onClick={() => void downloadStoryBuilderJourney()}
          >
            <Download className="h-4 w-4" />
            Download Word document
          </Button>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <iframe
            title="Story Builder Journey"
            src={OFFICE_EMBED_URL}
            className="h-[min(78vh,900px)] w-full min-h-[70vh] border-0 bg-white"
          />
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
