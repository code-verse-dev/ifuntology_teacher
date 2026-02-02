import { GraduationCap } from "lucide-react";
import { ImageUrl } from "@/utils/Functions";

export default function IfuntologyMark({ compact = false }: { compact?: boolean }) {
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
