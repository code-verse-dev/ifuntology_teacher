import { cn } from "@/lib/utils";

export type ShopPreviewItem = {
  src: string;
  label?: string;
  alt?: string;
};

type ShopSectionPreviewProps = {
  items: ShopPreviewItem[];
  loading?: boolean;
  className?: string;
  maxItems?: number;
};

export default function ShopSectionPreview({
  items,
  loading = false,
  className,
  maxItems = 4,
}: ShopSectionPreviewProps) {
  const visible = items.slice(0, maxItems);

  if (loading) {
    return (
      <div
        className={cn(
          "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4",
          className
        )}
      >
        {Array.from({ length: maxItems }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] animate-pulse rounded-xl bg-muted/60"
          />
        ))}
      </div>
    );
  }

  if (!visible.length) return null;

  return (
    <div className={cn("mt-4", className)}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {visible.map((item, i) => (
          <div
            key={`${item.src}-${i}`}
            className="group overflow-hidden rounded-xl border border-border/40 bg-muted/20"
          >
            <div className="aspect-[4/3] overflow-hidden bg-muted/40">
              <img
                src={item.src}
                alt={item.alt ?? item.label ?? "Preview"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            {item.label && (
              <p className="truncate px-2 py-1.5 text-[10px] font-medium text-muted-foreground">
                {item.label}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
