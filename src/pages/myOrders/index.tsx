import { useEffect } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, CreditCard, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Order = {
    orderNumber: string;
    date: string;
    products: string;
    qty: number;
    totalPrice: string;
    status: "Approved" | "Delivered" | "Pending" | "Cancelled";
};

const sampleOrders: Order[] = [
    {
        orderNumber: "12345",
        date: "12/8/2025",
        products: "Funtology Starter Kit x 12",
        qty: 3,
        totalPrice: "$9,060",
        status: "Approved",
    },
    {
        orderNumber: "12345",
        date: "12/15/2025",
        products: "Student Workbook Bundle x 12",
        qty: 2,
        totalPrice: "$4,150",
        status: "Delivered",
    },
    {
        orderNumber: "12345",
        date: "12/8/2025",
        products: "Nailtology Complete Kit x 10",
        qty: 2,
        totalPrice: "$4,872",
        status: "Pending",
    },
    {
        orderNumber: "12345",
        date: "12/15/2025",
        products: "Skintology Advanced Kit x 15",
        qty: 2,
        totalPrice: "$6,872",
        status: "Cancelled",
    },
    {
        orderNumber: "12345",
        date: "12/8/2025",
        products: "Nailtology Complete Kit x 10",
        qty: 2,
        totalPrice: "$4,872",
        status: "Cancelled",
    },
];

const getStatusColor = (status: Order["status"]) => {
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

export default function MyOrdersPage() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "My Orders • iFuntology Teacher";
    }, []);

    const handleViewOrder = (orderNumber: string) => {
        // Navigate to order details page (to be created later)
        navigate(`/my-orders/${orderNumber}`);
    };

    const handlePayInvoice = (orderNumber: string) => {
        // Navigate to pay invoice page (to be created later)
        navigate(`/my-orders/${orderNumber}/pay-invoice`);
    };

    const handleViewReceipt = (orderNumber: string) => {
        // Navigate to receipt page (to be created later)
        navigate(`/my-orders/${orderNumber}/receipt`);
    };

    return (
        <DashboardWithSidebarLayout>
            <section className="mx-auto w-full max-w-7xl space-y-6">
                <h1 className="text-2xl font-extrabold">My Orders</h1>

                {/* Search and Filter */}
                <Card className="rounded-2xl border border-border/60 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3 w-full md:w-1/2">
                            <div className="flex-1">
                                <Input placeholder="Search Order#" />
                            </div>
                            <Button variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500">
                                Filter By
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Orders Table */}
                <Card className="rounded-xl border border-border/60 p-4">
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-muted-foreground">
                                    <th className="pb-2">Order Number</th>
                                    <th className="pb-2">Date</th>
                                    <th className="pb-2">Product (s)</th>
                                    <th className="pb-2">Qty</th>
                                    <th className="pb-2">Total Price</th>
                                    <th className="pb-2">Status</th>
                                    <th className="pb-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {sampleOrders.map((order, index) => (
                                    <tr key={`${order.orderNumber}-${index}`} className="align-top">
                                        <td className="py-3">
                                            <div className="font-medium">{order.orderNumber}</div>
                                        </td>
                                        <td className="py-3">{order.date}</td>
                                        <td className="py-3">{order.products}</td>
                                        <td className="py-3">{order.qty}</td>
                                        <td className="py-3">{order.totalPrice}</td>
                                        <td className="py-3">
                                            <Badge className={`${getStatusColor(order.status)} border-0`}>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                {/* Three Dots Menu */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => handleViewOrder(order.orderNumber)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handlePayInvoice(order.orderNumber)}>
                                                            <CreditCard className="h-4 w-4 mr-2" />
                                                            Pay Invoice
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleViewReceipt(order.orderNumber)}>
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            Receipt
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <div>Showing 5-8 of 24 item(s)</div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" disabled>
                                Previous
                            </Button>
                            <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                01
                            </Button>
                            <Button variant="ghost" size="sm">
                                02
                            </Button>
                            <Button variant="ghost" size="sm">
                                03
                            </Button>
                            <Button variant="ghost" size="sm">
                                04
                            </Button>
                            <Button variant="ghost" size="sm">
                                Next
                            </Button>
                        </div>
                    </div>
                </Card>
            </section>
        </DashboardWithSidebarLayout>
    );
}
