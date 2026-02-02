import { useEffect } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import { ImageUrl } from "@/utils/Functions";
import { Download } from "lucide-react";

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

const getStatusColor = (status: string) => {
    switch (status) {
        case "Approved":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
        case "Delivered":
            return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";
        case "Pending":
            return "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400";
        case "Cancelled":
            return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400";
    }
};

export default function MyOrderDetails() {
    const { id } = useParams();

    useEffect(() => {
        document.title = "Order Details • iFuntology Teacher";
    }, []);

    const handleDownloadInvoice = () => {
        // Handle invoice download
        console.log("Downloading invoice for order:", id);
    };

    return (
        <DashboardWithSidebarLayout>
            <section className="mx-auto w-full max-w-7xl space-y-6">
                <Link to="/my-orders" className="text-sm text-muted-foreground">
                    &lt; Back to My Orders
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold">Order Details</h1>
                        <p className="text-sm text-muted-foreground mt-1">{sampleOrderData.orderNumber}</p>
                    </div>
                    <Badge className={`${getStatusColor(sampleOrderData.status)} border-0 text-sm px-3 py-1`}>
                        {sampleOrderData.status}
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
                                    <span className="font-medium">${sampleOrderData.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping:</span>
                                    <span className="font-medium">${sampleOrderData.shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-border/60">
                                    <span className="font-semibold">Total:</span>
                                    <span className="font-semibold text-orange-500 text-lg">
                                        ${sampleOrderData.total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="rounded-lg border border-border/60 p-4">
                            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                            <div className="space-y-3">
                                {sampleOrderData.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 bg-secondary/5 rounded-lg p-4"
                                    >
                                        <div className="h-20 w-20 overflow-hidden rounded-md bg-muted flex-shrink-0">
                                            <img
                                                src={ImageUrl(item.image)}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{item.title}</div>
                                            <div className="text-sm text-muted-foreground">Quantity: {item.quantity}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-lg">
                                                ${item.price.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="rounded-lg border border-border/60 p-4">
                            <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
                            <p className="text-sm text-muted-foreground">{sampleOrderData.shippingAddress}</p>
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
            </section>
        </DashboardWithSidebarLayout>
    );
}
