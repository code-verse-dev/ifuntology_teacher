import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Wallet, BookOpen, Printer, ChevronRight } from "lucide-react";
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

    const renewalLabel = useMemo(() => {
        if (!wtrSub?.endDate) return null;
        try {
            const d =
                typeof wtrSub.endDate === "string"
                    ? parseISO(wtrSub.endDate)
                    : new Date(wtrSub.endDate);
            return format(d, "MMMM d, yyyy");
        } catch {
            return null;
        }
    }, [wtrSub?.endDate]);

    const seatsUsed = wtrSub?.usedSeats ?? 0;
    const seatsTotal = wtrSub?.numberOfSeats ?? 0;
    const seatsProgress =
        seatsTotal > 0 ? Math.min(100, Math.round((seatsUsed / seatsTotal) * 100)) : 0;

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
            <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
                <div className="space-y-3 text-left">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Write to Read Platform
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                            Status
                        </span>
                        <Badge
                            className={cn(
                                "border-none rounded-full px-3 py-0.5 text-[10px] font-bold uppercase text-white",
                                wtrSub?.status === "ACTIVE"
                                    ? "bg-green-500 hover:bg-green-500"
                                    : "bg-slate-500 hover:bg-slate-500"
                            )}
                        >
                            {(wtrSub?.status ?? "Active").toString()}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                                <Users className="h-7 w-7" />
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                    Students Used
                                </p>
                                <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {wtrSub ? `${seatsUsed}/${seatsTotal || "—"}` : "—"}
                                </p>
                                {typeof wtrSub?.seatsRemaining === "number" ? (
                                    <p className="mt-1 text-sm text-slate-500">
                                        {wtrSub.seatsRemaining} seat
                                        {wtrSub.seatsRemaining === 1 ? "" : "s"} remaining
                                    </p>
                                ) : null}
                                {seatsTotal > 0 ? (
                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div
                                            className="h-full rounded-full bg-orange-500 transition-all"
                                            style={{ width: `${seatsProgress}%` }}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                                    <Wallet className="h-7 w-7" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        Last Invoice
                                    </p>
                                    <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                                        {wtrSub && typeof wtrSub.amount === "number"
                                            ? `$${Number(wtrSub.amount).toFixed(2)} / ${wtrSub.subscriptionType === "YEARLY" ? "yr" : "mo"}`
                                            : "—"}
                                    </p>
                                    {renewalLabel ? (
                                        <p className="mt-1 text-sm text-slate-500">
                                            Next billing: {renewalLabel}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="shrink-0 rounded-full border-slate-200 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                onClick={() => navigate("/pay-invoice")}
                            >
                                View Invoice
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                </div>

                <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                    <Tabs
                        defaultValue="students"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <div className="border-b border-slate-100 px-6 dark:border-slate-800">
                            <TabsList className="scrollbar-hide h-auto w-full justify-start gap-8 overflow-x-auto rounded-none bg-transparent p-0">
                                {[
                                    { id: "students", label: "Students & Batches", icon: Users },
                                    { id: "grade", label: "Grade Books", icon: BookOpen },
                                    { id: "print", label: "Print Orders", icon: Printer },
                                ].map((t) => (
                                    <TabsTrigger
                                        key={t.id}
                                        value={t.id}
                                        className="flex h-auto items-center gap-2 whitespace-nowrap rounded-none border-b-2 border-transparent bg-transparent px-0 py-4 text-xs font-bold text-slate-400 shadow-none transition-all data-[state=active]:border-orange-500 data-[state=active]:text-orange-500"
                                    >
                                        <t.icon className="h-4 w-4" />
                                        {t.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <div className="p-6">
                            <StudentsAndBatchesTab />
                            <GradeBooksTab />
                            <PrintOrdersTab />
                        </div>
                    </Tabs>
                </Card>
            </div>
        </DashboardWithSidebarLayout>
    );
}
