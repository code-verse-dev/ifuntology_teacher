import { useEffect } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Check } from "lucide-react";

type SubscriptionPlan = {
    id: string;
    name: string;
    price: string;
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
    useEffect(() => {
        document.title = "Subscribe to LMS • iFuntology Teacher";
    }, []);

    return (
        <DashboardWithSidebarLayout>
            <section className="mx-auto w-full max-w-7xl space-y-6">
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
                                    <Button className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 text-base shadow-lg">
                                        Subscribe Now
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

            </section>
        </DashboardWithSidebarLayout>
    );
}
