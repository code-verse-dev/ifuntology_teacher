import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PdfFlipViewer from "@/pages/myCourses/PdfFlipViewer";
import { downloadWtrAssignmentPdf } from "@/constants/wtrWeeklyAssignments";

type Props = {
  url: string;
  title: string;
  filename: string;
};

export default function WtrAssignmentPdfViewer({ url, title, filename }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const loadPdf = async () => {
      setIsLoading(true);
      setLoadError(false);
      setBlobUrl(null);

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load PDF");

        const blob = await response.blob();
        if (blob.type.includes("html")) throw new Error("Invalid PDF response");

        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setBlobUrl(objectUrl);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadPdf();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (isLoading) {
    return (
      <Card className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading PDF…
        </div>
      </Card>
    );
  }

  if (loadError || !blobUrl) {
    return (
      <Card className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Could not load this PDF in the flipbook viewer.
        </p>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
        >
          Open PDF
        </Button>
      </Card>
    );
  }

  return (
    <PdfFlipViewer
      fileUrl={blobUrl}
      title={title}
      onDownload={() => downloadWtrAssignmentPdf(url, filename)}
    />
  );
}
