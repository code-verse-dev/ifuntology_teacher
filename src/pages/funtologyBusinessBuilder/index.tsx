import { useEffect, useState } from "react";
import { Briefcase, ZoomIn } from "lucide-react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { ImageUrl } from "@/utils/Functions";
import ZoomableImageDialog from "./ZoomableImageDialog";

const BUILDER_IMAGES = [
  {
    title: "Funtology Business Builder",
    file: "Funtology Bunisess-01.jpg",
  },
  {
    title: "Student Budget",
    file: "Student Budget.jpg",
  },
] as const;

export default function FuntologyBusinessBuilderPage() {
  const [activeImage, setActiveImage] = useState<
    (typeof BUILDER_IMAGES)[number] | null
  >(null);

  useEffect(() => {
    document.title = "Funtology Business Builder • iFuntology Teacher";
  }, []);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-5xl space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Briefcase className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Resources
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Funtology Business Builder
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Tap a card to view the full image. Use zoom controls or scroll to
            enlarge details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {BUILDER_IMAGES.map((item) => {
            const src = ImageUrl(item.file);

            return (
              <Card
                key={item.file}
                role="button"
                tabIndex={0}
                onClick={() => setActiveImage(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveImage(item);
                  }
                }}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="border-b border-border/40 bg-muted/30 px-4 py-3">
                  <h2 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h2>
                </div>

                <div className="relative aspect-[4/3] overflow-hidden bg-muted/20">
                  <img
                    src={src}
                    alt={item.title}
                    className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.02]"
                    draggable={false}
                  />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-sm font-medium text-foreground shadow">
                      <ZoomIn className="h-4 w-4" />
                      View &amp; zoom
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {activeImage && (
        <ZoomableImageDialog
          open={Boolean(activeImage)}
          onOpenChange={(open) => {
            if (!open) setActiveImage(null);
          }}
          src={ImageUrl(activeImage.file)}
          alt={activeImage.title}
          title={activeImage.title}
        />
      )}
    </DashboardWithSidebarLayout>
  );
}
