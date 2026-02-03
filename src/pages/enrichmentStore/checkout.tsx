import { useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/context/cart.store";
import { ImageUrl } from "@/utils/Functions";
import { Link, useNavigate } from "react-router-dom";
import { Info } from "lucide-react";

export default function CheckoutPage() {
    const { items, totalAmount } = useCart();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        country: "United States",
        streetAddress: "",
        city: "",
        state: "",
        apartment: "",
        zipCode: "",
        organizationName: "",
        email: "",
        couponCode: "",
        exemptTax: false,
        orderNotes: "",
    });

    const subtotal = totalAmount;
    const tax = +(subtotal * 0.08).toFixed(2);
    const shipping = items.length ? 99.95 : 0;
    const total = +(subtotal + tax + shipping).toFixed(2);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handlePlaceOrder = () => {
        // Navigate to payment page
        navigate("/enrichment-store/payment");
    };

    return (
        <DashboardWithSidebarLayout>
            <section className="mx-auto w-full  space-y-6">
                <Link to="/cart" className="text-sm text-muted-foreground">
                    &lt; Back to Cart
                </Link>

                <h1 className="text-2xl font-extrabold">Checkout</h1>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Coupon Code Section */}
                        <Card className="rounded-2xl border border-border/60 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm text-emerald-600">Coupon Code</span>
                            </div>
                            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-3 mb-4">
                                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                    Write FJN25 in the coupon bar to get 25% off
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Enter Code"
                                    value={formData.couponCode}
                                    onChange={(e) => handleInputChange("couponCode", e.target.value)}
                                    className="flex-1"
                                />
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Apply Coupon
                                </Button>
                            </div>
                        </Card>

                        {/* Billing & Shipping Section */}
                        <Card className="rounded-2xl border border-border/60 p-6">
                            <h2 className="text-lg font-semibold mb-6">Billing & Shipping</h2>

                            <div className="space-y-4">
                                {/* First Name & Last Name */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">
                                            First Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="firstName"
                                            placeholder="Enter Name"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">
                                            Last Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Enter Name"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Country / Region */}
                                <div className="space-y-2">
                                    <Label htmlFor="country">
                                        Country / Region <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                                        <SelectTrigger id="country">
                                            <SelectValue placeholder="Select Country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="United States">United States</SelectItem>
                                            <SelectItem value="Canada">Canada</SelectItem>
                                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                            <SelectItem value="Australia">Australia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Street Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="streetAddress">
                                        Street Address <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="streetAddress"
                                        placeholder="Enter Address"
                                        value={formData.streetAddress}
                                        onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                                    />
                                </div>

                                {/* City & State */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">
                                            City <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="city"
                                            placeholder="Enter City"
                                            value={formData.city}
                                            onChange={(e) => handleInputChange("city", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">
                                            State <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="state"
                                            placeholder="Enter State"
                                            value={formData.state}
                                            onChange={(e) => handleInputChange("state", e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Apartment & Zip Code */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="apartment">Apartment / Suite / Unit (Optional)</Label>
                                        <Input
                                            id="apartment"
                                            placeholder="Enter Country"
                                            value={formData.apartment}
                                            onChange={(e) => handleInputChange("apartment", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="zipCode">
                                            Zip Code <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="zipCode"
                                            placeholder="Enter Zip Code"
                                            value={formData.zipCode}
                                            onChange={(e) => handleInputChange("zipCode", e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Organization Name & Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="organizationName">
                                            Organization Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="organizationName"
                                            placeholder="Enter Name"
                                            value={formData.organizationName}
                                            onChange={(e) => handleInputChange("organizationName", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Email Address <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter Email Address"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Tax Exempt Details */}
                        <Card className="rounded-2xl border border-border/60 p-6">
                            <h2 className="text-lg font-semibold mb-4">Tax Exempt Details</h2>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="exemptTax"
                                    checked={formData.exemptTax}
                                    onCheckedChange={(checked) => handleInputChange("exemptTax", checked as boolean)}
                                />
                                <Label htmlFor="exemptTax" className="text-sm font-normal cursor-pointer">
                                    Exempt Tax (Optional)
                                </Label>
                            </div>
                        </Card>

                        {/* Additional Information */}
                        <Card className="rounded-2xl border border-border/60 p-6">
                            <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
                            <div className="space-y-2">
                                <Label htmlFor="orderNotes">Order Notes (Optional)</Label>
                                <Textarea
                                    id="orderNotes"
                                    placeholder="Write notes about your order..."
                                    value={formData.orderNotes}
                                    onChange={(e) => handleInputChange("orderNotes", e.target.value)}
                                    rows={5}
                                    className="resize-none"
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="rounded-2xl border border-border/60 p-6 sticky top-6">
                            <h2 className="text-lg font-semibold mb-4">Your Order</h2>

                            {/* Order Items */}
                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="h-16 w-16 overflow-hidden rounded-md bg-muted flex-shrink-0">
                                            <img
                                                src={ImageUrl(item.image || "product-1.png")}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{item.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.title.includes("Dozen") ? "(Dozen)" : ""}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Quantity: {item.qty}</div>
                                        </div>
                                        <div className="font-semibold text-sm">${(item.price * item.qty).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Totals */}
                            <div className="space-y-3 border-t border-border/60 pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax:</span>
                                    <span className="font-medium">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping:</span>
                                    <span className="font-medium">${shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-base pt-3 border-t border-border/60">
                                    <span>Total:</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment Info Notice */}
                            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/60">
                                <p className="text-xs text-muted-foreground text-center">
                                    Your personal data will be used to process your order, support your experience throughout this
                                    website, and for other purposes described in our{" "}
                                    <span className="text-emerald-600 underline cursor-pointer">privacy policy</span>.
                                </p>
                            </div>

                            {/* Place Order Button */}
                            <Button
                                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={handlePlaceOrder}
                                disabled={items.length === 0}
                            >
                                Place Order
                            </Button>
                        </Card>
                    </div>
                </div>
            </section>
        </DashboardWithSidebarLayout>
    );
}
