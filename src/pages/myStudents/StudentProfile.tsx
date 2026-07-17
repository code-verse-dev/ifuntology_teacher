import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import ResetStudentPasswordDialog from "@/components/students/ResetStudentPasswordDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    ArrowLeft,
    Award,
    BookOpen,
    CheckCircle2,
    ClipboardPen,
    Loader2,
    KeyRound,
    Mail,
    MessageCircle,
    User,
} from "lucide-react";
import { useGetStudentByIdQuery } from "@/redux/services/apiSlices/invitationSlice";
import { UPLOADS_URL } from "@/constants/api";
import { getPracticalColumns } from "@/constants/practicalSheet";

const BATCH_BADGE_COLORS: Record<string, string> = {
    Funtology: "border-pink-200 text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:border-pink-800",
    Barbertology: "border-yellow-200 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800",
    Nailtology: "border-teal-200 text-teal-700 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-800",
    Skintology: "border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:border-green-800",
};

function getInitials(firstName?: string, lastName?: string) {
    return `${(firstName ?? "").charAt(0)}${(lastName ?? "").charAt(0)}`.toUpperCase() || "?";
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function StudentProfile() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const [resetOpen, setResetOpen] = useState(false);

    const { data, isLoading, error } = useGetStudentByIdQuery(
        { studentId: studentId ?? "" },
        { skip: !studentId }
    );

    const profile = data?.data;
    const user = profile?.user;
    const enrollments: any[] = profile?.enrollments ?? [];
    const passedCourses: string[] = profile?.passedCourses ?? [];
    const certificates: any[] = profile?.certificates ?? [];
    const practicalSheetCourses = [
        ...new Set(
            enrollments
                .map((e: any) => e.courseType as string)
                .filter((courseType: string) => !!getPracticalColumns(courseType)),
        ),
    ];

    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Student";

    useEffect(() => {
        document.title = fullName
            ? `${fullName} • My Students`
            : "Student Profile • iFuntology Teacher";
    }, [fullName]);

    const handleMessage = () => {
        if (!studentId) return;
        navigate("/messages", { state: { studentUserId: studentId } });
    };

    if (isLoading) {
        return (
            <DashboardWithSidebarLayout>
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
            </DashboardWithSidebarLayout>
        );
    }

    if (error || !profile) {
        return (
            <DashboardWithSidebarLayout>
                <div className="mx-auto max-w-lg py-24 text-center space-y-4">
                    <p className="text-muted-foreground">Student not found or you do not have access.</p>
                    <Button variant="outline" className="rounded-full" onClick={() => navigate("/my-students")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to My Students
                    </Button>
                </div>
            </DashboardWithSidebarLayout>
        );
    }

    return (
        <DashboardWithSidebarLayout>
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <button
                    onClick={() => navigate("/my-students")}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to My Students
                </button>

                <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-lime-500/15 to-emerald-500/10 px-6 py-8 sm:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                                    {user?.image ? (
                                        <AvatarImage src={UPLOADS_URL + user.image} alt={fullName} />
                                    ) : null}
                                    <AvatarFallback className="bg-lime-600 text-white text-lg font-bold">
                                        {getInitials(user?.firstName, user?.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                        {fullName}
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {user?.username ? `@${user.username}` : user?.email}
                                    </p>
                                    {user?.email && (
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5" />
                                            {user.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    variant="outline"
                                    className="rounded-full gap-2"
                                    onClick={() => setResetOpen(true)}
                                >
                                    <KeyRound className="h-4 w-4" />
                                    Reset password
                                </Button>
                                <Button
                                    className="rounded-full bg-lime-600 hover:bg-lime-700 text-white gap-2"
                                    onClick={handleMessage}
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Message
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 sm:p-8 border-t border-border/10">
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1">
                                <BookOpen className="h-4 w-4" />
                                Enrolled Courses
                            </div>
                            <p className="text-2xl font-bold">{enrollments.length}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1">
                                <CheckCircle2 className="h-4 w-4 text-lime-600" />
                                Passed Courses
                            </div>
                            <p className="text-2xl font-bold text-lime-600">{passedCourses.length}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1">
                                <Award className="h-4 w-4 text-orange-500" />
                                Certificates
                            </div>
                            <p className="text-2xl font-bold text-orange-500">{certificates.length}</p>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="rounded-3xl border-none shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-lime-600" />
                            Student Details
                        </h2>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted-foreground">Full name</dt>
                                <dd className="font-semibold text-right">{fullName}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted-foreground">Email</dt>
                                <dd className="font-semibold text-right break-all">{user?.email ?? "—"}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted-foreground">Username</dt>
                                <dd className="font-semibold text-right">{user?.username ?? "—"}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted-foreground">Member since</dt>
                                <dd className="font-semibold text-right">{formatDate(user?.createdAt)}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted-foreground">Last active</dt>
                                <dd className="font-semibold text-right">{formatDate(user?.updatedAt)}</dd>
                            </div>
                        </dl>
                    </Card>

                    <Card className="rounded-3xl border-none shadow-sm p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-lime-600" />
                            Passed Courses
                        </h2>
                        {passedCourses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No courses passed yet. Student must pass all quizzes and tests with 70% or higher in a course to earn a certificate.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {passedCourses.map((courseType) => (
                                    <Badge
                                        key={courseType}
                                        variant="outline"
                                        className={`rounded-full px-3 py-1 ${BATCH_BADGE_COLORS[courseType] ?? ""}`}
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                        {courseType}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                <Card className="rounded-3xl border-none shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-lime-600" />
                        Course Enrollments
                    </h2>
                    <div className="space-y-4">
                        {enrollments.map((enrollment: any) => {
                            const batchBadge =
                                BATCH_BADGE_COLORS[enrollment.courseType] ??
                                "border-slate-200 text-slate-600 bg-slate-50";
                            const isPassed = enrollment.quizProgress?.allQuizzesPassed;

                            return (
                                <div
                                    key={enrollment._id}
                                    className="rounded-2xl border border-border/20 p-4 space-y-3"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`rounded-md ${batchBadge}`}>
                                                {enrollment.courseType}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    enrollment.status === "ACTIVE"
                                                        ? "bg-green-100 text-green-700 border-transparent"
                                                        : "bg-red-100 text-red-700 border-transparent"
                                                }
                                            >
                                                {enrollment.status}
                                            </Badge>
                                            {isPassed && (
                                                <Badge className="bg-lime-100 text-lime-700 border-transparent">
                                                    All quizzes passed
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* {getPracticalColumns(enrollment.courseType) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-full gap-1.5"
                                                    onClick={() =>
                                                        navigate(
                                                            `/my-students/${studentId}/practical-sheet/${encodeURIComponent(enrollment.courseType)}`,
                                                        )
                                                    }
                                                >
                                                    <ClipboardPen className="h-3.5 w-3.5" />
                                                    View Practical Sheet
                                                </Button>
                                            )} */}
                                            <span className="text-xs text-muted-foreground">
                                                {enrollment.quizProgress?.passedQuizzes ?? 0}/
                                                {enrollment.quizProgress?.totalQuizzes ?? 0} quizzes passed
                                            </span>
                                        </div>
                                    </div>
                                    {/* <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span>Module progress</span>
                                            <span>{enrollment.progressPercentage ?? 0}%</span>
                                        </div>
                                        <Progress
                                            value={enrollment.progressPercentage ?? 0}
                                            className="h-1.5"
                                            indicatorClassName="bg-lime-500"
                                        />
                                    </div> */}
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* <Card className="rounded-3xl border-none shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <ClipboardPen className="h-5 w-5 text-lime-600" />
                        Practical Credit Sheets
                    </h2>
                    {practicalSheetCourses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No practical sheets available for this student&apos;s enrolled courses yet.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {practicalSheetCourses.map((courseType) => (
                                <div
                                    key={courseType}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-border/20 p-4"
                                >
                                    <div>
                                        <p className="font-semibold">{courseType}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            View the student&apos;s daily practical log
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full gap-1.5"
                                        onClick={() =>
                                            navigate(
                                                `/my-students/${studentId}/practical-sheet/${encodeURIComponent(courseType)}`,
                                            )
                                        }
                                    >
                                        <ClipboardPen className="h-3.5 w-3.5" />
                                        View Sheet
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card> */}

                <Card className="rounded-3xl border-none shadow-sm p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-orange-500" />
                        Earned Certificates
                    </h2>
                    {certificates.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No certificates earned yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {certificates.map((cert: any) => (
                                <div
                                    key={cert._id}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-border/20 p-4"
                                >
                                    <div>
                                        <p className="font-semibold">{cert.courseType}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Issued {formatDate(cert.createdAt)}
                                        </p>
                                    </div>
                                    {cert.certificateUrl && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full"
                                        >
                                            <a
                                                href={UPLOADS_URL + cert.certificateUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View Certificate
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <ResetStudentPasswordDialog
                open={resetOpen}
                onOpenChange={setResetOpen}
                studentId={studentId}
                studentName={fullName}
            />
        </DashboardWithSidebarLayout>
    );
}
