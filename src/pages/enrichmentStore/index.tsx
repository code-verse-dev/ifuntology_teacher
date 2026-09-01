import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Package,
  Paintbrush,
  Scissors,
  Search,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { Pagination } from "antd";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AddedToCartDialog from "@/components/enrichment/AddedToCartDialog";
import PackSizeChoiceDialog from "@/components/enrichment/PackSizeChoiceDialog";
import { buildCartItems } from "@/utils/Functions";
import {
  getPackStep,
  rememberPackStep,
  requiresPackQuantity,
  type PackSize,
} from "@/utils/packQuantity";
import { useGetCategoriesQuery } from "@/redux/services/apiSlices/categorySlice";
import { useGetProductsQuery } from "@/redux/services/apiSlices/productSlice";
import {
  useGetCartQuery,
  useCreateCartMutation,
} from "@/redux/services/apiSlices/cartSlice";
import { UPLOADS_URL } from "@/constants/api";

interface Query {
  limit: number;
  page: number;
  keyword?: string;
  category?: string;
}

type CategoryMeta = {
  description: string;
  icon: typeof Package;
  iconClass: string;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  "All Products": {
    description: "Explore all available products and kits",
    icon: Package,
    iconClass: "bg-lime-500 text-white",
  },
};

const getCategoryMeta = (title: string): CategoryMeta => {
  const lower = title.toLowerCase();
  if (lower.includes("funtology")) {
    return {
      description: "Complete kits for foundational learning",
      icon: GraduationCap,
      iconClass: "bg-violet-500 text-white",
    };
  }
  if (lower.includes("barber")) {
    return {
      description: "Professional tools and kits for barbering",
      icon: Scissors,
      iconClass: "bg-blue-500 text-white",
    };
  }
  if (lower.includes("nail")) {
    return {
      description: "Essential kits for nail technology",
      icon: Sparkles,
      iconClass: "bg-orange-500 text-white",
    };
  }
  if (lower.includes("skin")) {
    return {
      description: "Skincare learning essentials",
      icon: Paintbrush,
      iconClass: "bg-teal-500 text-white",
    };
  }
  return {
    description: "Browse curated products and learning kits",
    icon: Package,
    iconClass: "bg-slate-600 text-white",
  };
};

function CategoryProductCount({ categoryId }: { categoryId?: string }) {
  const { data } = useGetProductsQuery({
    page: 1,
    limit: 1,
    ...(categoryId ? { category: categoryId } : {}),
  });
  const count = data?.data?.totalDocs ?? 0;
  if (!count) return <span className="text-slate-400">0</span>;
  return (
    <span className="text-slate-300 font-medium">
      {count}
      {count >= 100 ? "+" : ""}
    </span>
  );
}

export default function EnrichmentStore() {
  const navigate = useNavigate();
  const productsRef = useRef<HTMLDivElement>(null);

  const [paginationConfig, setPaginationConfig] = useState({
    pageNumber: 1,
    limit: 12,
    totalDocs: 0,
    totalPages: 0,
  });
  const [queryOptions, setQueryOptions] = useState<Query>({
    page: 1,
    limit: 12,
  });
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [addedDialogOpen, setAddedDialogOpen] = useState(false);
  const [lastAddedTitle, setLastAddedTitle] = useState<string | undefined>();
  const [packDialogOpen, setPackDialogOpen] = useState(false);
  const [packProduct, setPackProduct] = useState<any>(null);

  const { data: categoriesData } = useGetCategoriesQuery({});
  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery(queryOptions);
  const { data: cartData } = useGetCartQuery();
  const [createCart, { isLoading: cartLoading }] = useCreateCartMutation();

  const cartCount =
    cartData?.data?.items?.reduce(
      (sum: number, item: any) => sum + (item.quantity ?? 1),
      0
    ) ?? 0;

  const storeCategories = useMemo(
    () =>
      categoriesData?.data?.filter(
        (cat: any) => cat.title !== "Interactive STEM Kits"
      ) ?? [],
    [categoriesData]
  );

  const visibleCategories = showAllCategories
    ? storeCategories
    : storeCategories.slice(0, 4);

  const hasMoreCategories = storeCategories.length > 4;

  const selectedCategoryTitle = selectedCategory
    ? storeCategories.find((cat: any) => cat._id === selectedCategory)?.title
    : null;

  useEffect(() => {
    if (productsData?.data) {
      setPaginationConfig({
        pageNumber: productsData.data.page,
        limit: productsData.data.limit,
        totalDocs: productsData.data.totalDocs,
        totalPages: productsData.data.totalPages,
      });
    }
  }, [productsData]);

  useEffect(() => {
    setQueryOptions((prev) => ({
      ...prev,
      keyword: search || undefined,
      category: selectedCategory || undefined,
      page: 1,
    }));
  }, [search, selectedCategory]);

  useEffect(() => {
    document.title = "Enrichment Store • iFuntology Teacher";
  }, []);

  const handleViewProducts = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    window.requestAnimationFrame(() => {
      productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearch("");
  };

  const addProductToCart = async (productId: string, step = 1) => {
    const items = buildCartItems(productId, cartData, "add", step);
    await createCart({ items }).unwrap();
  };

  const handleAddToCart = async (product: any) => {
    try {
      if (requiresPackQuantity(product)) {
        const existing = cartData?.data?.items?.find(
          (it: any) => it.product._id === product._id
        );
        if (existing) {
          const step = getPackStep(existing.quantity, product._id);
          await addProductToCart(product._id, step);
          setLastAddedTitle(product.name);
          setAddedDialogOpen(true);
          return;
        }
        setPackProduct(product);
        setPackDialogOpen(true);
        return;
      }

      await addProductToCart(product._id);
      setLastAddedTitle(product.name);
      setAddedDialogOpen(true);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handlePackSizeSelect = async (size: PackSize) => {
    if (!packProduct) return;
    try {
      rememberPackStep(packProduct._id, size);
      await addProductToCart(packProduct._id, size);
      setPackDialogOpen(false);
      setLastAddedTitle(packProduct.name);
      setPackProduct(null);
      setAddedDialogOpen(true);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            E-commerce Enrichment Store
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Explore curated products and kits to enhance learning and creativity.
          </p>
        </div>

        {/* Search + Cart */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products, kits, and more..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-xl border-border/60 bg-card pl-11 text-base"
            />
          </div>
          <Button
            className="h-12 shrink-0 rounded-xl bg-lime-500 px-6 font-semibold text-white hover:bg-lime-600"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Cart ({cartCount})
          </Button>
        </div>

        {/* Categories */}
        <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/80">
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <h2 className="text-lg font-bold text-foreground">Categories</h2>
            {hasMoreCategories ? (
              <button
                type="button"
                onClick={() => setShowAllCategories((open) => !open)}
                className="flex items-center gap-1 text-sm font-semibold text-lime-500 hover:text-lime-400 transition-colors"
              >
                {showAllCategories ? "Show Less" : "View All Categories"}
                {showAllCategories ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            ) : null}
          </div>

          <div className="hidden md:grid md:grid-cols-[2fr_3fr_1fr_1fr] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border/40">
            <span>Category</span>
            <span>Description</span>
            <span>Products</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-border/40">
            {/* All Products row */}
            {(() => {
              const meta = CATEGORY_META["All Products"];
              const Icon = meta.icon;
              const isActive = selectedCategory === null;
              return (
                <div
                  className={`grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[2fr_3fr_1fr_1fr] md:items-center md:gap-4 ${
                    isActive ? "bg-lime-500/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.iconClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-foreground">All Products</span>
                  </div>
                  <p className="text-sm text-muted-foreground md:col-span-1">
                    {meta.description}
                  </p>
                  <div className="text-sm md:col-span-1">
                    <span className="md:hidden text-xs font-semibold uppercase text-muted-foreground mr-2">
                      Products:
                    </span>
                    <CategoryProductCount />
                  </div>
                  <div className="md:text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-lg font-semibold text-lime-500 hover:text-lime-400 hover:bg-lime-500/10"
                      onClick={() => handleViewProducts(null)}
                    >
                      View Products
                    </Button>
                  </div>
                </div>
              );
            })()}

            {visibleCategories.map((cat: any) => {
              const meta = getCategoryMeta(cat.title);
              const Icon = meta.icon;
              const isActive = selectedCategory === cat._id;
              return (
                <div
                  key={cat._id}
                  className={`grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[2fr_3fr_1fr_1fr] md:items-center md:gap-4 ${
                    isActive ? "bg-lime-500/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.iconClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-foreground">{cat.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{meta.description}</p>
                  <div className="text-sm">
                    <span className="md:hidden text-xs font-semibold uppercase text-muted-foreground mr-2">
                      Products:
                    </span>
                    <CategoryProductCount categoryId={cat._id} />
                  </div>
                  <div className="md:text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-lg font-semibold text-lime-500 hover:text-lime-400 hover:bg-lime-500/10"
                      onClick={() => handleViewProducts(cat._id)}
                    >
                      View Products
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Products */}
        <div ref={productsRef} className="scroll-mt-6 space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {selectedCategoryTitle ?? "Featured Products"}
              </h2>
              {selectedCategoryTitle ? (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Showing products in {selectedCategoryTitle}
                </p>
              ) : null}
            </div>
            {(selectedCategory || search) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm font-semibold text-lime-500 hover:text-lime-400 w-fit"
              >
                View All Products
              </button>
            )}
          </div>

          {productsLoading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-border/60 animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-5 w-1/3 rounded bg-muted" />
                    <div className="h-10 rounded bg-muted" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!productsLoading && productsData?.data?.docs?.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {productsData.data.docs.map((p: any) => (
                <Card
                  key={p._id}
                  className="group overflow-hidden rounded-2xl border border-border/60 bg-card/80 transition-shadow hover:shadow-lg"
                >
                  <Link
                    to={`/enrichment-store/product/${p._id}`}
                    className="relative block aspect-[4/3] overflow-hidden bg-muted"
                  >
                    <img
                      src={UPLOADS_URL + p.image}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  <div className="space-y-3 p-4">
                    <Link
                      to={`/enrichment-store/product/${p._id}`}
                      className="line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:text-lime-500 transition-colors"
                    >
                      {p.name}
                    </Link>
                    <p className="text-lg font-bold text-foreground">
                      ${Number(p.price).toFixed(2)}
                    </p>
                    {requiresPackQuantity(p) && (
                      <p className="text-xs text-muted-foreground">
                        Sold in packs of 12 and 15
                      </p>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-border/60 font-semibold"
                        asChild
                      >
                        <Link to={`/enrichment-store/product/${p._id}`}>View Detail</Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-lime-500/50 font-semibold text-lime-500 hover:bg-lime-500/10 hover:text-lime-400"
                        disabled={cartLoading}
                        onClick={() => handleAddToCart(p)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!productsLoading && productsData?.data?.docs?.length === 0 && (
            <Card className="rounded-2xl border border-border/60 py-16 text-center">
              <p className="text-lg font-medium text-foreground">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or category filter
              </p>
              {(selectedCategory || search) && (
                <Button
                  variant="outline"
                  className="mt-4 rounded-full border-lime-500/50 text-lime-500"
                  onClick={handleClearFilters}
                >
                  View All Products
                </Button>
              )}
            </Card>
          )}

          {productsData?.data?.docs?.length > 0 && (
            <div className="flex justify-end pt-2">
              <Pagination
                current={paginationConfig.pageNumber}
                pageSize={paginationConfig.limit}
                total={paginationConfig.totalDocs}
                onChange={(page) => {
                  setQueryOptions((prev) => ({ ...prev, page }));
                  productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>

        <PackSizeChoiceDialog
          open={packDialogOpen}
          onOpenChange={(open) => {
            setPackDialogOpen(open);
            if (!open) setPackProduct(null);
          }}
          productTitle={packProduct?.name}
          loading={cartLoading}
          onSelect={handlePackSizeSelect}
        />
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
      </section>
    </DashboardWithSidebarLayout>
  );
}
