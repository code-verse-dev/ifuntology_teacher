import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    Plus,
    HelpCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetMyTicketsQuery } from "@/redux/services/apiSlices/ticketSlice";

function getStatusStyles(status: string) {
    switch (status?.toLowerCase()) {
        case "open":
            return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900";
        case "in-progress":
        case "in_progress":
            return "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900";
        case "resolved":
        case "closed":
            return "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900";
        default:
            return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "numeric", day: "numeric", year: "numeric",
        });
    } catch {
        return "—";
    }
}

export default function SupportTickets() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading } = useGetMyTicketsQuery({ page, limit });
    const ticketsData: any[] = data?.data?.docs ?? [];
    const totalPages: number = data?.data?.totalPages ?? 1;

    useEffect(() => {
        document.title = "Support Tickets • iFuntology Teacher";
    }, []);

    const pageOffset = (page - 1) * limit;

    return (
        <DashboardWithSidebarLayout>
            <div className="mx-auto w-full space-y-6">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Support Tickets</h1>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="flex-1 sm:flex-none rounded-full bg-lime-600 hover:bg-lime-700 text-white border-none px-6 h-11 transition-all"
                                >
                                    <HelpCircle className="h-4 w-4 mr-2" />
                                    View FAQs
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-xl p-2 min-w-[220px]">
                                <DropdownMenuItem onClick={() => navigate("/support-tickets/faqs/affiliate")} className="rounded-xl py-2 cursor-pointer">
                                    Affiliate Partnership
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate("/support-tickets/faqs/store")} className="rounded-xl py-2 cursor-pointer">
                                    E-commerce Store
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate("/support-tickets/faqs/lms")} className="rounded-xl py-2 cursor-pointer">
                                    Learning Management System
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate("/support-tickets/faqs/booking")} className="rounded-xl py-2 cursor-pointer">
                                    Booking &amp; Quotation Module
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate("/support-tickets/faqs/write-to-read")} className="rounded-xl py-2 cursor-pointer">
                                    Write to Read
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            className="flex-1 sm:flex-none rounded-full bg-lime-600 hover:bg-lime-700 text-white border-none px-6 h-11 transition-all"
                            onClick={() => navigate("/support-tickets/create")}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Ticket
                        </Button>
                    </div>
                </div>

                {/* Tickets Container */}
                <Card className="rounded-[2.5rem] border-none bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                        </div>
                    ) : ticketsData.length === 0 ? (
                        <p className="text-center text-muted-foreground py-16">No tickets found.</p>
                    ) : (
                        <div className="space-y-4">
                            {ticketsData.map((ticket: any, index: number) => (
                                <div
                                    key={ticket._id}
                                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-lime-200 dark:hover:border-lime-900/30 transition-all bg-slate-50/50 dark:bg-slate-800/20"
                                >
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-orange-500">
                                            <MessageSquare className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-base font-bold text-orange-500 leading-tight">
                                                {ticket.subject ?? "—"}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                                <span>Ticket # {pageOffset + index + 1}</span>
                                                <span className="h-1 w-1 rounded-full bg-slate-400" />
                                                <span>{formatDate(ticket.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "rounded-full px-5 py-1 text-[10px] font-bold uppercase tracking-wider",
                                                getStatusStyles(ticket.status)
                                            )}
                                        >
                                            {ticket.status ?? "—"}
                                        </Badge>
                                        <Button
                                            className="rounded-xl bg-lime-600 hover:bg-lime-700 text-white h-10 px-8 transition-all font-bold min-w-[100px]"
                                        >
                                            View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardWithSidebarLayout>
    );
}
