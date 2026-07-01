import { useEffect, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, Check, Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetAllSettingsQuery } from "@/redux/services/apiSlices/settingSlice";
import { useGetCoursesQuery } from "@/redux/services/apiSlices/courseSlice";
import { useGetProductByCourseTypeQuery } from "@/redux/services/apiSlices/productSlice";
import { useGetMySubscriptionsQuery } from "@/redux/services/apiSlices/subscriptionSlice";
import { useNavigate } from "react-router-dom";
import { useUtilizePurchaseOrderMutation } from "@/redux/services/apiSlices/purchaseOrderSlice";
import { toast } from "sonner";

type CourseTheme = {
    accentBar: string;
    iconBg: string;
    buttonClass: string;
};

const COURSE_THEMES: Record<string, CourseTheme> = {
    Funtology: {
        accentBar: "bg-rose-500",
        iconBg: "bg-rose-500",
        buttonClass:
            "border-rose-500 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300",
    },
    Barbertology: {
        accentBar: "bg-amber-500",
        iconBg: "bg-amber-500",
        buttonClass:
            "border-amber-500 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300",
    },
    Nailtology: {
        accentBar: "bg-teal-500",
        iconBg: "bg-teal-500",
        buttonClass:
            "border-teal-500 text-teal-400 hover:bg-teal-500/10 hover:text-teal-300",
    },
    Skintology: {
        accentBar: "bg-emerald-500",
        iconBg: "bg-emerald-500",
        buttonClass:
            "border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300",
    },
    "iTeach iFuntology": {
        accentBar: "bg-violet-500",
        iconBg: "bg-violet-500",
        buttonClass:
            "border-violet-500 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300",
    },
    "iFuntology Braiding": {
        accentBar: "bg-orange-500",
        iconBg: "bg-orange-500",
        buttonClass:
            "border-orange-500 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300",
    },
};

const DEFAULT_THEME = COURSE_THEMES.Funtology;

const DEFAULT_FEATURES = [
    "Web-based access",
    "Interactive lessons",
    "Quizzes & Tests",
    "Student progress tracking",
];

function getThemeForCourseType(courseType: string): CourseTheme {
    const found = Object.entries(COURSE_THEMES).find(
        ([name]) => name.toLowerCase() === (courseType ?? "").toLowerCase()
    );
    return found?.[1] ?? DEFAULT_THEME;
}

function CourseCard({
    course,
    onSelect,
    activeSubscriptionId,
    onViewCourse,
}: {
    course: any;
    onSelect: (course: any) => void;
    activeSubscriptionId: string | null;
    onViewCourse: (subscriptionId: string) => void;
}) {
    const courseType = course?.courseType ?? "Funtology";
    const theme = getThemeForCourseType(courseType);
    const features = Array.isArray(course?.features) && course.features.length > 0
        ? course.features
        : DEFAULT_FEATURES;
    const description =
        course?.description?.trim() ||
        "Explore lessons, modules, and assessments for this course.";

    return (
        <Card className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-stretch">
                <div className={cn("h-1 w-full shrink-0 lg:h-auto lg:w-1", theme.accentBar)} />

                {/* Title & description */}
                <div className="flex flex-1 items-start gap-4 p-5 sm:p-6 lg:max-w-[34%]">
                    <div
                        className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
                            theme.iconBg
                        )}
                    >
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xl font-bold leading-tight text-white sm:text-2xl">
                            {courseType}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-400">
                            {description}
                        </p>
                    </div>
                </div>

                {/* Features */}
                <div className="border-t border-slate-800 px-5 py-5 sm:px-6 lg:flex-1 lg:border-l lg:border-t-0">
                    <ul className="space-y-2.5">
                        {features.map((feature: string) => (
                            <li key={feature} className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                        theme.iconBg
                                    )}
                                >
                                    <Check className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-sm font-medium text-slate-200">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Action */}
                <div className="flex items-center justify-center border-t border-slate-800 px-5 py-5 sm:px-6 lg:min-w-[200px] lg:border-l lg:border-t-0">
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full rounded-full border-2 bg-transparent px-6 py-5 text-sm font-semibold shadow-none",
                            theme.buttonClass
                        )}
                        onClick={() =>
                            activeSubscriptionId
                                ? onViewCourse(activeSubscriptionId)
                                : onSelect(course)
                        }
                    >
                        {activeSubscriptionId ? "View Course" : "Enroll Now"}
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export default function SubscribetoLMS() {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<{ name: string } | null>(null);
    const [numStudents, setNumStudents] = useState<number>(12); // Default to 12 as per image
    const [subscriptionType, setSubscriptionType] = useState<string>("MONTHLY");
    const [isPODialogOpen, setIsPODialogOpen] = useState(false);
    const [poNumber, setPoNumber] = useState("");
    const [utilizePurchaseOrder, { isLoading: isUtilizingPO }] = useUtilizePurchaseOrderMutation();
    const { data: settingData } = useGetAllSettingsQuery({});
    const [monthlyFee, setMonthlyFee] = useState<number>(0);
    const [yearlyFee, setYearlyFee] = useState<number>(0);
    const [taxPercent, setTaxPercent] = useState<number>(0);
    const { data: coursesResponse, isLoading: coursesLoading } = useGetCoursesQuery();
    const { data: mySubscriptions } = useGetMySubscriptionsQuery({ status: "ACTIVE" });
    const subscriptionsDocs = mySubscriptions?.data?.docs ?? [];
    const activeSubscriptionByCourseType: Record<string, { _id: string }> = {};
    subscriptionsDocs.forEach((sub: any) => {
        const ct = sub?.courseType ?? sub?.course?.courseType;
        if (ct) activeSubscriptionByCourseType[ct] = { _id: sub._id };
    });

    const courseList = Array.isArray(coursesResponse?.data)
        ? [...coursesResponse.data].sort(
              (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
          )
        : [];

    // const courseTypeForPrice = selectedPlan?.name ?? "Funtology";
    const [courseTypeForPrice, setCourseTypeForPrice] = useState("Funtology");
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
    const lmsUnitPrice = subscriptionType === "YEARLY" ? yearlyFee : monthlyFee;
    const lmsUnitLabel = subscriptionType === "YEARLY" ? "YEARLY" : "MONTHLY";
    const lmsQty = Math.max(0, Number(numStudents) || 0);
    const kitPrice = Number(productByCourse?.data?.price) || 0;
    const lmsSubtotal = lmsQty * lmsUnitPrice + lmsQty * kitPrice;
    const lmsTax = lmsSubtotal * (taxPercent / 100);
    const lmsTotal = lmsSubtotal + lmsTax;

    const handleSubscribeNow = (course: any) => {
        navigate("/shop", {
            state: { prefillLmsCourseType: course?.courseType ?? "Funtology" },
        });
    };
    const handlePayWithCreditCard = () => {
        navigate("/payment", {
            state: {
                total: lmsTotal,
                subscriptionType: subscriptionType,
                numberOfSeats: numStudents,
                courseType: courseTypeForPrice,
                type: "SUBSCRIPTION"
            },
        });
    };

    const handlePurchaseViaPO = async () => {
        if (!poNumber.trim()) {
            toast.error("Please enter a PO number.");
            return;
        }
        try {
            const res: any = await utilizePurchaseOrder({
                serviceType: "lms",
                poNumber: poNumber.trim(),
                subscriptionType: subscriptionType.toLowerCase(),
                courseType: courseTypeForPrice,
                noOfStudents: numStudents,
            }).unwrap();
            if (res.status) {
                toast.success(res.message ?? "Purchase order applied successfully.");
                setIsPODialogOpen(false);
                setSelectedPlan(null);
                setPoNumber("");
                navigate("/my-courses", { state: { from: "/subscribe-to-lms" } });
            } else {
                toast.error(res.message ?? "Failed to apply purchase order.");
            }
        } catch (error: any) {
            toast.error(error?.data?.message ?? "Failed to apply purchase order.");
        }
    };


    return (
        <DashboardWithSidebarLayout>
            <section className="mx-auto w-full space-y-6">
                <h1 className="text-2xl font-extrabold">Subscribe to LMS</h1>

                {/* Subscription Cards */}
                <div className="w-full">
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
                        <div className="flex flex-col gap-4">
                            {courseList.map((course: any) => (
                                <CourseCard
                                    key={course._id}
                                    course={course}
                                    onSelect={handleSubscribeNow}
                                    activeSubscriptionId={
                                        activeSubscriptionByCourseType[course?.courseType]?._id ?? null
                                    }
                                    onViewCourse={() => navigate(`/my-courses/${course?.courseType}`)}
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
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="YEARLY">Yearly</option>
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
                                    placeholder="e.g. 24"
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
                            <Button
                                variant="outline"
                                className="w-full rounded-full border-slate-300 dark:border-border dark:text-foreground"
                                onClick={() => { setSelectedPlan(null); setIsPODialogOpen(true); }}
                            >
                                Purchase via PO
                            </Button>
                            <Button
                                variant="gradient-green"
                                className="w-full rounded-full"
                                onClick={handlePayWithCreditCard}
                            >
                                Pay with Credit Card
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </section>

            {/* Purchase via PO Dialog */}
            <Dialog open={isPODialogOpen} onOpenChange={(open) => { setIsPODialogOpen(open); if (!open) setPoNumber(""); }}>
                <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-white/95 dark:bg-popover/95 backdrop-blur-xl">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-xl font-bold">Purchase via PO</DialogTitle>
                        <DialogDescription>
                            Enter your Purchase Order number to complete the subscription.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 pt-2 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                PO Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="PO-2026-0042"
                                value={poNumber}
                                onChange={(e) => setPoNumber(e.target.value)}
                                className="h-12 rounded-xl border-border/60 bg-white dark:bg-secondary/50"
                                disabled={isUtilizingPO}
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-6 pt-0 gap-3 sm:gap-4 flex-col sm:flex-row">
                        <Button
                            variant="outline"
                            className="w-full rounded-full border-slate-300 dark:border-border dark:text-foreground"
                            onClick={() => { setIsPODialogOpen(false); setPoNumber(""); }}
                            disabled={isUtilizingPO}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="gradient-green"
                            className="w-full rounded-full"
                            onClick={handlePurchaseViaPO}
                            disabled={isUtilizingPO}
                        >
                            {isUtilizingPO ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardWithSidebarLayout>
    );
}
