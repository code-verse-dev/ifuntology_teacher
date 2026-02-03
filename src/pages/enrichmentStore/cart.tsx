import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart.store";
import { ImageUrl } from "@/utils/Functions";
import { Link, useNavigate } from "react-router-dom";

export default function CartPage() {
  const { items, updateQty, removeItem, clear, totalAmount } = useCart();
  const navigate = useNavigate();

  const subtotal = totalAmount;
  const tax = +(subtotal * 0.08).toFixed(2); // example 8% tax
  const shipping = items.length ? 99.95 : 0;
  const total = +(subtotal + tax + shipping).toFixed(2);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full  space-y-6">
        <Link to="/enrichment-store" className="text-sm text-muted-foreground">&lt; Back to Enrichment Store</Link>

        <h1 className="text-2xl font-extrabold">Cart</h1>

        <Card className="rounded-2xl border border-border/60 p-6">
          <div className="space-y-6">
            <div className="rounded-lg border border-border/60 p-4">
              <div className="mb-4 text-sm text-emerald-600">Coupon Code</div>
              <div className="flex gap-3">
                <Input placeholder="Enter Code" />
                <Button variant="brand">Apply Coupon</Button>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-4">
              <div className="grid grid-cols-6 gap-4 items-center font-medium text-sm text-muted-foreground">
                <div className="col-span-2">Product</div>
                <div className="col-span-1">Price</div>
                <div className="col-span-1">Quantity</div>
                <div className="col-span-1">Sub-total</div>
                <div className="col-span-1"></div>
              </div>

              <div className="mt-4 space-y-3">
                {items.length === 0 && <div className="text-sm text-muted-foreground">Your cart is empty.</div>}
                {items.map((it) => (
                  <div key={it.id} className="grid grid-cols-6 gap-4 items-center bg-secondary/5 rounded-md p-3">
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="h-20 w-20 overflow-hidden rounded-md bg-muted">
                        <img src={ImageUrl(it.image || "product-1.png")} alt={it.title} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium">{it.title}</div>
                        <div className="text-sm text-muted-foreground">{it.title.includes("Dozen") ? "(Dozen)" : ""}</div>
                      </div>
                    </div>

                    <div className="col-span-1">${it.price.toFixed(2)}</div>

                    <div className="col-span-1">
                      <div className="inline-flex items-center gap-2">
                        <Button size="sm" onClick={() => updateQty(it.id, Math.max(0, it.qty - 1))}>-</Button>
                        <div className="w-8 text-center">{it.qty}</div>
                        <Button size="sm" onClick={() => updateQty(it.id, it.qty + 1)}>+</Button>
                      </div>
                    </div>

                    <div className="col-span-1">${(it.price * it.qty).toFixed(2)}</div>

                    <div className="col-span-1 text-right">
                      <Button variant="outline" size="sm" onClick={() => removeItem(it.id)}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-4">
              <div className="text-lg font-semibold">Cart Totals</div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax:</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping:</span><span>${shipping.toFixed(2)}</span></div>
                <div className="mt-3 rounded-md bg-secondary/10 p-3 flex justify-between font-semibold text-accent"><span>Total Amount:</span><span>${total.toFixed(2)}</span></div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button className="bg-emerald-600 text-white" onClick={() => navigate("/enrichment-store/checkout")}>Proceed to Checkout</Button>
                <Button variant="outline" onClick={() => clear()}>Clear Cart</Button>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
