import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Users,
    Activity,
    BookOpen,
    FileBadge,
    Search,
    MessageCircle,
    UserPlus,
    MoreVertical,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetMyStudentsQuery } from "@/redux/services/apiSlices/invitationSlice";
import { useGetSubscriptionStatsQuery } from "@/redux/services/apiSlices/subscriptionSlice";

const COURSE_TYPES = ["Funtology", "Barbertology", "Nailtology", "Skintology"];

const AVATAR_COLORS = [
    "bg-orange-500",
    "bg-cyan-500",
    "bg-red-500",
    "bg-lime-600",
    "bg-slate-700",
    "bg-teal-500",
    "bg-pink-500",
    "bg-indigo-500",
];

const BATCH_BADGE_COLORS: Record<string, string> = {
    Funtology: "border-pink-200 text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:border-pink-800",
    Barbertology: "border-yellow-200 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800",
    Nailtology: "border-teal-200 text-teal-700 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-800",
    Skintology: "border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:border-green-800",
};

function getInitials(firstName?: string, lastName?: string) {
    return `${(firstName ?? "").charAt(0)}${(lastName ?? "").charAt(0)}`.toUpperCase() || "?";
}

function avatarColor(index: number) {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function useDebounce<T>(value: T, delay = 400): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function MyStudents() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [courseTypeFilter, setCourseTypeFilter] = useState<string | undefined>(undefined);
    const [page, setPage] = useState(1);
    const limit = 10;

    const debouncedKeyword = useDebounce(keyword, 400);

    useEffect(() => {
        setPage(1);
    }, [debouncedKeyword, courseTypeFilter]);

    const { data, isLoading } = useGetMyStudentsQuery({
        page,
        limit,
        keyword: debouncedKeyword || undefined,
        courseType: courseTypeFilter,
    });

    const studentsData: any[] = data?.data?.docs ?? [];
    const totalDocs: number = data?.data?.totalDocs ?? 0;
    const totalPages: number = data?.data?.totalPages ?? 1;

    const { data: statsData , isLoading: statsLoading } = useGetSubscriptionStatsQuery();
    const stats = statsData?.data;
    const totalStudents = stats?.totalStudents ?? 0;
    const activeStudents = stats?.activeStudents ?? 0;
    const totalModules = stats?.totalModules ?? 0;
    const certificatesEarned = stats?.certificatesIssued ?? 0;

    useEffect(() => {
        document.title = "My Students • iFuntology Teacher";
    }, []);

    return (
        <DashboardWithSidebarLayout>
            <div className="mx-auto w-full space-y-6">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Students</h1>
                    <div className="flex gap-3">
                        <Button className="rounded-full bg-lime-600 hover:bg-lime-700 text-white gap-2 px-6">
                            <MessageCircle className="h-4 w-4" />
                            Chat Now
                        </Button>
                        <Button
                            className="rounded-full bg-lime-600 hover:bg-lime-700 text-white gap-2 px-6"
                            onClick={() => navigate("/invite-student")}
                        >
                            <UserPlus className="h-4 w-4" />
                            Invite Students
                        </Button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students by name, email or username..."
                            className="pl-10 rounded-full bg-white dark:bg-slate-900 border-none shadow-sm h-12"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>

                    {/* Batches Dropdown */}
                    <div className="w-full md:w-48">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-between rounded-full bg-white dark:bg-slate-900 border-none shadow-sm h-12 font-normal text-muted-foreground"
                                >
                                    {courseTypeFilter ?? "All Batches"}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onSelect={() => setCourseTypeFilter(undefined)}>
                                    All Batches
                                </DropdownMenuItem>
                                {COURSE_TYPES.map((ct) => (
                                    <DropdownMenuItem key={ct} onSelect={() => setCourseTypeFilter(ct)}>
                                        {ct}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 mb-3">
                            <Users className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Total Students</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalStudents}</h3>
                        </div>
                    </Card>
                    <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-3">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Active Students</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {activeStudents}
                            </h3>
                        </div>
                    </Card>
                    <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 mb-3">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Total Modules</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {totalModules}
                            </h3>
                        </div>
                    </Card>
                    <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-600 mb-3">
                            <FileBadge className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Certificates Earned</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {certificatesEarned}
                            </h3>
                        </div>
                    </Card>
                </div>

                {/* Students Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                    </div>
                ) : studentsData.length === 0 ? (
                    <p className="text-center text-muted-foreground py-16">No students found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {studentsData.map((student: any, index: number) => {
                            const firstName = student.user?.firstName ?? "";
                            const lastName = student.user?.lastName ?? "";
                            const fullName = `${firstName} ${lastName}`.trim() || "—";
                            const username = student.user?.username ? `@${student.user.username}` : student.user?.email ?? "—";
                            const initials = getInitials(firstName, lastName);
                            const color = avatarColor(index);
                            const courseType = student.courseType ?? "—";
                            const batchBadge = BATCH_BADGE_COLORS[courseType] ?? "border-slate-200 text-slate-600 bg-slate-50";
                            const isActive = student.status === "ACTIVE";
                            const certificates = student.subscription?.certificatesIssued ?? 0;
                            const totalModules = student.totalModules ?? 0;

                            return (
                                <Card key={student._id} className="p-5 rounded-3xl border-none shadow-sm bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <Avatar className={`h-10 w-10 ${color}`}>
                                                <AvatarFallback className={`${color} text-white font-semibold`}>{initials}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{fullName}</h3>
                                                <p className="text-[10px] text-muted-foreground">{username}</p>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600 -mr-2">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                <DropdownMenuItem>Message</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Progress – dummy 0% until API provides it */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <span>Progress</span>
                                            <span>{student?.progressPercentage ?? 0}%</span>
                                        </div>
                                        <Progress value={student?.progressPercentage ?? 0} className="h-1.5" indicatorClassName="bg-lime-500" />
                                    </div>

                                    {/* Stats */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Modules</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{totalModules}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Certificates</span>
                                            <span className="font-bold text-orange-500">{certificates}</span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                                    {/* Footer Info */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Batch</span>
                                            <Badge variant="outline" className={`rounded-md font-normal px-2 py-0 h-5 ${batchBadge}`}>
                                                {courseType}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                                            <Badge
                                                variant="outline"
                                                className={`rounded-md font-normal px-2 py-0 h-5 border-transparent ${isActive
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                                    : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                                    }`}
                                            >
                                                {isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Subscription</span>
                                            <span className="font-semibold text-slate-900 dark:text-white capitalize">
                                                {student.subscription?.subscriptionType?.toLowerCase() ?? "—"}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
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
