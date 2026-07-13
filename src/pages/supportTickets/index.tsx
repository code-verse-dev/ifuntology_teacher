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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useGetMyTicketsQuery } from "@/redux/services/apiSlices/ticketSlice";
import { UPLOADS_URL } from "@/constants/api";

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

function formatDateTime(dateStr?: string) {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    } catch {
        return "—";
    }
}

function formatComponentLabel(component?: string) {
    switch (component?.toLowerCase()) {
        case "lms":
            return "LMS Platform";
        case "enrichment_store":
            return "Enrichment Store";
        case "payments_billing":
            return "Payments & Billing";
        case "other":
            return "Other";
        default:
            return component || "—";
    }
}

function getPriorityStyles(priority: string) {
    switch (priority?.toLowerCase()) {
        case "urgent":
            return "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900";
        case "high":
            return "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900";
        case "medium":
            return "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-900";
        case "low":
            return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
        default:
            return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
}

function formatLabel(value?: string) {
    if (!value) return "—";
    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getTicketAttachment(ticket: any) {
    return ticket?.file ?? ticket?.attachment ?? ticket?.document ?? null;
}

export default function SupportTickets() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
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
                                            onClick={() => setSelectedTicket(ticket)}
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

            <Dialog
                open={Boolean(selectedTicket)}
                onOpenChange={(open) => {
                    if (!open) setSelectedTicket(null);
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none bg-white p-8 shadow-2xl dark:bg-slate-900 sm:max-w-[640px]">
                    {selectedTicket && (
                        <>
                            <DialogHeader className="space-y-3 text-left">
                                <DialogTitle className="text-xl font-extrabold leading-tight text-orange-500">
                                    {selectedTicket.subject ?? "Support Ticket"}
                                </DialogTitle>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider",
                                            getStatusStyles(selectedTicket.status)
                                        )}
                                    >
                                        {formatLabel(selectedTicket.status)}
                                    </Badge>
                                    {selectedTicket.priority && (
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider",
                                                getPriorityStyles(selectedTicket.priority)
                                            )}
                                        >
                                            {formatLabel(selectedTicket.priority)} Priority
                                        </Badge>
                                    )}
                                </div>
                            </DialogHeader>

                            <div className="mt-6 space-y-5">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Ticket ID
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {selectedTicket.ticketNumber ?? selectedTicket._id ?? "—"}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Component
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {formatComponentLabel(selectedTicket.component)}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Created
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {formatDateTime(selectedTicket.createdAt)}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Last Updated
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {formatDateTime(selectedTicket.updatedAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Description
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                                        {selectedTicket.description?.trim() || "No description provided."}
                                    </p>
                                </div>

                                {getTicketAttachment(selectedTicket) && (
                                    <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Attachment
                                        </p>
                                        <a
                                            href={UPLOADS_URL + getTicketAttachment(selectedTicket)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-flex text-sm font-semibold text-lime-600 hover:text-lime-700 hover:underline"
                                        >
                                            View attachment
                                        </a>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardWithSidebarLayout>
    );
}
