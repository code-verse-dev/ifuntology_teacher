import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "ifi-section-header",
        align === "center" && "text-center",
        align === "left" && "text-left",
        className,
      )}
    >
      {eyebrow && <span className="ifi-eyebrow">{eyebrow}</span>}
      <h2 className="ifi-section-title">{title}</h2>
      {description && (
        <p className="ifi-section-desc mx-auto max-w-2xl">{description}</p>
      )}
    </div>
  );
}
