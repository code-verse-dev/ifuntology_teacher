import { useEffect, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildCartItems } from "@/utils/Functions";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AddedToCartDialog from "@/components/enrichment/AddedToCartDialog";
import { useGetProductByIdQuery } from "@/redux/services/apiSlices/productSlice";
import { UPLOADS_URL } from "@/constants/api";
import {
  useGetCartQuery,
  useCreateCartMutation,
} from "@/redux/services/apiSlices/cartSlice";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: productData,
    isLoading: productLoading,
    isError,
  } = useGetProductByIdQuery(id ?? "");

  const [heroSrc, setHeroSrc] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbApi, setThumbApi] = useState<CarouselApi | null>(null);
  const [addedDialogOpen, setAddedDialogOpen] = useState(false);
  const [lastAddedTitle, setLastAddedTitle] = useState<string>();

  useEffect(() => {
    document.title = `Product Details • ${productData?.data?.name ?? ""}`;
  }, [productData]);

  /* ---------- Images from API ---------- */
  const heroImage = productData?.data?.image
    ? UPLOADS_URL + productData.data.image
    : "";

  const galleryImages =
    productData?.data?.gallery?.map((img: string) => UPLOADS_URL + img) ?? [];

  const images = heroImage ? [heroImage, ...galleryImages] : galleryImages;

  useEffect(() => {
    if (!images.length) return;

    // if hero is not set OR current hero no longer exists
    if (!heroSrc || !images.includes(heroSrc)) {
      setHeroSrc(images[0]);
      setActiveIndex(0);
    }
  }, [images, heroSrc]);

  const { data: cartData } = useGetCartQuery();
  const [createCart, { isLoading: cartLoading }] = useCreateCartMutation();
    const updateQty = async (
      productId: string,
      action: "increment" | "decrement"
    ) => {
      const updatedItems = buildCartItems(productId, cartData, action);
      try {
        await createCart({ items: updatedItems }).unwrap();
      } catch (err: any) {
        console.error(err);
      }
    };
  /* ---------- Loading State ---------- */
  if (productLoading) {
    return (
      <DashboardWithSidebarLayout>
        <section className="mx-auto w-full space-y-6">
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
          <Card className="p-6 grid md:grid-cols-2 gap-6">
            <div className="aspect-[4/3] bg-muted rounded animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 w-2/3 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
              <div className="h-20 bg-muted rounded animate-pulse" />
              <div className="h-10 w-40 bg-muted rounded animate-pulse" />
            </div>
          </Card>
        </section>
      </DashboardWithSidebarLayout>
    );
  }

  if (isError || !productData?.data) return null;

  const product = productData.data;

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full space-y-6">
        <Link to="/enrichment-store" className="text-sm text-muted-foreground">
          &lt; Back to Enrichment Store
        </Link>

        <h1 className="text-2xl font-extrabold">Product Details</h1>

        <Card className="rounded-2xl border border-border/60 p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* ---------- Images ---------- */}
            <div className="md:w-1/2">
              <div className="relative rounded-md bg-muted p-4">
                <img
                  src={heroSrc}
                  alt={product.name}
                  className="w-full rounded-md object-cover"
                />

                <button
                  onClick={() => {
                    const prev = Math.max(0, activeIndex - 1);
                    setActiveIndex(prev);
                    setHeroSrc(images[prev]);
                    thumbApi?.scrollTo(prev);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 shadow"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    const next = Math.min(images.length - 1, activeIndex + 1);
                    setActiveIndex(next);
                    setHeroSrc(images[next]);
                    thumbApi?.scrollTo(next);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 shadow"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* ---------- Thumbnails ---------- */}
              {images.length > 1 && (
                <div className="mt-4">
                  <Carousel setApi={setThumbApi}>
                    <CarouselContent className="flex gap-2">
                      {images.map((img, i) => (
                        <CarouselItem key={i} className="basis-auto">
                          <button
                            onClick={() => {
                              setHeroSrc(img);
                              setActiveIndex(i);
                              thumbApi?.scrollTo(i);
                            }}
                            className={`h-24 w-24 overflow-hidden rounded-md ${
                              i === activeIndex
                                ? "border-2 border-amber-400"
                                : "border border-border/60"
                            }`}
                          >
                            <img
                              src={img}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              )}
            </div>

            {/* ---------- Details ---------- */}
            <div className="md:w-1/2">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Category:{" "}
                    <span className="text-emerald-600">
                      {product.category?.title}
                    </span>
                  </p>
                </div>
                <div className="text-2xl font-extrabold text-amber-500">
                  ${product.price}
                </div>
              </div>

              <p className="mt-4 text-muted-foreground">
                {product.description}
              </p>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    disabled={cartLoading}
                    onClick={() => updateQty(product._id, "decrement")}
                  >
                    -
                  </Button>
                  <div className="w-10 text-center">
                    {cartData?.data?.items?.find((it : any) => it.product._id === product._id)
                      ?.quantity ?? 1}
                  </div>
                  <Button
                    disabled={cartLoading}
                    onClick={() => updateQty(product._id, "increment")}
                  >
                    +
                  </Button>
                </div>

                <Button
                  className="bg-emerald-600 text-white"
                  onClick={async () => {
                    try {
                      const items = buildCartItems(product._id, cartData);

                      await createCart({ items }).unwrap();

                      setLastAddedTitle(product.name);
                      setAddedDialogOpen(true);
                    } catch (err: any) {
                      console.error(err);
                    }
                  }}
                  disabled={cartLoading}
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
          onContinue={() => navigate("/enrichment-store")}
          onViewCart={() => navigate("/cart")}
        />
      </section>
    </DashboardWithSidebarLayout>
  );
}
