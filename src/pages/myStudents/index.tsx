import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Users,
    Activity,
    BookOpen,
    FileBadge,
    Search,
    MessageCircle,
    UserPlus,
    MoreVertical,
    ChevronDown
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Student = {
    id: string;
    name: string;
    username: string;
    initials: string;
    avatarColor: string;
    progress: number;
    modules: number;
    certificates: number;
    batch: string;
    status: "Active" | "Inactive";
    lastActive: string;
};

const students: Student[] = [
    {
        id: "1",
        name: "Emma Johnson",
        username: "@emma.johnson",
        initials: "EJ",
        avatarColor: "bg-orange-500",
        progress: 68,
        modules: 12,
        certificates: 2,
        batch: "Funtology",
        status: "Active",
        lastActive: "12/20/2024",
    },
    {
        id: "2",
        name: "Myles.",
        username: "@emma.johnson",
        initials: "M",
        avatarColor: "bg-cyan-500",
        progress: 68,
        modules: 12,
        certificates: 2,
        batch: "Nailtology",
        status: "Inactive",
        lastActive: "12/20/2024",
    },
    {
        id: "3",
        name: "Emma Johnson",
        username: "@emma.johnson",
        initials: "S",
        avatarColor: "bg-red-500",
        progress: 68,
        modules: 12,
        certificates: 2,
        batch: "Skintology",
        status: "Active",
        lastActive: "12/20/2024",
    },
    {
        id: "4",
        name: "Emma Johnson",
        username: "@emma.johnson",
        initials: "N",
        avatarColor: "bg-lime-500",
        progress: 68,
        modules: 12,
        certificates: 2,
        batch: "Funtology",
        status: "Active",
        lastActive: "12/20/2024",
    },
    {
        id: "5",
        name: "Emma Johnson",
        username: "@emma.johnson",
        initials: "M",
        avatarColor: "bg-slate-700",
        progress: 68,
        modules: 12,
        certificates: 2,
        batch: "Funtology",
        status: "Active",
        lastActive: "12/20/2024",
    },
    {
        id: "6",
        name: "Emma Johnson",
        username: "@emma.johnson",
        initials: "M",
        avatarColor: "bg-teal-500",
        progress: 68,
        modules: 12,
        certificates: 2,
        batch: "Funtology",
        status: "Active",
        lastActive: "12/20/2024",
    },
    {
        id: "7",
        name: "Emma Johnson",
        username: "@emma.johnson",
        initials: "N",
        avatarColor: "bg-lime-500",
        progress: 68,
        modules: 12,
        certificates: 2,
        batch: "Barbertology",
        status: "Active",
        lastActive: "12/20/2024",
    },
    {
        id: "8",
        name: "Emma Johnson",
        username: "@emma.johnson",
        initials: "S",
        avatarColor: "bg-red-500",
        progress: 68,
        modules: 12,
        certificates: 2,
        batch: "Funtology",
        status: "Active",
        lastActive: "12/20/2024",
    },
];

export default function MyStudents() {
    const navigate = useNavigate();

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
                            placeholder="Search Students by name, email or username...."
                            className="pl-10 rounded-full bg-white dark:bg-slate-900 border-none shadow-sm h-12"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <Button variant="outline" className="w-full justify-between rounded-full bg-white dark:bg-slate-900 border-none shadow-sm h-12 font-normal text-muted-foreground">
                            All Batches
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
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
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">12</h3>
                        </div>
                    </Card>
                    <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-3">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Active Students</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">03</h3>
                        </div>
                    </Card>
                    <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 mb-3">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Total Batches</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">03</h3>
                        </div>
                    </Card>
                    <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-600 mb-3">
                            <FileBadge className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Certificates Earned</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">07</h3>
                        </div>
                    </Card>
                </div>

                {/* Students Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {students.map((student, index) => (
                        <Card key={`${student.id}-${index}`} className="p-5 rounded-3xl border-none shadow-sm bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <Avatar className={`h-10 w-10 ${student.avatarColor}`}>
                                        <AvatarFallback className={`${student.avatarColor} text-white font-semibold`}>{student.initials}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{student.name}</h3>
                                        <p className="text-[10px] text-muted-foreground">{student.username}</p>
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

                            {/* Progress */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    <span>Progress</span>
                                    <span>{student.progress}%</span>
                                </div>
                                <Progress value={student.progress} className="h-1.5" indicatorClassName="bg-lime-500" />
                            </div>

                            {/* Stats */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Modules</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{student.modules}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Certificates</span>
                                    <span className="font-bold text-orange-500">{student.certificates}</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-slate-100 dark:bg-slate-800" />

                            {/* Footer Info */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Batch</span>
                                    <Badge variant="outline" className="rounded-md border-pink-200 text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:border-pink-800 font-normal px-2 py-0 h-5">
                                        {student.batch}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                                    <Badge
                                        variant="outline"
                                        className={`rounded-md font-normal px-2 py-0 h-5 border-transparent ${student.status === "Active"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200"
                                            }`}
                                    >
                                        {student.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Last Active</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{student.lastActive}</span>
                                </div>
                            </div>

                        </Card>
                    ))}
                </div>
            </div>
        </DashboardWithSidebarLayout>
    );
}
