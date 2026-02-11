import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildCartItems } from "@/utils/Functions";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetCartQuery,
  useCreateCartMutation,
  useClearCartMutation,
} from "@/redux/services/apiSlices/cartSlice";
import { useCheckCouponMutation } from "@/redux/services/apiSlices/couponSlice";
import { UPLOADS_URL } from "@/constants/api";
import { toast } from "sonner";
import { useState } from "react";
import { Modal } from "antd";
import swal from "sweetalert";

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cartData, isLoading } = useGetCartQuery();
  const [createCart, { isLoading: updatingCart }] = useCreateCartMutation();
  const items = cartData?.data?.items || [];

  const [couponCode, setCouponCode] = useState("");
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponPreview, setCouponPreview] = useState<any>(null);

  const [checkCoupon, { isLoading: checkingCoupon }] = useCheckCouponMutation();

  const appliedCoupon = cartData?.data?.coupon;
  const isCouponApplied = Boolean(appliedCoupon);

  const subtotal = items.reduce((sum: number, i: any) => sum + i.total, 0);
  // const tax = +(subtotal * 0.08).toFixed(2); // example 8% tax
  const tax = 0; // example 8% tax
  // const shipping = items.length ? 99.95 : 0;
  const shipping = 0;
  const total = +(cartData?.data?.total + tax + shipping).toFixed(2);

  const discount = subtotal > total ? subtotal - total : 0;
  const [clearCartMutation, { isLoading: clearingCart }] =
    useClearCartMutation();

  // -----------------------------
  // Helper to update quantity
  // -----------------------------
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

  const clearCart = async () => {
    try {
      await clearCartMutation().unwrap();
      toast.success("Cart cleared successfully");
    } catch (err: any) {
      console.error("Failed to clear cart:", err);
    }
  };

  const handleCheckCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const res: any = await checkCoupon({
        code: couponCode,
        amount: subtotal.toFixed(2),
      }).unwrap();
      if (res?.status) {
        setCouponPreview(res.data);
        setShowCouponModal(true);
      } else {
        swal(res?.message || "The coupon code is invalid.", "error");
      }
    } catch (err: any) {
      const message = err?.data?.message || "Invalid coupon";
      swal("Error", message, "error");
    }
  };

  const handleApplyCoupon = async () => {
    try {
      const res: any = await createCart({ couponCode, items: [] }).unwrap();
      if (res?.status) {
        toast.success("Coupon applied successfully");
        setShowCouponModal(false);
      } else {
        swal("Oops", res.message, "error");
      }
    } catch (err: any) {
      const message = err?.data?.message || "Failed to apply coupon";
      swal("Error", message, "error");
    }
  };

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full space-y-6">
        <Link to="/enrichment-store" className="text-sm text-muted-foreground">
          &lt; Back to Enrichment Store
        </Link>

        <h1 className="text-2xl font-extrabold">Cart</h1>

        <Card className="rounded-2xl border border-border/60 p-6">
          <div className="space-y-6">
   
            <div className="rounded-lg border border-border/60 p-4">
              <div className="mb-4 text-sm text-emerald-600">Coupon Code</div>

              {isCouponApplied ? (
                <div className="flex items-center justify-between text-black rounded-md bg-emerald-50 p-3 text-sm">
                  <span>
                    Coupon <strong>{appliedCoupon.code}</strong> applied
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    −${(subtotal - cartData.data.total).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button
                    variant="brand"
                    onClick={handleCheckCoupon}
                    disabled={checkingCoupon}
                  >
                    Apply Coupon
                  </Button>
                </div>
              )}
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
                {items.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Your cart is empty.
                  </div>
                )}
                {items.map((it: any) => (
                  <div
                    key={it.product._id}
                    className="grid grid-cols-6 gap-4 items-center bg-secondary/5 rounded-md p-3"
                  >
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="h-20 w-20 overflow-hidden rounded-md bg-muted">
                        <img
                          src={UPLOADS_URL + it.product.image}
                          alt={it.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{it.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {it.product.name.includes("Dozen") ? "(Dozen)" : ""}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1">
                      ${it.product.price.toFixed(2)}
                    </div>

                    <div className="col-span-1">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateQty(it.product._id, "decrement")}
                          disabled={updatingCart || isLoading}
                        >
                          -
                        </Button>
                        <div className="w-8 text-center">{it.quantity}</div>
                        <Button
                          size="sm"
                          onClick={() => updateQty(it.product._id, "increment")}
                          disabled={updatingCart || isLoading}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="col-span-1">${it.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-4">
              <div className="text-lg font-semibold">Cart Totals</div>

              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon Discount:</span>
                    <span>- ${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>

                <div className="mt-3 rounded-md bg-secondary/10 p-3 flex justify-between font-semibold text-accent">
                  <span>Total Amount:</span>
                  <span>${(total + tax + shipping).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  className="bg-emerald-600 text-white"
                  onClick={() => navigate("/enrichment-store/checkout")}
                >
                  Proceed to Checkout
                </Button>

                <Button
                  variant="outline"
                  onClick={clearCart}
                  disabled={updatingCart || isLoading || clearingCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>
      <Modal
        open={showCouponModal}
        onCancel={() => setShowCouponModal(false)}
        footer={null}
        centered
        destroyOnClose
        title="Apply Coupon?"
      >
        {couponPreview && (
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Original Amount</span>
                <span>${couponPreview.amount}</span>
              </div>

              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discounted Amount</span>
                <span>${couponPreview.discountedAmount}</span>
              </div>

              <div className="text-xs text-muted-foreground">
                You save $
                {(
                  couponPreview.amount - couponPreview.discountedAmount
                ).toFixed(2)}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCouponModal(false)}
                className="text-white"
              >
                Cancel
              </Button>

              <Button
                className="bg-emerald-600 text-white"
                onClick={handleApplyCoupon}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardWithSidebarLayout>
  );
}
