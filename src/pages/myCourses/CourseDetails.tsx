import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Video,
    FileText,
    CheckCircle2,
    Download,
    Eye,
    ClipboardList,
    FileQuestion,
    GraduationCap,
    Package,
    ChevronRight,
    Users,
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { UPLOADS_URL, WORKFORCE_EXPLORATION_FORM_PDF, IFUNTOLOGY_GLOSSARY_PDF } from "@/constants/api";
import { useFindByCourseTypeQuery, useGetCourseModuleByCourseTypeQuery } from "@/redux/services/apiSlices/courseModuleSlice";
import { useGetAverageProgressQuery } from "@/redux/services/apiSlices/invitationSlice";
import { isImportedAssessmentModule } from "@/constants/quiz";
import { cn } from "@/lib/utils";

const MODULE_ICON_COLORS = [
    "from-pink-500 to-rose-600",
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-teal-600",
];

export default function CourseDetails() {
    const { courseType } = useParams();
    const navigate = useNavigate();
    const { data } = useFindByCourseTypeQuery({ courseType: courseType ?? "" }, { skip: !courseType });
    const courseModules = data?.data;

    const visibleModules = useMemo(
        () => courseModules?.filter((module: any) => !isImportedAssessmentModule(module.title)) ?? [],
        [courseModules],
    );
    const { data: courseData } = useGetCourseModuleByCourseTypeQuery({ courseType: courseType ?? "" }, { skip: !courseType });
    const course = courseData?.data;
    const { data: averageProgress } = useGetAverageProgressQuery({ courseType: courseType ?? "" }, { skip: !courseType });

    useEffect(() => {
        document.title = "Course Details • iFuntology Teacher";
    }, []);

    const handleDownloadPdf = async (fileUrl: string, filename?: string) => {
        try {
            const res = await fetch(UPLOADS_URL + fileUrl);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename ?? fileUrl.split("/").pop() ?? "download.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            window.open(UPLOADS_URL + fileUrl, "_blank");
        }
    };

    const canPreviewPdf = (lesson: any) => lesson?.allowPdfPreview ?? false;
    const canDownloadPdf = (lesson: any) => lesson?.allowPdfDownload ?? true;

    const handlePreviewPdf = (lessonId: string) => {
        navigate(`/my-courses/pdf/${lessonId}`);
    };

    const encodedCourseType = encodeURIComponent(courseType ?? "");
    const courseTitle = course?.courseType ?? courseType ?? "Course";
    const courseImage = course?.image
        ? UPLOADS_URL + course.image
        : "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

    const resources = [
        {
            label: "Quizzes",
            icon: ClipboardList,
            onClick: () => navigate(`/my-courses/${encodedCourseType}/quizzes`),
            className: "border-orange-500/25 bg-orange-500/10 text-orange-600 dark:text-orange-300 hover:bg-orange-500/20",
        },
        {
            label: "Tests",
            icon: FileQuestion,
            onClick: () => navigate(`/my-courses/${encodedCourseType}/tests`),
            className: "border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-300 hover:bg-blue-500/20",
        },
        {
            label: "Exams",
            icon: GraduationCap,
            onClick: () => navigate(`/my-courses/${encodedCourseType}/exams`),
            className: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20",
        },
        {
            label: "Classroom Kits",
            icon: Package,
            onClick: () =>
                window.open(
                    "https://funtologyenrichmentsupplies.com/interactive-science-kits/",
                    "_blank",
                    "noopener,noreferrer"
                ),
            className: "border-slate-500/25 bg-slate-500/10 text-slate-600 dark:text-slate-300 hover:bg-slate-500/20",
        },
    ];

    return (
        <DashboardWithSidebarLayout>
            <div className="mx-auto w-full space-y-8">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-40"
                        style={{ backgroundImage: `url(${courseImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-indigo-950/80 to-purple-950/70" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.35),_transparent_55%)]" />

                    <div className="relative px-6 py-8 sm:px-10 sm:py-12">
                        <Link
                            to="/my-courses"
                            className="mb-8 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>

                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Course</p>
                        <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                            {courseTitle}
                        </h1>

                        <div className="mt-8">
                            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm">
                                {visibleModules.length} modules
                            </span>
                        </div>
                    </div>
                </section>

                {/* Main content */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
                    {/* Lessons */}
                    <div className="lg:col-span-8">
                        <div className="mb-4 flex flex-wrap gap-3">
                            <Button
                                variant="brand"
                                className="gap-2 rounded-full font-semibold"
                                asChild
                            >
                                <a
                                    href={WORKFORCE_EXPLORATION_FORM_PDF}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="h-4 w-4" />
                                    Workforce Exploration Form
                                </a>
                            </Button>
                            <Button
                                variant="brand"
                                className="gap-2 rounded-full font-semibold"
                                asChild
                            >
                                <a
                                    href={IFUNTOLOGY_GLOSSARY_PDF}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="h-4 w-4" />
                                    iFuntology Glossary
                                </a>
                            </Button>
                        </div>
                        <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">Lessons</h2>
                        <Accordion
                            type="single"
                            collapsible
                            defaultValue={visibleModules[0]?._id ?? (visibleModules.length > 0 ? "module-0" : undefined)}
                            className="space-y-3"
                        >
                            {visibleModules.map((module: any, moduleIndex: number) => {
                                const moduleValue = module._id ?? `module-${moduleIndex}`;
                                const iconColor = MODULE_ICON_COLORS[moduleIndex % MODULE_ICON_COLORS.length];

                                return (
                                    <AccordionItem
                                        key={moduleValue}
                                        value={moduleValue}
                                        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                                    >
                                        <AccordionTrigger className="px-4 py-4 hover:no-underline sm:px-5 [&[data-state=open]]:border-b [&[data-state=open]]:border-slate-100 dark:[&[data-state=open]]:border-slate-800">
                                            <div className="flex w-full items-center gap-4 text-left">
                                                <div
                                                    className={cn(
                                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                                                        iconColor
                                                    )}
                                                >
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                                                        {module.title}
                                                    </h3>
                                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                        {module.duration} mins · {module.totalLessons} lessons
                                                    </p>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4 pt-3 sm:px-5">
                                            {module.description && (
                                                <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                                                    {module.description}
                                                </p>
                                            )}
                                            <div className="space-y-2">
                                                {module.lessons?.length > 0 ? (
                                                    module.lessons.map((lesson: any) => (
                                                        <div
                                                            key={lesson._id ?? lesson.title}
                                                            className="flex flex-col gap-3 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-800/50"
                                                        >
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                                                                    {lesson.type === "VIDEO" && <Video className="h-4 w-4" />}
                                                                    {lesson.type === "PDF" && <FileText className="h-4 w-4" />}
                                                                    {lesson.type === "QUIZ" && <CheckCircle2 className="h-4 w-4" />}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                                                            {lesson.title}
                                                                        </p>
                                                                        <CheckCircle2 className="h-3 w-3 shrink-0 text-lime-500" />
                                                                    </div>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                        {lesson.duration} mins
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex shrink-0 flex-wrap gap-2 sm:ml-4">
                                                                {lesson.type === "VIDEO" && (
                                                                    <Button size="sm" className="rounded-full bg-orange-500 hover:bg-orange-600">
                                                                        View Lesson
                                                                    </Button>
                                                                )}
                                                                {lesson.type === "PDF" && (
                                                                    <>
                                                                        {canPreviewPdf(lesson) && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="rounded-full gap-1"
                                                                                onClick={() => lesson?._id && handlePreviewPdf(lesson._id)}
                                                                                disabled={!lesson?._id || !lesson?.fileUrl}
                                                                            >
                                                                                <Eye className="h-3 w-3" />
                                                                                Preview
                                                                            </Button>
                                                                        )}
                                                                        {canDownloadPdf(lesson) && (
                                                                            <Button
                                                                                size="sm"
                                                                                className="rounded-full bg-lime-600 hover:bg-lime-700 gap-1"
                                                                                onClick={() => lesson?.fileUrl && handleDownloadPdf(lesson.fileUrl, lesson?.title)}
                                                                                disabled={!lesson?.fileUrl}
                                                                            >
                                                                                <Download className="h-3 w-3" />
                                                                                Download
                                                                            </Button>
                                                                        )}
                                                                    </>
                                                                )}
                                                                {lesson.type === "QUIZ" && (
                                                                    <Button size="sm" className="rounded-full bg-lime-600 hover:bg-lime-700">
                                                                        Preview Quiz
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No lessons in this module yet.</p>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8 lg:col-span-4">
                        <section>
                            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Course overview</h2>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                {course?.description ?? "—"}
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Resources</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {resources.map((resource) => (
                                    <button
                                        key={resource.label}
                                        type="button"
                                        onClick={resource.onClick}
                                        className={cn(
                                            "group flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-all",
                                            resource.className
                                        )}
                                    >
                                        <resource.icon className="h-4 w-4 shrink-0 opacity-80" />
                                        <span className="min-w-0 truncate">{resource.label}</span>
                                        <ChevronRight className="ml-auto h-4 w-4 shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5" />
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl bg-slate-900 p-5 text-white">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-400" />
                                <h3 className="text-base font-bold">Students</h3>
                            </div>
                            <div className="mt-4 flex items-end justify-between">
                                <span className="text-sm text-slate-400">Enrolled students</span>
                                <span className="text-2xl font-bold">{averageProgress?.data?.subscription?.usedSeats ?? 0}</span>
                            </div>
                            <Button
                                className="mt-5 w-full rounded-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 font-semibold"
                                onClick={() => navigate("/my-students")}
                            >
                                View All Students
                            </Button>
                        </section>
                    </div>
                </div>
            </div>
        </DashboardWithSidebarLayout>
    );
}
