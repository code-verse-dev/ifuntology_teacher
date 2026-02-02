import { useEffect } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/cart.store";
import AddedToCartDialog from "@/components/enrichment/AddedToCartDialog";
import { useNavigate } from "react-router-dom";
import { ImageUrl } from "@/utils/Functions";
import { Link } from "react-router-dom";

const products = [
  { id: "p1", title: "Acrylic Nail Brushes", price: "$144.00", cutPrice: "$200.00", tag: "Nailtology", image: "/placeholder.svg", measure: "Dozen" },
  { id: "p2", title: "Cotton Balls", price: "$144.00", cutPrice: "$200.00", tag: "Nailtology", image: "/placeholder.svg", measure: "Dozen" },
  { id: "p3", title: "Moisturizing Lotion", price: "$144.00", cutPrice: "$200.00", tag: "Nailtology", image: "/placeholder.svg", measure: "Dozen" },
  { id: "p4", title: "Nail Art Kits", price: "$144.00", cutPrice: "$200.00", tag: "Nailtology", image: "/placeholder.svg", measure: "Dozen" },
  { id: "p5", title: "Nail Files", price: "$144.00", cutPrice: "$200.00", tag: "Nailtology", image: "/placeholder.svg", measure: "Dozen" },
  { id: "p6", title: "Nail Polish Pack", price: "$144.00", cutPrice: "$200.00", tag: "Nailtology", image: "/placeholder.svg", measure: "Dozen" },
  { id: "p7", title: "Nail Wheel Palette", price: "$144.00", cutPrice: "$200.00", tag: "Nailtology", image: "/placeholder.svg", measure: "Dozen" },
  { id: "p8", title: "UV Nail Lamps", price: "$144.00", cutPrice: "$200.00", tag: "Nailtology", image: "/placeholder.svg", measure: "Dozen" },
];

export default function EnrichmentStore() {
  useEffect(() => {
    document.title = "Enrichment Store • iFuntology Teacher";
  }, []);
  const [tab, setTab] = useState<"categories" | "interactive">("categories");

  const images = ["product-1.png", "product-2.png", "product-3.png", "product-4.png"];
  const getImage = (idx: number) => ImageUrl(images[idx % images.length]);

  const { addItem } = useCart();
  const navigate = useNavigate();
  const [addedDialogOpen, setAddedDialogOpen] = useState(false);
  const [lastAddedTitle, setLastAddedTitle] = useState<string | undefined>(undefined);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <h1 className="text-2xl font-extrabold">E-commerce Enrichment Store</h1>

        <Card className="rounded-2xl border border-border/60 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 w-full md:w-2/3">
              <Input placeholder="Search Products..." />
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline">Filter By</Button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTab("categories")}
                className={`rounded-t-md px-4 py-2 text-sm ${tab === "categories" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "surface-glass text-card-foreground"}`}
              >
                Categories
              </button>
              <button
                onClick={() => setTab("interactive")}
                className={`rounded-t-md px-4 py-2 text-sm ${tab === "interactive" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "surface-glass text-card-foreground"}`}
              >
                Interactive Classroom Kits
              </button>
            </div>

            <div className="rounded-b-md border border-border/60 p-3">
              <Collapsible defaultOpen>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge>{tab === "categories" ? "Categories" : "Interactive Classroom Kits"}</Badge>
                    <span className="text-sm text-muted-foreground">{tab === "categories" ? "Browse by category" : "Featured kits"}</span>
                  </div>
                  <CollapsibleTrigger asChild>
                    <button className="rounded-full p-2 hover:bg-muted">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="mt-3 flex gap-3 flex-wrap">
                    {tab === "categories" ? (
                      [
                        "Barbertology Fundamentals Student Supreme Kits",
                        "Cream",
                        "Funtalogy Fundamentals Student Supreme Kits",
                        "Nailtology Student Supreme Kits",
                        "Product",
                        "Science Kits",
                        "Skinology Fundamentals Student Supreme Kits",
                      ].map((t) => (
                        <button key={t} className="rounded-full border border-border/60 px-3 py-1 text-sm text-muted-foreground hover:bg-muted">
                          {t}
                        </button>
                      ))
                    ) : (
                      [
                        "Interactive Kit A",
                        "Interactive Kit B",
                        "Interactive Kit C",
                        "Interactive Kit D",
                      ].map((t) => (
                        <button key={t} className="rounded-full border border-border/60 px-3 py-1 text-sm text-muted-foreground hover:bg-muted">
                          {t}
                        </button>
                      ))
                    )}

                    <button className="ml-auto rounded-full bg-emerald-600 px-3 py-1 text-sm text-foreground">Nailtology Student Supreme Kits</button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {products.map((p, i) => (
            <Card key={p.id} className="p-4 flex flex-col">
              <Link to={`/enrichment-store/product/${p.id}`} state={{ fromTab: tab }} aria-label={p.title} className="block">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
                  <img src={getImage(i)} alt={p.title} className="h-full w-full object-cover" />
                </div>
              </Link>

              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <div>{p.tag}</div>
                <div className="text-amber-400">★★★★☆</div>
              </div>

              <Link to={`/enrichment-store/product/${p.id}`} state={{ fromTab: tab }} className="mt-1 font-medium text-base hover:underline">{p.title}</Link>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-baseline gap-3">
                  <div className="text-lg font-semibold">{p.price}</div>
                  <div className="text-sm text-muted-foreground line-through">{p.cutPrice}</div>
                </div>
                <div className="text-sm text-muted-foreground">{p.measure}</div>
              </div>

                <Button
                  className="w-full mt-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white"
                  onClick={() => {
                    const numeric = Number(String(p.price).replace(/[^0-9.]/g, "")) || 0;
                    addItem({ id: p.id, title: p.title, price: numeric, image: images[i % images.length] });
                    setLastAddedTitle(p.title);
                    setAddedDialogOpen(true);
                  }}
                >
                  Add to Cart
                </Button>
            </Card>
          ))}
        </div>
        
        <AddedToCartDialog
          open={addedDialogOpen}
          onOpenChange={setAddedDialogOpen}
          productTitle={lastAddedTitle}
          onContinue={() => {
            setAddedDialogOpen(false);
            navigate('/enrichment-store');
          }}
          onViewCart={() => {
            setAddedDialogOpen(false);
            navigate('/cart');
          }}
        />
      </section>
    </DashboardWithSidebarLayout>
  );
}
