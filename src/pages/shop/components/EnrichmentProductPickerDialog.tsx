import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import { Loader2, Minus, Plus, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetProductsQuery } from "@/redux/services/apiSlices/productSlice";
import { resolveAssetUrl } from "../utils/resolveAssetUrl";
import { cn } from "@/lib/utils";
import type { CatalogSelectedProduct } from "../shopPayload";

type Category = { _id: string; title: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  selectedProducts: Record<string, CatalogSelectedProduct>;
  onUpdateProduct: (
    productId: string,
    product: CatalogSelectedProduct | null
  ) => void;
};

const PAGE_SIZE = 6;

export default function EnrichmentProductPickerDialog({
  open,
  onOpenChange,
  categories,
  selectedProducts,
  onUpdateProduct,
}: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setDebouncedSearch("");
      setSelectedCategory(null);
      setPage(1);
    }
  }, [open]);

  const queryOptions = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      keyword: debouncedSearch || undefined,
      category: selectedCategory || undefined,
    }),
    [page, debouncedSearch, selectedCategory]
  );

  const { data: productsData, isLoading, isFetching } = useGetProductsQuery(
    queryOptions,
    { skip: !open }
  );

  const docs = productsData?.data?.docs ?? [];
  const totalDocs = productsData?.data?.totalDocs ?? 0;

  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.title !== "Interactive STEM Kits"),
    [categories]
  );

  const handleQuantityChange = (productId: string, delta: number) => {
    const current = selectedProducts[productId];
    if (!current) return;
    const next = Math.max(1, Number(current.quantity || 1) + delta);
    onUpdateProduct(productId, { ...current, quantity: String(next) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-border/60 px-5 py-3 pr-12">
          <DialogTitle className="text-lg leading-tight">
            Browse enrichment products
          </DialogTitle>
          <DialogDescription className="text-xs leading-snug">
            Search the catalog and add items to your shop bundle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 border-b border-border/60 px-5 py-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="h-9 rounded-full pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                selectedCategory === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              All categories
            </button>
            {filteredCategories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat._id ? null : cat._id
                  )
                }
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                  selectedCategory === cat._id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {(isLoading || isFetching) && !docs.length ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading products…
            </div>
          ) : !docs.length ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No products found. Try a different search or category.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((product: any) => {
                const productId = String(product._id);
                const selected = selectedProducts[productId];
                const imageUrl = resolveAssetUrl(product.image);

                return (
                  <div
                    key={productId}
                    className={cn(
                      "flex min-h-[320px] flex-col rounded-xl border p-4 transition-shadow",
                      selected
                        ? "border-primary/50 bg-primary/5 shadow-sm"
                        : "border-border/60 bg-card"
                    )}
                  >
                    <div className="aspect-[5/4] overflow-hidden rounded-lg bg-muted">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    <p className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-foreground">
                      {product.name}
                    </p>
                    <p className="mt-1.5 text-base font-bold text-foreground">
                      ${Number(product.price ?? 0).toFixed(2)}
                    </p>

                    {selected ? (
                      <div className="mt-auto space-y-2.5 pt-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Quantity
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => handleQuantityChange(productId, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="min-w-[2rem] text-center text-base font-semibold">
                              {selected.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => handleQuantityChange(productId, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-10 w-full text-destructive hover:text-destructive"
                          onClick={() => onUpdateProduct(productId, null)}
                        >
                          <X className="mr-1.5 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="brand"
                        className="mt-auto h-10 w-full"
                        onClick={() =>
                          onUpdateProduct(productId, {
                            name: product.name,
                            image: product.image,
                            price: Number(product.price ?? 0),
                            quantity: "1",
                          })
                        }
                      >
                        Add to selection
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {totalDocs > PAGE_SIZE && (
          <div className="flex justify-center border-t border-border/60 px-5 py-3">
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={totalDocs}
              onChange={(nextPage) => setPage(nextPage)}
              showSizeChanger={false}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/30 px-5 py-3">
          <p className="text-sm text-muted-foreground">
            {Object.keys(selectedProducts).length} product
            {Object.keys(selectedProducts).length === 1 ? "" : "s"} selected
          </p>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
