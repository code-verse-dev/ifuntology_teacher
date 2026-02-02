import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CreditCard } from "lucide-react";

export default function PaymentPage() {
    return (
        <DashboardWithSidebarLayout>
            <section className="mx-auto w-full max-w-7xl space-y-6">
                <Link to="/enrichment-store/checkout" className="text-sm text-muted-foreground">
                    &lt; Back to Checkout
                </Link>

                <h1 className="text-2xl font-extrabold">Payment</h1>

                <Card className="rounded-2xl border border-border/60 p-12">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <div className="rounded-full bg-emerald-100 dark:bg-emerald-950/30 p-6">
                            <CreditCard className="h-16 w-16 text-emerald-600" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Payment Processing</h2>
                            <p className="text-muted-foreground max-w-md">
                                This is where the payment processing interface will be implemented. Payment gateway integration will be added here.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Link to="/enrichment-store/checkout">
                                <Button variant="outline">Back to Checkout</Button>
                            </Link>
                            <Link to="/enrichment-store">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </section>
        </DashboardWithSidebarLayout>
    );
}
