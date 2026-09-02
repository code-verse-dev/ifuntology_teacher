import { FileDown, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const GENERIC_ERROR =
  "We couldn't generate a salon preview. Please try again.";
const QUOTA_ERROR =
  "Preview generation is temporarily unavailable, please try again later";

type Props = {
  generating: boolean;
  imageSrc: string | null;
  errorCode: "quota" | "generation_failed" | null;
  errorMessage: string | null;
  disabledReason?: string | null;
  onGenerate: () => void;
};

async function downloadPreviewImage(imageSrc: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `salon-preview-${stamp}.png`;
  try {
    const response = await fetch(imageSrc);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = imageSrc;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}

export default function SalonPreviewCard({
  generating,
  imageSrc,
  errorCode,
  errorMessage,
  disabledReason,
  onGenerate,
}: Props) {
  const displayError =
    errorCode === "quota"
      ? QUOTA_ERROR
      : errorMessage || (errorCode ? GENERIC_ERROR : null);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Salon preview</p>
          <p className="text-[11px] font-medium text-white/60">
            AI rendering of the furniture and equipment you selected
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            disabled={generating || Boolean(disabledReason)}
            className="gap-2 rounded-xl border-0 bg-gradient-to-r from-violet-500 to-indigo-500 font-semibold text-white hover:from-violet-600 hover:to-indigo-600"
            onClick={onGenerate}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? "Generating…" : "Generate Salon Preview"}
          </Button>
          {imageSrc && !generating ? (
            <Button
              type="button"
              variant="outline"
              className="gap-2 rounded-xl border-white/20 bg-white/5 font-semibold text-white hover:bg-white/10 hover:text-white"
              onClick={() => void downloadPreviewImage(imageSrc)}
            >
              <FileDown className="h-4 w-4" />
              Download Image
            </Button>
          ) : null}
        </div>
      </div>

      {disabledReason && !generating ? (
        <p className="text-[11px] font-medium text-white/55">{disabledReason}</p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        {generating ? (
          <div className="relative aspect-square w-full max-w-xl mx-auto bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="absolute inset-0 animate-pulse bg-white/10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-fuchsia-300" />
              <p className="text-xs font-medium text-white/70">
                Generating salon preview…
              </p>
            </div>
          </div>
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt="AI-generated salon concept preview"
            className="mx-auto block h-auto w-full max-w-xl object-contain"
          />
        ) : (
          <div className="flex aspect-square w-full max-w-xl mx-auto items-center justify-center px-6 text-center">
            <p className="text-xs font-medium text-white/50">
              Your generated salon rendering will appear here.
            </p>
          </div>
        )}
      </div>

      {imageSrc && !generating ? (
        <p className="text-center text-[11px] font-medium text-white/55">
          AI-generated concept preview — actual layout may vary.
        </p>
      ) : null}

      {displayError && !generating ? (
        <p className="text-center text-xs font-medium text-rose-300">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}
