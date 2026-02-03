import { GraduationCap } from "lucide-react";
import { ImageUrl } from "@/utils/Functions";

type IfuntologyMarkProps = {
  compact?: boolean;
  /** Show only the logo image, no icon next to it */
  logoOnly?: boolean;
  /** Larger logo for hero/auth sections */
  size?: "default" | "medium" | "large";
};

export default function IfuntologyMark({ compact = false, logoOnly = false, size = "default" }: IfuntologyMarkProps) {
  const logoHeight =
    size === "large" ? "h-14 sm:h-16" : size === "medium" ? "h-10" : "h-8";

  if (logoOnly) {
    return (
      <div className="leading-tight">
        <img src={ImageUrl("logo.png")} alt="iFuntology" className={`${logoHeight} w-auto object-contain`} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60 ring-1 ring-border/60">
        <GraduationCap className="h-5 w-5 text-primary" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <img src={ImageUrl("logo.png")} alt="iFuntology" className="h-8 w-auto object-contain" />
        </div>
      )}
    </div>
  );
}
