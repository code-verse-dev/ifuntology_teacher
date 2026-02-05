import { useEffect } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import { ImageUrl } from "@/utils/Functions";
import { Download } from "lucide-react";
import { useGetOrderByIdQuery } from "@/redux/services/apiSlices/orderSlice";
import { UPLOADS_URL } from "@/constants/api";

type OrderItem = {
  id: string;
  title: string;
  quantity: number;
  price: number;
  image: string;
};

// Sample order data - in a real app, this would come from an API
const sampleOrderData = {
  orderNumber: "ORD-2024-001",
  date: "12/8/2025",
  status: "Approved" as const,
  subtotal: 743.76,
  shipping: 0.0,
  total: 743.76,
  shippingAddress: "123 Education St, Learning City, LC 12345",
  items: [
    {
      id: "1",
      title: "Funtology Starter Kit",
      quantity: 12,
      price: 551.88,
      image: "product-1.png",
    },
    {
      id: "2",
      title: "Student Workbook Bundle",
      quantity: 12,
      price: 191.88,
      image: "product-2.png",
    },
  ],
};

const getStatusColor = (
  status: "processing" | "shipped" | "completed" | "cancelled"
) => {
  switch (status) {
    case "processing":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
    case "completed":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";
    case "shipped":
      return "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400";
    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400";
  }
};

export default function MyOrderDetails() {
  const { id } = useParams();
  const { data, error, isLoading } = useGetOrderByIdQuery(id!);
  const orderDetails = data?.data;

  useEffect(() => {
    document.title = "Order Details • iFuntology Teacher";
  }, []);

  const handleDownloadInvoice = () => {
    // Handle invoice download
    console.log("Downloading invoice for order:", id);
  };

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full  space-y-6">
        <Link to="/my-orders" className="text-sm text-muted-foreground">
          &lt; Back to My Orders
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
              <span className="text-sm text-muted-foreground">
                Loading order details...
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold">Order Details</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  #{orderDetails._id}
                </p>
              </div>
              <Badge
                className={`${getStatusColor(
                  "processing"
                )} border-0 text-sm px-3 py-1`}
              >
                {orderDetails.status}
              </Badge>
            </div>

            <Card className="rounded-2xl border border-border/60 p-6">
              <div className="space-y-6">
                {/* Payment Summary - At the Top */}
                <div className="rounded-lg border border-border/60 bg-card p-6">
                  <h2 className="text-lg font-semibold text-orange-500 mb-4">
                    Payment Summary
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      {orderDetails?.cart?.coupon ? (
                        <span className="line-through text-gray-400 mr-2">
                          ${orderDetails?.cart?.subtotal?.toFixed(2)}
                        </span>
                      ) : (
                        <span className="font-medium">
                          ${orderDetails?.cart?.subtotal?.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {orderDetails?.cart?.coupon && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount:</span>
                        <span className="text-green-600 font-semibold">
                          -$
                          {(
                            (orderDetails?.cart?.subtotal ?? 0) -
                            (orderDetails?.cart?.total ?? 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span className="font-medium">
                        $
                        {orderDetails?.cart?.shipping
                          ? orderDetails.cart.shipping.toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border/60">
                      <span className="font-semibold">Total:</span>
                      <span className="font-semibold text-orange-500 text-lg">
                        ${orderDetails?.cart?.total?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="rounded-lg border border-border/60 p-4">
                  <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                  <div className="space-y-3">
                    {Array.isArray(orderDetails?.cart?.items) &&
                      orderDetails?.cart?.items.map((item: any) => (
                        <div
                          key={item.product._id}
                          className="flex items-center gap-4 bg-secondary/5 rounded-lg p-4"
                        >
                          <div className="h-20 w-20 overflow-hidden rounded-md bg-muted flex-shrink-0">
                            <img
                              src={UPLOADS_URL + item.product.image}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              {item.product.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-lg">
                              ${item.total.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="rounded-lg border border-border/60 p-4">
                  <h2 className="text-lg font-semibold mb-2">
                    Shipping Address
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {orderDetails?.cart?.orderDetails?.streetAddress}
                  </p>
                </div>

                {/* Download Invoice Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                    onClick={handleDownloadInvoice}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </section>
    </DashboardWithSidebarLayout>
  );
}
