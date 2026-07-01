import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Award, BookOpen, Check, GraduationCap, Loader2, Users } from "lucide-react";
import { useGetMySubscriptionsQuery } from "@/redux/services/apiSlices/subscriptionSlice";
import { cn } from "@/lib/utils";

const COURSE_THEMES: Record<
    string,
    {
        panel: string;
        button: string;
        statIcon: string;
    }
> = {
    Funtology: {
        panel: "bg-gradient-to-br from-[#c6285c] to-[#7b1538]",
        button: "bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800",
        statIcon: "bg-rose-500/20 text-rose-300",
    },
    Barbertology: {
        panel: "bg-gradient-to-br from-[#c9a227] to-[#7a5f12]",
        button: "bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800",
        statIcon: "bg-amber-500/20 text-amber-200",
    },
    Nailtology: {
        panel: "bg-gradient-to-br from-[#00838f] to-[#004d56]",
        button: "bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800",
        statIcon: "bg-teal-500/20 text-teal-200",
    },
    Skintology: {
        panel: "bg-gradient-to-br from-[#43a047] to-[#1b5e20]",
        button: "bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800",
        statIcon: "bg-emerald-500/20 text-emerald-200",
    },
};

const DEFAULT_THEME = COURSE_THEMES.Funtology;

const COURSE_FEATURES: Record<string, string[]> = {
    Funtology: [
        "DIY crafts, hair, makeup & skincare basics",
        "Interactive video lessons",
        "Quizzes & assessments",
        "Progress tracking",
    ],
    Barbertology: [
        "Haircutting, styling & barbering skills",
        "Interactive video lessons",
        "Quizzes & assessments",
        "Certificate eligibility",
    ],
    Nailtology: [
        "Nail art, design & nail care",
        "Interactive video lessons",
        "Quizzes & assessments",
        "Certificate eligibility",
    ],
    Skintology: [
        "Skincare routines & beauty wellness",
        "Interactive video lessons",
        "Quizzes & assessments",
        "Certificate eligibility",
    ],
};

const DEFAULT_FEATURES = [
    "Web-based access",
    "Interactive lessons",
    "Quizzes & tests",
    "Student progress tracking",
];

function MiniStat({
    icon: Icon,
    label,
    value,
    iconClass,
}: {
    icon: typeof BookOpen;
    label: string;
    value: string | number;
    iconClass: string;
}) {
    return (
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white/5 px-2.5 py-2 ring-1 ring-white/10">
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", iconClass)}>
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
                <p className="truncate text-[10px] font-medium text-slate-400">{label}</p>
                <p className="text-sm font-bold leading-tight text-white">{value}</p>
            </div>
        </div>
    );
}

export default function MyCourses() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        document.title = "My Courses • iFuntology Teacher";
    }, []);

    const fromPayment = location.state?.from === "/payment" || location.state?.from === "/subscribe-to-lms";
    const [polling, setPolling] = useState(fromPayment);

    const { data: subscriptions, refetch, isLoading } = useGetMySubscriptionsQuery({ status: "ACTIVE" });

    useEffect(() => {
        if (fromPayment) {
            setPolling(true);

            const timer = setTimeout(() => {
                refetch();
                setPolling(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [fromPayment, refetch]);

    const subscriptionsData = subscriptions?.data?.docs ?? [];

    if (isLoading || polling) {
        return (
            <DashboardWithSidebarLayout>
                <section className="mx-auto w-full space-y-6">
                    <h1 className="text-2xl font-extrabold">My Courses</h1>
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                    </div>
                </section>
            </DashboardWithSidebarLayout>
        );
    }

    if (subscriptionsData.length === 0) {
        return (
            <DashboardWithSidebarLayout>
                <section className="mx-auto w-full space-y-6">
                    <h1 className="text-2xl font-extrabold">My Courses</h1>
                    <p className="py-12 text-center text-lg font-medium text-slate-700">No courses found.</p>
                </section>
            </DashboardWithSidebarLayout>
        );
    }

    return (
        <DashboardWithSidebarLayout>
            <section className="mx-auto w-full space-y-6">
                <h1 className="text-2xl font-extrabold">My Courses</h1>

                <div className="flex flex-col gap-4">
                    {subscriptionsData.map((sub: any) => {
                        const course = sub?.course ?? {};
                        const courseType = sub?.courseType ?? course?.courseType ?? "Course";
                        const theme = COURSE_THEMES[courseType] ?? DEFAULT_THEME;
                        const totalModules = sub?.totalModules ?? course?.totalModules ?? 0;
                        const description =
                            course?.description?.trim() ||
                            "Explore lessons, modules, and assessments for this course.";
                        const features =
                            Array.isArray(course?.features) && course.features.length > 0
                                ? course.features
                                : COURSE_FEATURES[courseType] ?? DEFAULT_FEATURES;

                        return (
                            <Card
                                key={sub._id}
                                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 shadow-sm dark:border-slate-800"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Left panel */}
                                    <div
                                        className={cn(
                                            "relative flex min-h-[140px] flex-col justify-between p-4 sm:min-h-0 sm:w-[38%] sm:p-5",
                                            theme.panel
                                        )}
                                    >
                                        <div className="pointer-events-none absolute inset-0 opacity-30">
                                            <div className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                                            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-black/10 blur-xl" />
                                        </div>

                                        <div className="relative space-y-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm">
                                                <GraduationCap className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold leading-tight text-white sm:text-xl">
                                                    {courseType}
                                                </h3>
                                                <ul className="mt-2 space-y-1">
                                                    {features.map((feature: string) => (
                                                        <li
                                                            key={feature}
                                                            className="flex items-start gap-1.5 text-[11px] leading-snug text-white/90 sm:text-xs"
                                                        >
                                                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-white/80" />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <span className="relative mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                            Active enrollment
                                        </span>
                                    </div>

                                    {/* Right panel */}
                                    <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
                                        <div>
                                            <p className="text-xs font-medium text-slate-400">About this course</p>
                                            <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-300 sm:line-clamp-5">
                                                {description}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <MiniStat
                                                icon={BookOpen}
                                                label="Modules"
                                                value={totalModules}
                                                iconClass={theme.statIcon}
                                            />
                                            <MiniStat
                                                icon={Award}
                                                label="Certificates"
                                                value={sub?.certificatesIssued ?? 0}
                                                iconClass={theme.statIcon}
                                            />
                                            <MiniStat
                                                icon={Users}
                                                label="Students"
                                                value={sub?.usedSeats ?? 0}
                                                iconClass={theme.statIcon}
                                            />
                                        </div>

                                        <Button
                                            className={cn(
                                                "h-10 w-full rounded-full text-sm font-semibold text-white shadow-md",
                                                theme.button
                                            )}
                                            onClick={() => navigate(`/my-courses/${encodeURIComponent(courseType)}`)}
                                        >
                                            View Course
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </section>
        </DashboardWithSidebarLayout>
    );
}
