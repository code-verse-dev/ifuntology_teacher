import { useEffect } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart.store";
import AddedToCartDialog from "@/components/enrichment/AddedToCartDialog";
import { useNavigate } from "react-router-dom";
import { ImageUrl } from "@/utils/Functions";
import { Link } from "react-router-dom";
import { useGetProductsQuery as useGetCategoryProductsQuery } from "@/redux/services/apiSlices/categorySlice";
import { useGetProductsQuery } from "@/redux/services/apiSlices/productSlice";
import { Pagination } from "antd";
import { UPLOADS_URL } from "@/constants/api";

interface Query {
  from?: string;
  to?: string;
  limit: number;
  page: number;
  keyword?: string;
  category?: string;
}

export default function EnrichmentStore() {
  const [paginationConfig, setPaginationConfig] = useState({
    pageNumber: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 0,
  });
  const [queryOptions, setQueryOptions] = useState<Query>({
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categoriesData, isLoading } = useGetCategoryProductsQuery({});
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorData,
  } = useGetProductsQuery(queryOptions);

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
      page: 1, // reset to first page on filter change
    }));
  }, [search, selectedCategory]);

  useEffect(() => {
    document.title = "Enrichment Store • iFuntology Teacher";
  }, []);

  const [tab, setTab] = useState<"categories" | "interactive">("categories");

  const images = [
    "product-1.png",
    "product-2.png",
    "product-3.png",
    "product-4.png",
  ];
  const getImage = (idx: number) => ImageUrl(images[idx % images.length]);

  const { addItem } = useCart();
  const navigate = useNavigate();
  const [addedDialogOpen, setAddedDialogOpen] = useState(false);
  const [lastAddedTitle, setLastAddedTitle] = useState<string | undefined>(
    undefined
  );

  const interactiveCategoryId = categoriesData?.data?.find(
    (cat: any) => cat.title === "Interactive Classroom Kits"
  )?._id;

  useEffect(() => {
    if (tab === "interactive" && interactiveCategoryId) {
      setSelectedCategory(interactiveCategoryId);
    }

    if (tab === "categories") {
      setSelectedCategory(null);
    }
  }, [tab, interactiveCategoryId]);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full  space-y-6">
        <h1 className="text-2xl font-extrabold">E-commerce Enrichment Store</h1>

        <Card className="rounded-2xl border border-border/60 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 w-full md:w-2/3">
              <Input
                placeholder="Search Products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* <div className="flex items-center gap-3">
              <Button variant="outline">Filter By</Button>
            </div> */}
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTab("categories")}
                className={`rounded-t-md px-4 py-2 text-sm ${
                  tab === "categories"
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "surface-glass text-card-foreground"
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setTab("interactive")}
                className={`rounded-t-md px-4 py-2 text-sm ${
                  tab === "interactive"
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "surface-glass text-card-foreground"
                }`}
              >
                Interactive Classroom Kits
              </button>
            </div>

            <div className="rounded-b-md border border-border/60 p-3">
              <Collapsible defaultOpen>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge>
                      {tab === "categories"
                        ? "Categories"
                        : "Interactive Classroom Kits"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {tab === "categories"
                        ? "Browse by category"
                        : "Featured kits"}
                    </span>
                  </div>
                  <CollapsibleTrigger asChild>
                    <button className="rounded-full p-2 hover:bg-muted">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="mt-3 flex gap-3 flex-wrap">
                    {tab === "categories" &&
                      categoriesData?.data
                        ?.filter(
                          (cat: any) =>
                            cat.title !== "Interactive Classroom Kits"
                        )
                        .map((cat: any) => (
                          <button
                            key={cat._id}
                            className={`rounded-full border border-border/60 px-3 py-1 text-sm hover:bg-muted ${
                              selectedCategory === cat._id
                                ? "bg-primary text-white border-primary"
                                : "text-muted-foreground"
                            }`}
                            onClick={() =>
                              setSelectedCategory(
                                selectedCategory === cat._id ? null : cat._id
                              )
                            }
                          >
                            {cat.title}
                          </button>
                        ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </Card>

        {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {productsData?.data?.docs?.map((p: any, i: number) => (
            <Card key={p._id} className="p-4 flex flex-col">
              <Link
                to={`/enrichment-store/product/${p._id}`}
                state={{ fromTab: tab }}
                aria-label={p.name}
                className="block"
              >
                <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                  <img
                    src={UPLOADS_URL + p.image}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Link>
              <Link
                to={`/enrichment-store/product/${p._id}`}
                state={{ fromTab: tab }}
                className="mt-1 font-medium text-base hover:underline"
              >
                {p.name}
              </Link>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-baseline gap-3">
                  <div className="text-lg font-semibold">${p.price}</div>
                </div>
              </div>

              <Button
                className="w-full mt-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white"
                onClick={() => {
                  addItem({
                    id: p._id,
                    title: p.title,
                    price: p.price,
                    image: p.image,
                  });
                  setLastAddedTitle(p.title);
                  setAddedDialogOpen(true);
                }}
              >
                Add to Cart
              </Button>
            </Card>
          ))}
        </div> */}
        {/* Loading */}
        {productsLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="aspect-[4/3] rounded-md bg-muted" />
                <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
                <div className="mt-4 h-9 rounded bg-muted" />
              </Card>
            ))}
          </div>
        )}

        {/* Products */}
        {!productsLoading && productsData?.data?.docs?.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {productsData.data.docs.map((p: any) => (
              <Card key={p._id} className="p-4 flex flex-col">
                <Link
                  to={`/enrichment-store/product/${p._id}`}
                  state={{ fromTab: tab }}
                  className="block"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                    <img
                      src={UPLOADS_URL + p.image}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </Link>

                <Link
                  to={`/enrichment-store/product/${p._id}`}
                  state={{ fromTab: tab }}
                  className="mt-1 font-medium text-base hover:underline"
                >
                  {p.name}
                </Link>

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-lg font-semibold">${p.price}</div>
                </div>

                <Button
                  className="w-full mt-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white"
                  onClick={() => {
                    addItem({
                      id: p._id,
                      title: p.name, // ⚠️ you had p.title before
                      price: p.price,
                      image: p.image,
                    });
                    setLastAddedTitle(p.name);
                    setAddedDialogOpen(true);
                  }}
                >
                  Add to Cart
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!productsLoading && productsData?.data?.docs?.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">
              Try adjusting your search or category filter
            </p>
          </div>
        )}

        {productsData?.data?.docs?.length && (
          <div className="flex justify-end mt-6">
            <Pagination
              current={paginationConfig.pageNumber}
              pageSize={paginationConfig.limit}
              total={paginationConfig.totalDocs}
              onChange={(p) => {
                setQueryOptions((prev) => ({ ...prev, page: p }));
              }}
              showSizeChanger={false}
            />
          </div>
        )}

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
