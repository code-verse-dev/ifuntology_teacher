import { useEffect, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    Check,
    Trash2,
    Filter,
    ChevronDown,
    CheckCheck
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Notification = {
    id: string;
    title: string;
    description: string;
    time: string;
    isNew?: boolean;
    isHighPriority?: boolean;
    isRead: boolean;
};

const initialNotifications: Notification[] = [
    {
        id: "1",
        title: "Quotation Approved",
        description: "Your quotation request has been approved. PO Number: PO-IF-23456",
        time: "5 minutes ago",
        isNew: true,
        isHighPriority: true,
        isRead: false,
    },
    {
        id: "2",
        title: "Session Booked",
        description: "Your Zoom session with the admin is scheduled for Aug 14, 4:00 PM.",
        time: "15 minutes ago",
        isNew: true,
        isRead: false,
    },
    {
        id: "3",
        title: "New Order Placed",
        description: "Your enrichment store order #ORD-78124 has been placed successfully.",
        time: "32 minutes ago",
        isNew: true,
        isHighPriority: true,
        isRead: false,
    },
    {
        id: "4",
        title: "LMS Subscription Active",
        description: "Your LMS subscription for Funtology is now active.",
        time: "1 hour ago",
        isNew: true,
        isRead: false,
    },
    {
        id: "5",
        title: "New Book Submitted",
        description: "Emma has submitted a new book titled \"The Magical Forest\" for review.",
        time: "2 hours ago",
        isNew: true,
        isRead: false,
    },
    {
        id: "6",
        title: "Printing Request Received",
        description: "A student has requested printing for the book \"The Magical Forest.\"",
        time: "3 hours ago",
        isRead: true,
    },
    {
        id: "7",
        title: "Support Ticket Updated",
        description: "There is a new update on your support ticket #SUP-1029.",
        time: "5 hours ago",
        isRead: true,
    },
];

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    useEffect(() => {
        document.title = "Notifications • iFuntology Teacher";
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true, isNew: false } : n));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true, isNew: false })));
    };

    return (
        <DashboardWithSidebarLayout>
            <div className="mx-auto w-full space-y-6">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 shadow-sm">
                            <Filter className="h-4 w-4 text-slate-400" />
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none">
                                    All Notifications
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem>All Notifications</DropdownMenuItem>
                                    <DropdownMenuItem>Unread</DropdownMenuItem>
                                    <DropdownMenuItem>High Priority</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <Button
                            variant="outline"
                            className="bg-white dark:bg-slate-900 border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-400 dark:hover:bg-orange-950/20 gap-2 h-10 rounded-lg px-4 text-sm font-semibold"
                            onClick={markAllRead}
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark All Read
                        </Button>
                    </div>
                </div>

                {/* Notifications Container */}
                <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm">
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-6">All Notifications</p>

                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "relative flex items-center gap-4 rounded-3xl border p-4 transition-all",
                                    notification.isRead
                                        ? "bg-transparent border-slate-100 dark:border-slate-800"
                                        : "bg-green-50/30 border-green-100 dark:bg-green-950/5 dark:border-green-900/30"
                                )}
                            >
                                {/* Icon */}
                                <div className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                                    notification.isRead
                                        ? "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400"
                                        : "bg-white dark:bg-slate-800 border-green-100 dark:border-green-800 text-green-500"
                                )}>
                                    <Bell className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{notification.title}</h3>
                                        <div className="flex gap-1.5">
                                            {notification.isNew && (
                                                <Badge className="bg-green-500 hover:bg-green-600 border-none text-[10px] font-bold px-2 py-0 h-4 uppercase">New</Badge>
                                            )}
                                            {notification.isHighPriority && (
                                                <Badge className="bg-pink-500 hover:bg-pink-600 border-none text-[10px] font-bold px-2 py-0 h-4 uppercase">High Priority</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        {notification.description}
                                    </p>
                                </div>

                                {/* Right Side: Time & Actions */}
                                <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                                    <span className="text-[10px] font-medium text-slate-400">{notification.time}</span>
                                    <div className="flex items-center gap-2">
                                        {!notification.isRead && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-50"
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-full border-pink-100 dark:border-pink-900/30 bg-white dark:bg-slate-800 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/20"
                                            onClick={() => deleteNotification(notification.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {notifications.length === 0 && (
                            <div className="text-center py-12">
                                <Bell className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">No notifications yet.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </DashboardWithSidebarLayout>
    );
}
