import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const variantStyles = {
  lms: "",
  enrichment: "",
  wtr: "bg-gradient-to-br from-[#15803d] via-[#16a34a] to-[#4ade80]",
} as const;

type ShopSectionVariant = keyof typeof variantStyles;

type ShopSectionCardProps = {
  variant: ShopSectionVariant;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  imageSrc: string;
  backgroundVectorSrc?: string;
  imageClassName?: string;
  tagline?: string;
  onTaglineClick?: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export const shopFieldLabel =
  "text-xs font-semibold text-white/95 tracking-wide";
export const shopFieldInput =
  "mt-1.5 h-11 w-full rounded-lg border-0 bg-white px-4 text-sm text-black shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-white/60 placeholder:text-slate-400";
export const shopFieldSelect = shopFieldInput;

export default function ShopSectionCard({
  variant,
  title,
  description,
  icon: Icon,
  enabled,
  onToggle,
  imageSrc,
  backgroundVectorSrc,
  imageClassName,
  tagline,
  onTaglineClick,
  footer,
  children,
}: ShopSectionCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] transition-opacity",
        variant === "lms" && "shadow-[0_8px_32px_rgba(30,100,180,0.18)]",
        variant === "enrichment" && "shadow-[0_8px_32px_rgba(76,29,149,0.2)]",
        variant === "wtr" && cn(variantStyles.wtr, "shadow-lg"),
        !enabled && "opacity-75"
      )}
      style={
        variant === "lms"
          ? { backgroundColor: "#4a90e2" }
          : variant === "enrichment"
            ? { backgroundColor: "#7c3aed" }
            : undefined
      }
    >
      {variant === "lms" && (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, #4a90e2 0%, #5da0eb 16%, #7eb8f5 38%, #a8d4f7 58%, #d4ebfc 78%, #eef6fc 100%)",
            }}
          />
          {backgroundVectorSrc && (
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay"
              style={{
                backgroundImage: `url(${backgroundVectorSrc})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
        </>
      )}
      {variant === "enrichment" && (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, #7c3aed 0%, #8b5cf6 16%, #a78bfa 38%, #c4b5fd 58%, #e9d5ff 78%, #f5f3ff 100%)",
            }}
          />
          {backgroundVectorSrc && (
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay"
              style={{
                backgroundImage: `url(${backgroundVectorSrc})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
        </>
      )}
      {variant === "wtr" && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      )}

      <div className="relative p-6 md:p-8 lg:p-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div
              className={cn(
                "flex shrink-0 items-center justify-center",
                variant === "lms" || variant === "enrichment"
                  ? "h-14 w-14 rounded-full bg-white shadow-md"
                  : "h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm"
              )}
            >
              <Icon
                className={cn(
                  variant === "lms"
                    ? "h-7 w-7 text-[#4a90e2]"
                    : variant === "enrichment"
                      ? "h-7 w-7 text-[#7c3aed]"
                      : "h-6 w-6 text-white"
                )}
              />
            </div>
            <div>
              <h3
                className={cn(
                  "font-bold text-white",
                  variant === "lms" || variant === "enrichment"
                    ? "text-xl md:text-2xl"
                    : "text-lg md:text-xl"
                )}
              >
                {title}
              </h3>
              <p className="mt-1 text-sm text-white/90">{description}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <span className="text-sm font-semibold text-black">Include</span>
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-[#7cb342] data-[state=unchecked]:bg-white/40"
            />
          </div>
        </div>

        <div
          className={cn(
            "grid grid-cols-1 items-start gap-8",
            variant === "lms" || variant === "enrichment"
              ? "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-6"
              : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
          )}
        >
          <div className="flex flex-col">
            <div className="flex justify-center lg:justify-start">
              <img
                src={imageSrc}
                alt=""
                className={cn(
                  "h-auto w-full object-contain drop-shadow-lg",
                  imageClassName ??
                    (variant === "lms" || variant === "enrichment"
                      ? "max-w-[min(100%,540px)] lg:max-w-[580px]"
                      : "max-w-[320px]")
                )}
              />
            </div>
            {tagline && (
              onTaglineClick ? (
                <button
                  type="button"
                  onClick={onTaglineClick}
                  className={cn(
                    "text-left leading-snug text-white transition-opacity hover:opacity-90",
                    variant === "enrichment"
                      ? "mt-6 cursor-pointer text-base font-semibold underline underline-offset-4 md:text-lg"
                      : variant === "lms"
                        ? "mt-6 text-base font-bold md:text-lg"
                        : "mt-5 text-sm font-bold md:text-base"
                  )}
                >
                  {tagline}
                </button>
              ) : (
                <p
                  className={cn(
                    "leading-snug text-white",
                    variant === "enrichment"
                      ? "mt-6 text-base font-semibold underline underline-offset-4 md:text-lg"
                      : variant === "lms"
                        ? "mt-6 text-base font-bold md:text-lg"
                        : "mt-5 text-sm font-bold md:text-base"
                  )}
                >
                  {tagline}
                </p>
              )
            )}
            {footer}
          </div>

          <div
            className={cn(
              variant === "lms" || variant === "enrichment"
                ? "space-y-6"
                : "space-y-4",
              !enabled && "pointer-events-none opacity-60"
            )}
          >
            {enabled ? children : null}
          </div>
        </div>
      </div>
    </div>
  );
}
