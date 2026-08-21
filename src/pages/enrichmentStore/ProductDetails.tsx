import { useEffect, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildCartItems } from "@/utils/Functions";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AddedToCartDialog from "@/components/enrichment/AddedToCartDialog";
import PackSizeChoiceDialog from "@/components/enrichment/PackSizeChoiceDialog";
import { useGetProductByIdQuery } from "@/redux/services/apiSlices/productSlice";
import { UPLOADS_URL } from "@/constants/api";
import {
  useGetCartQuery,
  useCreateCartMutation,
  useClearCartMutation,
} from "@/redux/services/apiSlices/cartSlice";
import {
  getPackStep,
  rememberPackStep,
  requiresPackQuantity,
  type PackSize,
} from "@/utils/packQuantity";

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
  const [packDialogOpen, setPackDialogOpen] = useState(false);

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
  const [clearCartMutation] = useClearCartMutation();

  const persistItems = async (updatedItems: any[]) => {
    if (!updatedItems.length) {
      await clearCartMutation().unwrap();
      return;
    }
    await createCart({ items: updatedItems }).unwrap();
  };

  const updateQty = async (
    productId: string,
    action: "increment" | "decrement",
    step = 1
  ) => {
    const updatedItems = buildCartItems(productId, cartData, action, step);
    try {
      await persistItems(updatedItems);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleAddToCart = async () => {
    const product = productData?.data;
    if (!product) return;
    try {
      if (requiresPackQuantity(product)) {
        const existing = cartData?.data?.items?.find(
          (it: any) => it.product._id === product._id
        );
        if (existing) {
          const step = getPackStep(existing.quantity, product._id);
          await persistItems(
            buildCartItems(product._id, cartData, "add", step)
          );
          setLastAddedTitle(product.name);
          setAddedDialogOpen(true);
          return;
        }
        setPackDialogOpen(true);
        return;
      }

      await persistItems(buildCartItems(product._id, cartData));
      setLastAddedTitle(product.name);
      setAddedDialogOpen(true);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handlePackSizeSelect = async (size: PackSize) => {
    const product = productData?.data;
    if (!product) return;
    try {
      rememberPackStep(product._id, size);
      await persistItems(buildCartItems(product._id, cartData, "add", size));
      setPackDialogOpen(false);
      setLastAddedTitle(product.name);
      setAddedDialogOpen(true);
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
          <Card className="p-6 grid lg:grid-cols-[minmax(0,380px)_1fr] gap-8">
            <div className="mx-auto w-full max-w-sm aspect-[4/3] max-h-[280px] bg-muted rounded-xl animate-pulse" />
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
  const isPackProduct = requiresPackQuantity(product);
  const cartQty =
    cartData?.data?.items?.find((it: any) => it.product._id === product._id)
      ?.quantity ?? 0;
  const packStep = getPackStep(cartQty, product._id);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full space-y-6">
        <Link to="/enrichment-store" className="text-sm text-muted-foreground">
          &lt; Back to Enrichment Store
        </Link>

        <h1 className="text-2xl font-extrabold">Product Details</h1>

        <Card className="rounded-2xl border border-border/60 p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-10">
            {/* ---------- Images ---------- */}
            <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none space-y-3">
              <div className="relative flex aspect-[4/3] max-h-[280px] w-full items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/40">
                {heroSrc ? (
                  <img
                    src={heroSrc}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain p-3"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">No image</div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      disabled={activeIndex === 0}
                      onClick={() => {
                        const prev = Math.max(0, activeIndex - 1);
                        setActiveIndex(prev);
                        setHeroSrc(images[prev]);
                        thumbApi?.scrollTo(prev);
                      }}
                      className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/90 shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      aria-label="Next image"
                      disabled={activeIndex === images.length - 1}
                      onClick={() => {
                        const next = Math.min(images.length - 1, activeIndex + 1);
                        setActiveIndex(next);
                        setHeroSrc(images[next]);
                        thumbApi?.scrollTo(next);
                      }}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/90 shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {/* ---------- Thumbnails ---------- */}
              {images.length > 1 && (
                <Carousel setApi={setThumbApi} opts={{ align: "start", dragFree: true }}>
                  <CarouselContent className="-ml-2">
                    {images.map((img, i) => (
                      <CarouselItem key={img} className="basis-auto pl-2">
                        <button
                          type="button"
                          aria-label={`View image ${i + 1}`}
                          onClick={() => {
                            setHeroSrc(img);
                            setActiveIndex(i);
                            thumbApi?.scrollTo(i);
                          }}
                          className={`h-16 w-16 overflow-hidden rounded-lg border bg-muted/40 transition-colors ${
                            i === activeIndex
                              ? "border-lime-500 ring-2 ring-lime-500/30"
                              : "border-border/60 hover:border-lime-500/50"
                          }`}
                        >
                          <img
                            src={img}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              )}
            </div>

            {/* ---------- Details ---------- */}
            <div className="min-w-0">
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

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                {(!isPackProduct || cartQty > 0) && (
                  <div className="space-y-2">
                    {isPackProduct && (
                      <p className="text-sm text-muted-foreground">
                        Quantity increases by {packStep}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        disabled={cartLoading}
                        onClick={() =>
                          updateQty(
                            product._id,
                            "decrement",
                            isPackProduct ? packStep : 1
                          )
                        }
                      >
                        -
                      </Button>
                      <div className="w-10 text-center">
                        {isPackProduct ? cartQty : cartQty || 1}
                      </div>
                      <Button
                        disabled={cartLoading}
                        onClick={() =>
                          updateQty(
                            product._id,
                            "increment",
                            isPackProduct ? packStep : 1
                          )
                        }
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {isPackProduct && cartQty <= 0 && (
                    <p className="text-sm text-muted-foreground">
                      Sold in multiples of 12 or 15
                    </p>
                  )}
                  <Button
                    className="bg-emerald-600 text-white"
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <PackSizeChoiceDialog
          open={packDialogOpen}
          onOpenChange={setPackDialogOpen}
          productTitle={product.name}
          loading={cartLoading}
          onSelect={handlePackSizeSelect}
        />
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
