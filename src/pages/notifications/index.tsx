import { useEffect, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Filter, ChevronDown, CheckCheck } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
    useGetAllNotificationsQuery,
    useToggleNotificationMutation,
    useMarkAllReadMutation,
} from "@/redux/services/apiSlices/notificationSlice";

type FilterType = "all" | "unread" | "read";

export default function Notifications() {
    const [filter, setFilter] = useState<FilterType>("all");

    const queryArg =
        filter === "unread" ? { isRead: false } :
            filter === "read" ? { isRead: true } :
                {};

    const { data: notificationsData, isLoading } = useGetAllNotificationsQuery(queryArg);
    const [toggleNotification] = useToggleNotificationMutation();
    const [markAllRead] = useMarkAllReadMutation();

    useEffect(() => {
        document.title = "Notifications • iFuntology";
    }, []);

    const notifDocs: any[] = notificationsData?.data?.notifications?.docs ?? [];
    const unreadCount: number = notificationsData?.data?.unreadCount ?? 0;

    const filterLabel = filter === "unread" ? "Unread" : filter === "read" ? "Read" : "All Notifications";

    return (
        <DashboardWithSidebarLayout>
            <div className="mx-auto w-full space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>
                        {unreadCount > 0 && (
                            <Badge className="bg-orange-500 hover:bg-orange-600 border-none text-xs font-bold px-2.5 py-0.5 rounded-full">
                                {unreadCount} unread
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 shadow-sm">
                            <Filter className="h-4 w-4 text-slate-400" />
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none">
                                    {filterLabel}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => setFilter("all")}>All Notifications</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilter("unread")}>Unread</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilter("read")}>Read</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <Button
                            variant="outline"
                            className="bg-white dark:bg-slate-900 border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-400 dark:hover:bg-orange-950/20 gap-2 h-10 rounded-lg px-4 text-sm font-semibold"
                            onClick={() => markAllRead()}
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark All Read
                        </Button>
                    </div>
                </div>

                {/* Notifications Container */}
                <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm">
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-6">All Notifications</p>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <p className="text-slate-400 font-medium">Loading notifications...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifDocs.map((n) => (
                                <div
                                    key={n._id}
                                    className={cn(
                                        "relative flex items-center gap-4 rounded-3xl border p-4 transition-all",
                                        n.isRead
                                            ? "bg-transparent border-slate-100 dark:border-slate-800"
                                            : "bg-green-50/30 border-green-100 dark:bg-green-950/5 dark:border-green-900/30"
                                    )}
                                >
                                    {/* Icon */}
                                    <div className={cn(
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                                        n.isRead
                                            ? "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400"
                                            : "bg-white dark:bg-slate-800 border-green-100 dark:border-green-800 text-green-500"
                                    )}>
                                        <Bell className="h-5 w-5" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h3>
                                            {!n.isRead && (
                                                <Badge className="bg-green-500 hover:bg-green-600 border-none text-[10px] font-bold px-2 py-0 h-4 uppercase">New</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{n.content}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            {new Date(n.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Toggle read/unread */}
                                    <div className="shrink-0">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            title={n.isRead ? "Mark as unread" : "Mark as read"}
                                            className={cn(
                                                "h-8 w-8 rounded-full border",
                                                n.isRead
                                                    ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-50"
                                                    : "border-green-200 dark:border-green-800 bg-white dark:bg-slate-800 text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20"
                                            )}
                                            onClick={() => toggleNotification({ id: n._id })}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {notifDocs.length === 0 && (
                                <div className="text-center py-12">
                                    <Bell className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">No notifications found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </DashboardWithSidebarLayout>
    );
}
