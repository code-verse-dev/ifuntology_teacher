import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, BookOpen, Award, Users, Clock, Loader2 } from "lucide-react";
import { useGetMySubscriptionsQuery } from "@/redux/services/apiSlices/subscriptionSlice";
import { useLocation } from "react-router-dom";

const COURSE_THEMES: Record<string, { bg: string; border: string; iconBg: string; iconColor: string; progressColor: string }> = {
    Funtology: {
        bg: "bg-pink-50",
        border: "border-pink-300",
        iconBg: "bg-pink-500",
        iconColor: "text-white",
        progressColor: "bg-lime-500",
    },
    Barbertology: {
        bg: "bg-[#FDF8E8]",
        border: "border-[#D4B36A]",
        iconBg: "bg-[#A68A3E]",
        iconColor: "text-white",
        progressColor: "bg-lime-500",
    },
    Nailtology: {
        bg: "bg-teal-50",
        border: "border-teal-300",
        iconBg: "bg-teal-500",
        iconColor: "text-white",
        progressColor: "bg-lime-500",
    },
    Skintology: {
        bg: "bg-green-50",
        border: "border-green-300",
        iconBg: "bg-green-500",
        iconColor: "text-white",
        progressColor: "bg-lime-500",
    },
};

const DEFAULT_THEME = {
    bg: "bg-slate-50",
    border: "border-slate-300",
    iconBg: "bg-slate-500",
    iconColor: "text-white",
    progressColor: "bg-lime-500",
};

function formatExpiresDate(dateStr: string | undefined): string {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
    } catch {
        return "—";
    }
}

export default function MyCourses() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        document.title = "My Courses • iFuntology Teacher";
    }, []);

    const fromPayment = location.state?.from === "/payment" || location.state?.from === "/subscribe-to-lms";
    const [polling, setPolling] = useState(fromPayment);

    const { data: subscriptions, refetch, isLoading } = useGetMySubscriptionsQuery(
        { status: "ACTIVE" }
    );

    useEffect(() => {
        if (fromPayment) {
            setPolling(true);
            
            const timer = setTimeout(() => {
                refetch();
                setPolling(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [fromPayment]);

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
                    <p className="text-slate-700 text-center py-12 font-medium text-lg">No courses found.</p>
                </section>
            </DashboardWithSidebarLayout>
        );
    }

    return (
        <DashboardWithSidebarLayout>
            <section className="mx-auto w-full space-y-6">
                <h1 className="text-2xl font-extrabold">My Courses</h1>

                {/* Courses Grid - one card per subscription (one per course type at a time) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subscriptionsData.map((sub: any) => {
                        const course = sub?.course ?? {};
                        const courseType = sub?.courseType ?? course?.courseType ?? "Course";
                        const theme = COURSE_THEMES[courseType] ?? DEFAULT_THEME;
                        const totalModules = sub?.totalModules ?? course?.totalModules ?? 18;
                        const usedModules = sub?.usedModules ?? 0;
                        const modulesDisplay = `${totalModules}`;
                        const coverage = 68; // dummy for now

                        return (
                            <Card
                                key={sub._id}
                                className={`flex flex-col justify-between overflow-hidden rounded-2xl border-2 p-6 shadow-sm ${theme.bg} ${theme.border}`}
                            >
                                <div>
                                    {/* Header: Icon + Title + Desc */}
                                    <div className="flex gap-4 mb-6">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${theme.iconBg} ${theme.iconColor}`}>
                                            <GraduationCap className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{courseType}</h3>
                                            <p className="text-sm text-slate-600 leading-snug">
                                                {course?.description ?? ""}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar - coverage dummy */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                                            <span>Course Coverage</span>
                                            <span>{sub?.averageProgress}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-black/10">
                                            <div
                                                className={`h-full rounded-full ${theme.progressColor}`}
                                                style={{ width: `${sub?.averageProgress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="rounded-xl bg-white/60 p-3">
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                <span>Modules</span>
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">{modulesDisplay}</div>
                                        </div>

                                        <div className="rounded-xl bg-white/60 p-3">
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                                                <Award className="h-3.5 w-3.5" />
                                                <span>Certificates Issued (Students)</span>
                                            </div>
                                            <div className="text-sm font-bold text-orange-600">{sub?.certificatesIssued ?? 0}</div>
                                        </div>

                                        <div className="rounded-xl bg-white/60 p-3">
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>Students</span>
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">{sub?.usedSeats ?? 0}</div>
                                        </div>

                                        <div className="rounded-xl bg-white/60 p-3">
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>Expires</span>
                                            </div>
                                            <div className="text-sm font-bold text-slate-900">{formatExpiresDate(sub?.endDate)}</div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 text-sm shadow-md"
                                    onClick={() => navigate(`/my-courses/${sub.course.courseType}`)}
                                >
                                    View Course
                                </Button>
                            </Card>
                        );
                    })}
                </div>
            </section>
        </DashboardWithSidebarLayout>
    );
}
