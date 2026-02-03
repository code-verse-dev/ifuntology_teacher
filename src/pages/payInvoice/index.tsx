import { useEffect, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    CreditCard,
    DollarSign,
    AlertCircle,
    CheckCircle2,
    Search,
    Filter,
    Download,
    AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Types for Invoice Data
type Invoice = {
    id: string;
    invoiceNumber: string;
    description: string;
    poNumber: string;
    amount: number;
    balance: number;
    dueDate: string;
    status: "Partial" | "Overdue" | "Pending" | "Paid";
};

// Sample Data
const sampleInvoices: Invoice[] = [
    {
        id: "1",
        invoiceNumber: "INV-2024-001",
        description: "LMS Subscriptions + Science Kits",
        poNumber: "PO-2024-001",
        amount: 9060,
        balance: 4530,
        dueDate: "12/30/2024",
        status: "Partial",
    },
    {
        id: "2",
        invoiceNumber: "INV-2024-002",
        description: "Write to Read Package + Art Kits",
        poNumber: "PO-2024-003",
        amount: 4872,
        balance: 2436,
        dueDate: "12/30/2024",
        status: "Partial",
    },
    {
        id: "3",
        invoiceNumber: "INV-2024-003",
        description: "LMS Annual Subscription Renewal",
        poNumber: "—",
        amount: 5200,
        balance: 5200,
        dueDate: "12/25/2024",
        status: "Overdue",
    },
    {
        id: "4",
        invoiceNumber: "INV-2024-004",
        description: "Physical Enrichment Kits",
        poNumber: "PO-2024-004",
        amount: 3200,
        balance: 3200,
        dueDate: "1/5/2025",
        status: "Pending",
    },
    {
        id: "5",
        invoiceNumber: "INV-2024-005",
        description: "Complete Learning Package",
        poNumber: "PO-2024-007",
        amount: 7890,
        balance: 0,
        dueDate: "12/15/2024",
        status: "Paid",
    },
];

export default function PayInvoice() {
    const navigate = useNavigate();
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const handlePayClick = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
    };

    const handleContinuePayment = () => {
        // Navigate to payment page - passing state if needed, or just navigating
        navigate("/enrichment-store/payment");
    };

    useEffect(() => {
        document.title = "Pay Invoice • iFuntology Teacher";
    }, []);

    const getStatusBadge = (status: Invoice["status"]) => {
        switch (status) {
            case "Partial":
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-normal">Partial</Badge>;
            case "Overdue":
                return <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200 border-none font-normal">Overdue</Badge>;
            case "Pending":
                return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none font-normal">Pending</Badge>;
            case "Paid":
                return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-normal">Paid</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <DashboardWithSidebarLayout>
            <section className="mx-auto w-full  space-y-6">
                <h1 className="text-2xl font-extrabold">Pay Invoice</h1>

                {/* Header Card */}
                <div className="rounded-lg bg-muted/30 p-4 border border-border/60">
                    <div className="flex items-center gap-3">
                        <div className="rounded-md bg-emerald-100 p-2 text-emerald-600">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Pay Invoice</h3>
                            <p className="text-xs text-muted-foreground">Manage and pay your invoices</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by PO number, organization, or service..."
                            className="pl-9 rounded-full bg-white dark:bg-card border-border/60"
                        />
                    </div>
                    <Button className="rounded-full bg-orange-600 hover:bg-orange-700 text-white gap-2">
                        <Filter className="h-4 w-4" />
                        Filter By
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 border border-border/60 shadow-sm rounded-xl">
                        <div className="mb-2 rounded-lg bg-orange-100 w-fit p-2 text-orange-600">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Unpaid Invoices</div>
                        <div className="text-2xl font-bold mt-1">04</div>
                    </Card>

                    <Card className="p-4 border border-border/60 shadow-sm rounded-xl">
                        <div className="mb-2 rounded-lg bg-blue-100 w-fit p-2 text-blue-600">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Total Outstanding</div>
                        <div className="text-2xl font-bold mt-1">$15,366</div>
                    </Card>

                    <Card className="p-4 border border-border/60 shadow-sm rounded-xl">
                        <div className="mb-2 rounded-lg bg-red-100 w-fit p-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Overdue Amount</div>
                        <div className="text-2xl font-bold mt-1">$5,200</div>
                    </Card>

                    <Card className="p-4 border border-border/60 shadow-sm rounded-xl">
                        <div className="mb-2 rounded-lg bg-emerald-100 w-fit p-2 text-emerald-600">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Total Paid</div>
                        <div className="text-2xl font-bold mt-1">$7,890</div>
                    </Card>
                </div>

                {/* Alert Banner */}
                <div className="rounded-lg bg-red-50 border border-red-100 p-4 flex items-start gap-3">
                    <div className="rounded-full bg-red-600 p-1 mt-0.5">
                        <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-red-900">Overdue Payment Alert</h4>
                        <p className="text-xs text-red-800 mt-1">
                            You have <span className="font-bold">$5,200</span> in overdue invoices. Please make a payment to avoid service interruption.
                        </p>
                    </div>
                </div>

                {/* Invoices Table */}
                <Card className="border border-border/60 shadow-sm rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary/20 text-muted-foreground font-medium">
                                <tr>
                                    <th className="p-4">Invoice #</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">PO Number</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Due Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {sampleInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-medium">{invoice.invoiceNumber}</td>
                                        <td className="p-4">{invoice.description}</td>
                                        <td className="p-4">{invoice.poNumber}</td>
                                        <td className="p-4">
                                            <div className="font-bold">${invoice.amount.toLocaleString()}</div>
                                            {invoice.balance > 0 && invoice.balance < invoice.amount && (
                                                <div className="text-[10px] text-muted-foreground">Balance: ${invoice.balance.toLocaleString()}</div>
                                            )}
                                            {invoice.balance === invoice.amount && invoice.status !== 'Paid' && (
                                                <div className="text-[10px] text-muted-foreground">Balance: ${invoice.balance.toLocaleString()}</div>
                                            )}
                                        </td>
                                        <td className="p-4">{invoice.dueDate}</td>
                                        <td className="p-4">
                                            {getStatusBadge(invoice.status)}
                                        </td>
                                        <td className="p-4">
                                            {invoice.status === "Paid" ? (
                                                <Button variant="ghost" size="sm" className="text-gray-500 gap-2 h-8">
                                                    <Download className="h-3.5 w-3.5" />
                                                    Receipt
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="gradient-green"
                                                    className="h-8 rounded-full px-4 text-xs"
                                                    onClick={() => handlePayClick(invoice)}
                                                >
                                                    Pay ${invoice.balance > 0 ? invoice.balance.toLocaleString() : invoice.amount.toLocaleString()}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>



                <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Select Payment Method</DialogTitle>
                            <DialogDescription>
                                Invoice: {selectedInvoice?.invoiceNumber}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            {/* Payment Summary Box */}
                            <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4">
                                <h4 className="text-sm font-bold text-orange-600 mb-3">Payment Summary</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Invoice Amount:</span>
                                        <span className="font-medium">${selectedInvoice?.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Already Paid:</span>
                                        <span className="font-medium">${selectedInvoice && (selectedInvoice.amount - selectedInvoice.balance).toLocaleString()}</span>
                                    </div>
                                    <div className="my-2 border-t border-orange-200/60" />
                                    <div className="flex justify-between font-bold text-orange-600">
                                        <span>Amount Due:</span>
                                        <span>${selectedInvoice?.balance.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" className="rounded-full w-full sm:w-auto" onClick={() => setSelectedInvoice(null)}>
                                Cancel
                            </Button>
                            <Button
                                className="rounded-full w-full sm:w-auto px-8"
                                variant="gradient-green"
                                onClick={handleContinuePayment}
                            >
                                Continue
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </section>
        </DashboardWithSidebarLayout >
    );
}
