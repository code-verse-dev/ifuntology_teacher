import { useEffect, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, Check, Loader2 } from "lucide-react";
import { useGetAllSettingsQuery } from "@/redux/services/apiSlices/settingSlice";
import { useGetCoursesQuery } from "@/redux/services/apiSlices/courseSlice";
import { useGetProductByCourseTypeQuery } from "@/redux/services/apiSlices/productSlice";

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

const PLANS_THEMES: { name: string; theme: SubscriptionPlan["theme"] }[] = [
    {
        name: "Funtology",
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
        name: "Barbertology",
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
        name: "Nailtology",
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
        name: "Skintology",
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

const defaultTheme: SubscriptionPlan["theme"] = {
    bg: "bg-slate-50",
    border: "border-slate-300",
    iconBg: "bg-slate-500",
    iconColor: "text-white",
    titleColor: "text-foreground",
    priceColor: "text-slate-600",
    checkColor: "text-slate-500",
};

function getThemeForCourseType(courseType: string): SubscriptionPlan["theme"] {
    const found = PLANS_THEMES.find(
        (p) => p.name.toLowerCase() === (courseType ?? "").toLowerCase()
    );
    return found?.theme ?? defaultTheme;
}

const HARDCODED_DURATION = "/ 12 months";
const HARDCODED_PRICE = "$299.99";
const HARDCODED_PRICE_VALUE = 299.99;

function CourseCard({
    course,
    monthlyFee,
    taxPercent,
    onSelect,
}: {
    course: any;
    monthlyFee: number;
    taxPercent: number;
    onSelect: (course: any) => void;
}) {
    const courseType = course?.courseType ?? "Funtology";
    const { data: productByCourse } = useGetProductByCourseTypeQuery({
        courseType,
    });
    const theme = getThemeForCourseType(courseType);
    const features = Array.isArray(course?.features) ? course.features : [];
    const kitPrice = Number(productByCourse?.data?.price) || 0;
    const qty = 12;
    const subtotal = qty * monthlyFee + qty * kitPrice;
    const tax = subtotal * (taxPercent / 100);
    const total = subtotal + tax;

    return (
        <Card
            className={`relative overflow-hidden rounded-2xl border-2 p-8 shadow-sm ${theme.bg} ${theme.border}`}
        >
            <div className="flex flex-col h-full justify-between">
                <div>
                    <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl shadow-sm ${theme.iconBg} ${theme.iconColor}`}>
                        <GraduationCap className="h-8 w-8" />
                    </div>

                    <h3 className="mb-2 text-2xl font-bold text-slate-900">
                        {courseType}
                    </h3>
                    <div className="mb-6 flex items-baseline">
                        <span className={`text-3xl font-bold ${theme.priceColor}`}>
                            ${total.toFixed(2)}
                        </span>
                        <span className="ml-2 text-sm text-slate-600 font-medium">
                            {HARDCODED_DURATION}
                        </span>
                    </div>

                    <ul className="mb-8 space-y-3">
                        {features.map((feature: string, i: number) => (
                            <li key={i} className="flex items-center gap-3">
                                <Check className={`h-5 w-5 ${theme.checkColor}`} />
                                <span className="text-sm font-medium text-slate-700">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <Button
                    className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 text-base shadow-lg"
                    onClick={() => onSelect(course)}
                >
                    Subscribe Now
                </Button>
            </div>
        </Card>
    );
}

export default function SubscribetoLMS() {
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [numStudents, setNumStudents] = useState<number>(12); // Default to 12 as per image
    const [subscriptionType, setSubscriptionType] = useState<string>("monthly");
    const { data: settingData } = useGetAllSettingsQuery({});
    const [monthlyFee, setMonthlyFee] = useState<number>(0);
    const [yearlyFee, setYearlyFee] = useState<number>(0);
    const [taxPercent, setTaxPercent] = useState<number>(0);
    const { data: coursesResponse, isLoading: coursesLoading } = useGetCoursesQuery();
    const courseList = Array.isArray(coursesResponse?.data)
        ? [...coursesResponse.data].sort(
              (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
          )
        : [];

    const courseTypeForPrice = selectedPlan?.name ?? "Funtology";
    const { data: productByCourse } = useGetProductByCourseTypeQuery(
        { courseType: courseTypeForPrice },
        { skip: !selectedPlan }
    );

    useEffect(() => {
        if (settingData && Array.isArray(settingData.data)) {
            const taxSetting = settingData.data.find(
                (item: any) => item.type === "tax"
            );
            if (
                taxSetting &&
                taxSetting.data &&
                typeof taxSetting.data.percentage === "number"
            ) {
                setTaxPercent(taxSetting.data.percentage);
            }
            const lmsSetting = settingData.data.find(
                (item: any) => item.type === "lms"
            );
            if (lmsSetting && lmsSetting.data) {
                if (typeof lmsSetting.data.monthlySubscriptionFee === "number")
                    setMonthlyFee(lmsSetting.data.monthlySubscriptionFee);
                if (typeof lmsSetting.data.yearlySubscriptionFee === "number")
                    setYearlyFee(lmsSetting.data.yearlySubscriptionFee);
            }
        }
    }, [settingData]);

    useEffect(() => {
        document.title = "Subscribe to LMS • iFuntology Teacher";
    }, []);

    // LMS price calc (same logic as requestQuotation when type is lms)
    const lmsUnitPrice = subscriptionType === "yearly" ? yearlyFee : monthlyFee;
    const lmsUnitLabel = subscriptionType === "yearly" ? "Yearly" : "Monthly";
    const lmsQty = Math.max(0, Number(numStudents) || 0);
    const kitPrice = Number(productByCourse?.data?.price) || 0;
    const lmsSubtotal = lmsQty * lmsUnitPrice + lmsQty * kitPrice;
    const lmsTax = lmsSubtotal * (taxPercent / 100);
    const lmsTotal = lmsSubtotal + lmsTax;

    const handleSelectCourse = (course: any) => {
        setSelectedPlan({
            id: course._id,
            name: course.courseType ?? "Course",
            price: HARDCODED_PRICE,
            priceValue: HARDCODED_PRICE_VALUE,
            duration: HARDCODED_DURATION,
            features: Array.isArray(course.features) ? course.features : [],
            theme: getThemeForCourseType(course.courseType ?? ""),
        });
    };

    return (
        <DashboardWithSidebarLayout>
            <section className="mx-auto w-full space-y-6">
                <h1 className="text-2xl font-extrabold">Subscribe to LMS</h1>

                {/* Subscription Cards Grid */}
                <div className="max-w-4xl">
                    {coursesLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading courses...</p>
                        </div>
                    ) : courseList.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            No courses available.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {courseList.map((course: any) => (
                                <CourseCard
                                    key={course._id}
                                    course={course}
                                    monthlyFee={monthlyFee}
                                    taxPercent={taxPercent}
                                    onSelect={handleSelectCourse}
                                />
                            ))}
                        </div>
                    )}
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
                                <Label className="text-sm font-medium">
                                    Subscription Type <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    className="w-full h-12 rounded-xl border border-border/60 bg-white dark:bg-secondary/50 px-3 text-sm"
                                    value={subscriptionType}
                                    onChange={(e) => setSubscriptionType(e.target.value)}
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

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

                            {/* Calculation Summary Box (same logic as requestQuotation LMS) */}
                            <div className="rounded-xl border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20 p-4 space-y-2 text-sm">
                                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                                    <span>{lmsUnitLabel} Subscriptions ({lmsQty} × ${lmsUnitPrice.toFixed(2)}):</span>
                                    <span className="font-medium">${(lmsQty * lmsUnitPrice).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                                    <span>{selectedPlan?.name} Kits ({lmsQty} × ${kitPrice.toFixed(2)}):</span>
                                    <span className="font-medium">${(lmsQty * kitPrice).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">${lmsSubtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                                    <span>Tax ({taxPercent}%):</span>
                                    <span className="font-medium">${lmsTax.toFixed(2)}</span>
                                </div>
                                <div className="my-2 border-t border-orange-200/60 dark:border-orange-500/30" />
                                <div className="flex justify-between font-bold text-orange-600 dark:text-orange-400 text-base">
                                    <span>Total</span>
                                    <span>${lmsTotal.toFixed(2)}</span>
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
