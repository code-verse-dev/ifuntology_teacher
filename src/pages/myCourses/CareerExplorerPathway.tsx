import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    ArrowLeft,
    Compass,
    Download,
    Eye,
    FileText,
    Map,
    Route,
} from "lucide-react";
import { useGetCourseModuleByCourseTypeQuery } from "@/redux/services/apiSlices/courseModuleSlice";
import { UPLOADS_URL } from "@/constants/api";
import {
    CAREER_EXPLORER_LEVELS,
    CAREER_EXPLORER_WEEKS,
    getCoursePdfName,
    getLevelGuidePdfUrl,
    getPdfFilename,
    getWeekPathwayPdfUrl,
} from "@/constants/careerExplorerPathway";
import { cn } from "@/lib/utils";

type CareerExplorerPathwayProps = {
    backBasePath: "/my-courses" | "/learning";
    portalLabel: string;
};

async function downloadExternalPdf(url: string, filename: string) {
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(objectUrl);
    } catch {
        window.open(url, "_blank", "noopener,noreferrer");
    }
}

function PdfActionButtons({
    url,
    label,
    onPreview,
}: {
    url: string;
    label: string;
    onPreview: (url: string, label: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-full gap-1.5 font-semibold"
                onClick={() => onPreview(url, label)}
            >
                <Eye className="h-3.5 w-3.5" />
                Preview
            </Button>
            <Button
                type="button"
                size="sm"
                className="rounded-full gap-1.5 bg-lime-600 font-semibold hover:bg-lime-700"
                onClick={() => void downloadExternalPdf(url, getPdfFilename(url))}
            >
                <Download className="h-3.5 w-3.5" />
                Download
            </Button>
        </div>
    );
}

export default function CareerExplorerPathway({
    backBasePath,
    portalLabel,
}: CareerExplorerPathwayProps) {
    const { courseType } = useParams();
    const encodedCourseType = encodeURIComponent(courseType ?? "");
    const coursePdfName = getCoursePdfName(courseType);
    const backPath = `${backBasePath}/${encodedCourseType}`;

    const { data: courseData } = useGetCourseModuleByCourseTypeQuery(
        { courseType: courseType ?? "" },
        { skip: !courseType }
    );
    const course = courseData?.data;
    const courseTitle = course?.courseType ?? courseType ?? "Course";
    const courseImage = course?.image
        ? UPLOADS_URL + course.image
        : "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

    const [preview, setPreview] = useState<{ url: string; label: string } | null>(null);

    useEffect(() => {
        document.title = `Career Explorer Pathway • ${courseTitle} • ${portalLabel}`;
    }, [courseTitle, portalLabel]);

    return (
        <DashboardWithSidebarLayout fullWidth={backBasePath === "/learning"}>
            <div
                className={cn(
                    "mx-auto w-full space-y-8",
                    backBasePath === "/learning" && "max-w-[1440px] px-4 sm:px-6"
                )}
            >
                <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-35"
                        style={{ backgroundImage: `url(${courseImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-indigo-950/85 to-purple-950/80" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.35),_transparent_55%)]" />

                    <div className="relative px-6 py-8 sm:px-10 sm:py-10">
                        <Link
                            to={backPath}
                            className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>

                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                            <span>{courseTitle}</span>
                            <span>•</span>
                            <span>Resources</span>
                        </div>
                        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Career Explorer Pathway
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                            Explore curriculum pathways by skill level. Each level includes a guide PDF
                            plus shared week-based curriculum pathways for {coursePdfName}.
                        </p>
                    </div>
                </section>

                {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                        {
                            icon: Compass,
                            label: "Ology",
                            value: coursePdfName,
                            hint: "Course pathway family",
                        },
                        {
                            icon: Route,
                            label: "Skill Levels",
                            value: "3 Levels",
                            hint: "Explorer, Innovator, Trailblazer",
                        },
                        {
                            icon: Map,
                            label: "Pathways",
                            value: "5 Durations",
                            hint: "2, 4, 6, 8, and 12 weeks",
                        },
                    ].map((item) => (
                        <Card
                            key={item.label}
                            className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        {item.label}
                                    </p>
                                    <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                                        {item.value}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">{item.hint}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div> */}

                <Card className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Pathway Hierarchy
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Open a level to view its guide PDF and curriculum pathway options.
                        </p>
                    </div>

                    <div className="p-4 sm:p-6">
                        <Accordion
                            type="single"
                            collapsible
                            className="space-y-3"
                        >
                            {CAREER_EXPLORER_LEVELS.map((level) => {
                                const levelPdfUrl = getLevelGuidePdfUrl(courseType, level.pdfSuffix);
                                const levelPdfLabel = `${coursePdfName} ${level.subtitle} Guide`;

                                return (
                                    <AccordionItem
                                        key={level.id}
                                        value={level.id}
                                        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40"
                                    >
                                        <AccordionTrigger className="px-4 py-4 hover:no-underline sm:px-5 [&[data-state=open]]:border-b [&[data-state=open]]:border-slate-200 dark:[&[data-state=open]]:border-slate-800">
                                            <div className="flex w-full items-center gap-4 text-left">
                                                <div
                                                    className={cn(
                                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                                                        level.accent
                                                    )}
                                                >
                                                    <Compass className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                        {level.subtitle}
                                                    </p>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                        {level.title}
                                                    </h3>
                                                </div>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="space-y-5 px-4 pb-5 pt-4 sm:px-5">
                                            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className={cn(
                                                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                                                level.iconBg
                                                            )}
                                                        >
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                                {levelPdfLabel}
                                                            </p>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Level overview and guidance for {level.title} learners.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <PdfActionButtons
                                                        url={levelPdfUrl}
                                                        label={levelPdfLabel}
                                                        onPreview={(url, label) => setPreview({ url, label })}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="mb-3 flex items-center gap-2">
                                                    <Route className="h-4 w-4 text-slate-400" />
                                                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                                        Curriculum Pathways
                                                    </h4>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                                    {CAREER_EXPLORER_WEEKS.map((weeks) => {
                                                        const weekUrl = getWeekPathwayPdfUrl(courseType, weeks);
                                                        const weekLabel = `${coursePdfName} ${weeks} Weeks`;

                                                        return (
                                                            <div
                                                                key={`${level.id}-${weeks}`}
                                                                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div>
                                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                                            Duration
                                                                        </p>
                                                                        <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                                                                            {weeks} Weeks
                                                                        </p>
                                                                    </div>
                                                                    <div className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-500">
                                                                        PDF
                                                                    </div>
                                                                </div>
                                                                <div className="mt-4">
                                                                    <PdfActionButtons
                                                                        url={weekUrl}
                                                                        label={weekLabel}
                                                                        onPreview={(url, label) =>
                                                                            setPreview({ url, label })
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </div>
                </Card>
            </div>

            <Dialog open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
                <DialogContent className="flex h-[85vh] max-w-5xl flex-col gap-0 overflow-hidden p-0">
                    <DialogHeader className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                        <DialogTitle className="text-left text-lg font-bold">
                            {preview?.label ?? "PDF Preview"}
                        </DialogTitle>
                    </DialogHeader>
                    {preview ? (
                        <div className="min-h-0 flex-1 bg-slate-100 dark:bg-slate-950">
                            <iframe
                                title={preview.label}
                                src={preview.url}
                                className="h-full w-full border-0"
                            />
                        </div>
                    ) : null}
                    {preview ? (
                        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full font-semibold"
                                onClick={() => setPreview(null)}
                            >
                                Close
                            </Button>
                            <Button
                                type="button"
                                className="rounded-full bg-lime-600 font-semibold hover:bg-lime-700"
                                onClick={() =>
                                    void downloadExternalPdf(
                                        preview.url,
                                        getPdfFilename(preview.url)
                                    )
                                }
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </DashboardWithSidebarLayout>
    );
}
