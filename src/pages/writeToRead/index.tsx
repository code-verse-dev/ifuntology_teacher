import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Wallet, BookOpen, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMyWtrSubscriptionQuery } from "@/redux/services/apiSlices/paymentSlice";
import { StudentsAndBatchesTab } from "./tabs/StudentsAndBatchesTab";
import { GradeBooksTab } from "./tabs/GradeBooksTab";
import { PrintOrdersTab } from "./tabs/PrintOrdersTab";

type WriteToReadLocationState = {
    wtrActiveTab?: "students" | "grade" | "print";
};

export default function WriteToRead() {
    const location = useLocation();
    const navigate = useNavigate();
    const { data: wtrRes } = useGetMyWtrSubscriptionQuery();
    const wtrSub = wtrRes?.status && wtrRes?.data ? wtrRes.data : null;

    const renewalLabel = (() => {
        if (!wtrSub?.endDate) return null;
        try {
            const d = typeof wtrSub.endDate === "string" ? parseISO(wtrSub.endDate) : new Date(wtrSub.endDate);
            return format(d, "M/d/yyyy");
        } catch {
            return null;
        }
    })();

    const [activeTab, setActiveTab] = useState("students");

    useEffect(() => {
        document.title = "Write to Read Platform • iFuntology Teacher";
    }, []);

    useEffect(() => {
        const tab = (location.state as WriteToReadLocationState | null)?.wtrActiveTab;
        if (tab === "print" || tab === "grade" || tab === "students") {
            setActiveTab(tab);
            navigate("/write-to-read", { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    return (
        <DashboardWithSidebarLayout>
            <div className="mx-auto w-full space-y-6 pb-12">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Write to Read Platform</h1>

                {/* Subscription Status Card */}
                <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 shadow-sm overflow-hidden relative">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="space-y-2 text-left">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Subscription Status</h2>
                                <Badge
                                    className={cn(
                                        "border-none rounded-full px-3 py-0.5 text-[10px] font-bold uppercase text-white",
                                        wtrSub?.status === "ACTIVE"
                                            ? "bg-green-500 hover:bg-green-600"
                                            : "bg-slate-500 hover:bg-slate-600"
                                    )}
                                >
                                    {(wtrSub?.status ?? "Active").toString()}
                                </Badge>
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                {wtrSub
                                    ? `${wtrSub.subscriptionType === "YEARLY" ? "Yearly" : "Monthly"} plan${renewalLabel ? ` • Current period ends ${renewalLabel}` : ""
                                    }${wtrSub.autoRenew === false ? " • Auto-renew off" : ""}`
                                    : "Write to Read subscription"}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            className="rounded-full font-bold px-8 h-12"
                            onClick={() =>
                                toast.message("Use account billing or support if you need to change your plan.")
                            }
                        >
                            Manage Subscription
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] p-6 flex items-center gap-5 border border-slate-100 dark:border-slate-800/50">
                            <div className="h-14 w-14 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <Users className="h-7 w-7" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Students Used</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {wtrSub
                                        ? `${wtrSub.usedSeats ?? 0}/${wtrSub.numberOfSeats ?? "—"}`
                                        : "—"}
                                </p>
                                {typeof wtrSub?.seatsRemaining === "number" ? (
                                    <p className="text-xs text-slate-500 mt-1">
                                        {wtrSub.seatsRemaining} seat{wtrSub.seatsRemaining === 1 ? "" : "s"} remaining
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] p-6 flex items-center gap-5 border border-slate-100 dark:border-slate-800/50">
                            <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Wallet className="h-7 w-7" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last invoice</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {wtrSub && typeof wtrSub.amount === "number"
                                        ? `$${Number(wtrSub.amount).toFixed(2)} / ${wtrSub.subscriptionType === "YEARLY" ? "yr" : "mo"}`
                                        : "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Main Tabs */}
                <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-transparent border-b border-slate-100 dark:border-slate-800 w-full justify-start rounded-none h-auto p-0 mb-8 overflow-x-auto gap-10 flex-nowrap scrollbar-hide">
                        {[
                            { id: "students", label: "Students & Batches", icon: Users },
                            { id: "grade", label: "Grade Books", icon: BookOpen },
                            { id: "print", label: "Print Orders", icon: Printer },
                            // { id: "certs", label: "Certificates", icon: Award },
                            // { id: "resources", label: "Resources", icon: FileText },
                            // { id: "story", label: "Story Builder", icon: Pencil },
                            // { id: "quizzes", label: "Quizzes,Tests & Exams", icon: GraduationCap },
                        ].map((t) => (
                            <TabsTrigger
                                key={t.id}
                                value={t.id}
                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 text-slate-400 rounded-none h-auto py-4 px-0 font-bold transition-all text-xs flex items-center gap-2 whitespace-nowrap shadow-none"
                            >
                                <t.icon className="h-4 w-4" />
                                {t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <StudentsAndBatchesTab />
                    <GradeBooksTab />
                    <PrintOrdersTab />
                </Tabs>
            </div>

        </DashboardWithSidebarLayout>
    );
}
