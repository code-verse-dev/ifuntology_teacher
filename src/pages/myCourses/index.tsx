import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, BookOpen, Award, Users, Clock } from "lucide-react";


type Course = {
    id: string;
    name: string;
    description: string;
    coverage: number;
    stats: {
        modules: string;
        certificates: number;
        students: number;
        expires: string;
    };
    theme: {
        bg: string;
        border: string;
        iconBg: string;
        iconColor: string;
        progressColor: string;
    };
};

const courses: Course[] = [
    {
        id: "funtology",
        name: "Funtology",
        description: "Complete child development and educational entertainment program.",
        coverage: 68,
        stats: {
            modules: "12/18",
            certificates: 2,
            students: 24,
            expires: "1/15/2025",
        },
        theme: {
            bg: "bg-pink-50",
            border: "border-pink-300",
            iconBg: "bg-pink-500",
            iconColor: "text-white",
            progressColor: "bg-lime-500", // Using green progress bar based on image
        },
    },
    {
        id: "barbertology",
        name: "Barbertology",
        description: "It provide students with specialized knowledge and skills related to barbering.",
        coverage: 68,
        stats: {
            modules: "12/18",
            certificates: 2,
            students: 24,
            expires: "1/15/2025",
        },
        theme: {
            bg: "bg-[#FDF8E8]",
            border: "border-[#D4B36A]",
            iconBg: "bg-[#A68A3E]",
            iconColor: "text-white",
            progressColor: "bg-lime-500",
        },
    },
    {
        id: "nailtology",
        name: "Nailtology",
        description: "Professional nail art and care certification program. It s a course dedicated to teaching students about nail structures.",
        coverage: 68,
        stats: {
            modules: "12/18",
            certificates: 2,
            students: 24,
            expires: "1/15/2025",
        },
        theme: {
            bg: "bg-teal-50",
            border: "border-teal-300",
            iconBg: "bg-teal-500",
            iconColor: "text-white",
            progressColor: "bg-lime-500",
        },
    },
    {
        id: "skintology",
        name: "Skintology",
        description: "Skintology Fundamentals is a course that introduces students to the world of skincare and makeup.",
        coverage: 68,
        stats: {
            modules: "12/18",
            certificates: 2,
            students: 24,
            expires: "1/15/2025",
        },
        theme: {
            bg: "bg-green-50",
            border: "border-green-300",
            iconBg: "bg-green-500",
            iconColor: "text-white",
            progressColor: "bg-lime-500",
        },
    },
];

export default function MyCourses() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "My Courses • iFuntology Teacher";
    }, []);

    return (
        <DashboardWithSidebarLayout>
            <section className="mx-auto w-full space-y-6">
                <h1 className="text-2xl font-extrabold">My Courses</h1>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => (
                        <Card
                            key={course.id}
                            className={`flex flex-col justify-between overflow-hidden rounded-2xl border-2 p-6 shadow-sm ${course.theme.bg} ${course.theme.border}`}
                        >
                            <div>
                                {/* Header: Icon + Title + Desc */}
                                <div className="flex gap-4 mb-6">
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${course.theme.iconBg} ${course.theme.iconColor}`}>
                                        <GraduationCap className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{course.name}</h3>
                                        <p className="text-sm text-slate-600 leading-snug">{course.description}</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                                        <span>Course Coverage</span>
                                        <span>{course.coverage}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-black/10">
                                        <div
                                            className={`h-full rounded-full ${course.theme.progressColor}`}
                                            style={{ width: `${course.coverage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {/* Modules */}
                                    <div className="rounded-xl bg-white/60 p-3">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            <span>Modules</span>
                                        </div>
                                        <div className="text-sm font-bold text-slate-900">{course.stats.modules}</div>
                                    </div>

                                    {/* Certificates */}
                                    <div className="rounded-xl bg-white/60 p-3">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                                            <Award className="h-3.5 w-3.5" />
                                            <span>Certificates Issued (Students)</span>
                                        </div>
                                        <div className="text-sm font-bold text-orange-600">{course.stats.certificates}</div>
                                    </div>

                                    {/* Students */}
                                    <div className="rounded-xl bg-white/60 p-3">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                                            <Users className="h-3.5 w-3.5" />
                                            <span>Students</span>
                                        </div>
                                        <div className="text-sm font-bold text-slate-900">{course.stats.students}</div>
                                    </div>

                                    {/* Expires */}
                                    <div className="rounded-xl bg-white/60 p-3">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>Expires</span>
                                        </div>
                                        <div className="text-sm font-bold text-slate-900">{course.stats.expires}</div>
                                    </div>
                                </div>
                            </div>

                            {/* View Course Button */}
                            <Button
                                className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 text-sm shadow-md"
                                onClick={() => navigate(`/my-courses/${course.id}`)}
                            >
                                View Course
                            </Button>
                        </Card>
                    ))}
                </div>
            </section>
        </DashboardWithSidebarLayout>
    );
}
