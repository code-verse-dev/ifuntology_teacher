import { useEffect, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUrl } from "@/utils/Functions";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/cart.store";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AddedToCartDialog from "@/components/enrichment/AddedToCartDialog";

export default function ProductDetails() {
  const { id } = useParams();
  const location = useLocation();
  type LocationState = { fromTab?: "categories" | "interactive" } | null;
  const locState = (location.state as unknown) as LocationState;
  const fromTab = locState?.fromTab ?? "categories";
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [addedDialogOpen, setAddedDialogOpen] = useState(false);
  const [lastAddedTitle, setLastAddedTitle] = useState<string | undefined>(undefined);

  useEffect(() => {
    document.title = `Product Details • ${id ?? "Product"}`;
  }, [id]);

  // Use the requested product-details hero and thumbnails under it
  const defaultHeroName = "product-details.png";
  const defaultHero = ImageUrl(defaultHeroName);

  const thumbNames = [
    "product-details-thumb-1.png",
    "product-details-thumb-2.png",
    "product-details-thumb-3.png",
    "product-details-thumb-4.png",
  ];
  const thumbs = thumbNames.map((n) => ImageUrl(n));

  const [heroSrc, setHeroSrc] = useState<string>(defaultHero);
  const [qty, setQty] = useState(1);
  const [thumbApi, setThumbApi] = useState<CarouselApi | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const product = {
    id,
    title: id === "p2" ? "Cotton Balls" : "Acrylic Nail Brush (Dozen)",
    tag: fromTab === "interactive" ? "Science Kits" : "Nailtology",
    price: "$144.00",
    cutPrice: "$200.00",
    measure: "Dozen",
    description: "High-quality product designed for training institutes, salons, and home use.",
    features: [
      "Set of 12 premium items",
      "Durable and long-lasting",
      "Ideal for classroom and training",
    ],
  };

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <Link to="/enrichment-store" className="text-sm text-muted-foreground">&lt; Back to Enrichment Store</Link>

        <h1 className="text-2xl font-extrabold">Product Details</h1>

        <Card className="rounded-2xl border border-border/60 p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="md:w-1/2">
              <div className="relative rounded-md bg-muted p-4">
                <img src={heroSrc} alt={product.title} className="w-full rounded-md object-cover" />

                {/* overlay arrows inside the hero container */}
                <button
                  onClick={() => {
                    const prev = Math.max(0, activeIndex - 1);
                    setActiveIndex(prev);
                    setHeroSrc(thumbs[prev] ?? defaultHero);
                    thumbApi?.scrollTo(prev);
                  }}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    const next = Math.min(thumbs.length - 1, activeIndex + 1);
                    setActiveIndex(next);
                    setHeroSrc(thumbs[next] ?? defaultHero);
                    thumbApi?.scrollTo(next);
                  }}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 relative">
                <button
                  onClick={() => thumbApi?.scrollPrev()}
                  aria-label="Prev thumbnails"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="overflow-hidden">
                  <Carousel className="relative" setApi={setThumbApi} opts={{ slidesToScroll: 1, containScroll: "trimSnaps" }}>
                    <CarouselContent className="flex flex-row items-center gap-2">
                      {thumbs.map((t, i) => (
                        <CarouselItem key={i} className="basis-auto p-1">
                          <button
                            onClick={() => {
                              setHeroSrc(t);
                              setActiveIndex(i);
                              thumbApi?.scrollTo(i);
                            }}
                            className={`h-28 w-28 overflow-hidden rounded-md ${i === activeIndex ? "border-2 border-amber-400" : "border border-border/60"}`}
                            aria-label={`Show image ${i + 1}`}
                          >
                            <img src={t} className="h-full w-full object-cover" alt={`thumb-${i}`} />
                          </button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>

                <button
                  onClick={() => thumbApi?.scrollNext()}
                  aria-label="Next thumbnails"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="md:w-1/2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{product.title}</h2>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Categories: <span className="text-emerald-600">{product.tag}</span>
                  </div>
                </div>
                <div className="text-2xl text-amber-500 font-extrabold">{product.price}</div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>

              <div className="mt-4">
                <h3 className="font-medium">Key Features</h3>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  {product.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Quantity</label>
                  <div className="ml-2 flex items-center gap-2">
                    <Button onClick={() => setQty((s) => Math.max(1, s - 1))}>-</Button>
                    <div className="w-12 text-center">{qty}</div>
                    <Button onClick={() => setQty((s) => s + 1)}>+</Button>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    const numeric = Number(String(product.price).replace(/[^0-9.]/g, "")) || 0;
                    const imageName = fromTab === "interactive" ? "product-43.png" : "product-42.png";
                    for (let i = 0; i < qty; i++) {
                      addItem({ id: product.id ?? id ?? "", title: product.title, price: numeric, image: imageName });
                    }
                    setLastAddedTitle(product.title);
                    setAddedDialogOpen(true);
                  }}
                  className="bg-emerald-600 text-white"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <AddedToCartDialog
          open={addedDialogOpen}
          onOpenChange={setAddedDialogOpen}
          productTitle={lastAddedTitle}
          onContinue={() => {
            setAddedDialogOpen(false);
            navigate("/enrichment-store");
          }}
          onViewCart={() => {
            setAddedDialogOpen(false);
            navigate("/cart");
          }}
        />

        <div>
          <h3 className="text-lg font-semibold">Related Products</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-3">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                  <img src={thumbs[i]} alt={`related-${i}`} className="h-full w-full object-cover" />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">Nailtology</div>
                <div className="mt-1 font-medium">Related Product</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-lg font-semibold">$144.00</div>
                </div>
                <Button className="w-full mt-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white">Add to Cart</Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </DashboardWithSidebarLayout>
  );
}
