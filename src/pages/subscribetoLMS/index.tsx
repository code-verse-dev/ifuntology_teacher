import { useEffect, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, Check } from "lucide-react";

type SubscriptionPlan = {
    id: string;
    name: string;
    price: string;
    priceValue: number; // Added for calculation
    duration: string;
    features: string[];
    theme: {
        bg: string;
        border: string;
        iconBg: string;
        iconColor: string;
        titleColor: string;
        priceColor: string;
        checkColor: string;
    };
};

const plans: SubscriptionPlan[] = [
    {
        id: "funtology",
        name: "Funtology",
        price: "$299.99",
        priceValue: 299.99,
        duration: "/ 12 months",
        features: [
            "Web-based access",
            "Interactive lessons",
            "Quizzes & Tests",
            "Student progress tracking",
        ],
        theme: {
            bg: "bg-pink-50",
            border: "border-pink-300",
            iconBg: "bg-pink-500",
            iconColor: "text-white",
            titleColor: "text-foreground",
            priceColor: "text-pink-600",
            checkColor: "text-pink-500",
        },
    },
    {
        id: "barbertology",
        name: "Barbertology",
        price: "$299.99",
        priceValue: 299.99,
        duration: "/ 12 months",
        features: [
            "Web-based access",
            "Interactive lessons",
            "Quizzes & Tests",
            "Student progress tracking",
        ],
        theme: {
            bg: "bg-[#FDF8E8]",
            border: "border-[#D4B36A]",
            iconBg: "bg-[#A68A3E]",
            iconColor: "text-white",
            titleColor: "text-foreground",
            priceColor: "text-[#A68A3E]",
            checkColor: "text-[#A68A3E]",
        },
    },
    {
        id: "nailtology",
        name: "Nailtology",
        price: "$299.99",
        priceValue: 299.99,
        duration: "/ 12 months",
        features: [
            "Web-based access",
            "Interactive lessons",
            "Quizzes & Tests",
            "Student progress tracking",
        ],
        theme: {
            bg: "bg-teal-50",
            border: "border-teal-300",
            iconBg: "bg-teal-500",
            iconColor: "text-white",
            titleColor: "text-foreground",
            priceColor: "text-teal-600",
            checkColor: "text-teal-500",
        },
    },
    {
        id: "skintology",
        name: "Skintology",
        price: "$299.99",
        priceValue: 299.99,
        duration: "/ 12 months",
        features: [
            "Web-based access",
            "Interactive lessons",
            "Quizzes & Tests",
            "Student progress tracking",
        ],
        theme: {
            bg: "bg-green-50",
            border: "border-green-300",
            iconBg: "bg-green-500",
            iconColor: "text-white",
            titleColor: "text-foreground",
            priceColor: "text-green-600",
            checkColor: "text-green-500",
        },
    },
];

export default function SubscribetoLMS() {
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [numStudents, setNumStudents] = useState<number>(12); // Default to 12 as per image

    useEffect(() => {
        document.title = "Subscribe to LMS • iFuntology Teacher";
    }, []);

    const totalAmount = selectedPlan ? selectedPlan.priceValue * numStudents : 0;

    return (
        <DashboardWithSidebarLayout>
            <section className="mx-auto w-full space-y-6">
                <h1 className="text-2xl font-extrabold">Subscribe to LMS</h1>

                {/* Subscription Cards Grid */}
                <div className="max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`relative overflow-hidden rounded-2xl border-2 p-8 shadow-sm ${plan.theme.bg} ${plan.theme.border}`}
                            >
                                <div className="flex flex-col h-full justify-between">
                                    <div>
                                        {/* Icon */}
                                        <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl shadow-sm ${plan.theme.iconBg} ${plan.theme.iconColor}`}>
                                            <GraduationCap className="h-8 w-8" />
                                        </div>

                                        {/* Title & Price */}
                                        <h3 className="mb-2 text-2xl font-bold text-slate-900">{plan.name}</h3>
                                        <div className="mb-6 flex items-baseline">
                                            <span className={`text-3xl font-bold ${plan.theme.priceColor}`}>
                                                {plan.price}
                                            </span>
                                            <span className="ml-2 text-sm text-slate-600 font-medium">
                                                {plan.duration}
                                            </span>
                                        </div>

                                        {/* Features */}
                                        <ul className="mb-8 space-y-3">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3">
                                                    <Check className={`h-5 w-5 ${plan.theme.checkColor}`} />
                                                    <span className="text-sm font-medium text-slate-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Button */}
                                    <Button
                                        className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 text-base shadow-lg"
                                        onClick={() => setSelectedPlan(plan)}
                                    >
                                        Subscribe Now
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Subscription Dialog */}
                <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white/95 dark:bg-popover/95 backdrop-blur-xl">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl font-bold">Subscribe to {selectedPlan?.name}</DialogTitle>
                            <DialogDescription>
                                Number of Students
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6 pt-2 space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="students" className="text-sm font-medium">
                                    Number of Students <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="students"
                                    type="number"
                                    min={1}
                                    value={numStudents}
                                    onChange={(e) => setNumStudents(parseInt(e.target.value) || 0)}
                                    className="h-12 rounded-xl border-border/60 bg-white dark:bg-secondary/50"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Must match the number of physical kits purchased.
                                </p>
                            </div>

                            {/* Calculation Summary Box */}
                            <div className="rounded-xl border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20 p-4 space-y-2 text-sm">
                                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                                    <span>Subscription:</span>
                                    <span className="font-medium">${selectedPlan?.priceValue.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                                    <span>Students:</span>
                                    <span className="font-medium">{numStudents}</span>
                                </div>
                                <div className="my-2 border-t border-orange-200/60 dark:border-orange-500/30" />
                                <div className="flex justify-between font-bold text-orange-600 dark:text-orange-400 text-base">
                                    <span>Total</span>
                                    <span>${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-0 gap-3 sm:gap-4 flex-col sm:flex-row">
                            <Button variant="outline" className="w-full rounded-full border-slate-300 dark:border-border dark:text-foreground" onClick={() => setSelectedPlan(null)}>
                                Request via PO
                            </Button>
                            <Button
                                variant="gradient-green"
                                className="w-full rounded-full"
                            >
                                Pay with Credit Card
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </section>
        </DashboardWithSidebarLayout>
    );
}
