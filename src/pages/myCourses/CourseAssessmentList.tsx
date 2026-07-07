import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Eye, Loader2 } from "lucide-react";
import {
  useGetCourseExamsForTeacherQuery,
  useGetCourseQuizzesForTeacherQuery,
  useGetCourseTestsForTeacherQuery,
} from "@/redux/services/apiSlices/lessonSlice";

function displayValue(value: string | number | null | undefined) {
  if (value == null) return "—";
  const text = String(value).trim();
  return text.length > 0 ? text : "—";
}

type AssessmentKind = "QUIZ" | "TEST" | "EXAM";

const CONFIG: Record<
  AssessmentKind,
  {
    label: string;
    labelPlural: string;
    listKey: "quizzes" | "tests" | "exams";
    totalKey: "totalQuizzes" | "totalTests" | "totalExams";
    description: string;
  }
> = {
  QUIZ: {
    label: "Quiz",
    labelPlural: "Quizzes",
    listKey: "quizzes",
    totalKey: "totalQuizzes",
    description: "Review all quizzes for this course. Students attempt these from their learning portal.",
  },
  TEST: {
    label: "Test",
    labelPlural: "Tests",
    listKey: "tests",
    totalKey: "totalTests",
    description: "Review all practice tests for this course.",
  },
  EXAM: {
    label: "Exam",
    labelPlural: "Exams",
    listKey: "exams",
    totalKey: "totalExams",
    description: "Review all exams for this course.",
  },
};

export default function CourseAssessmentList({ kind }: { kind: AssessmentKind }) {
  const { courseType } = useParams<{ courseType: string }>();
  const navigate = useNavigate();
  const encodedCourseType = courseType ?? "";
  const config = CONFIG[kind];

  const quizzesQuery = useGetCourseQuizzesForTeacherQuery(
    { courseType: encodedCourseType },
    { skip: !encodedCourseType || kind !== "QUIZ" },
  );
  const testsQuery = useGetCourseTestsForTeacherQuery(
    { courseType: encodedCourseType },
    { skip: !encodedCourseType || kind !== "TEST" },
  );
  const examsQuery = useGetCourseExamsForTeacherQuery(
    { courseType: encodedCourseType },
    { skip: !encodedCourseType || kind !== "EXAM" },
  );

  const { data, isLoading, error } =
    kind === "QUIZ" ? quizzesQuery : kind === "TEST" ? testsQuery : examsQuery;

  const payload = data?.data;
  const items: any[] = payload?.[config.listKey] ?? [];
  const totalCount = payload?.[config.totalKey] ?? 0;

  useEffect(() => {
    document.title = courseType
      ? `${courseType} ${config.labelPlural} • iFuntology Teacher`
      : `Course ${config.labelPlural} • iFuntology Teacher`;
  }, [courseType, config.labelPlural]);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full space-y-6">
        <button
          type="button"
          onClick={() => navigate("/my-courses")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Courses
        </button>

        <div>
          <h1 className="text-2xl font-extrabold">
            {courseType} — {config.labelPlural}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
        </div>

        {!isLoading && payload && (
          <Card className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-muted-foreground">Total {config.labelPlural.toLowerCase()}</p>
            <p className="text-lg font-bold">{totalCount}</p>
          </Card>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && error && (
          <Card className="p-10 text-center text-sm text-muted-foreground rounded-2xl">
            Unable to load {config.labelPlural.toLowerCase()} for this course.
          </Card>
        )}

        {!isLoading && !error && items.length === 0 && (
          <Card className="p-10 text-center text-sm text-muted-foreground rounded-2xl border border-dashed">
            No {config.labelPlural.toLowerCase()} are available for this course yet.
          </Card>
        )}

        {!isLoading && items.length > 0 && (
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                    <TableHead className="min-w-[10rem] whitespace-nowrap">Title</TableHead>
                    {(kind === "QUIZ" || kind === "TEST") && (
                      <>
                        <TableHead className="hidden sm:table-cell whitespace-nowrap">Course</TableHead>
                        <TableHead className="hidden md:table-cell whitespace-nowrap">Unit No</TableHead>
                        <TableHead className="hidden md:table-cell whitespace-nowrap">Unit ID</TableHead>
                        <TableHead className="hidden lg:table-cell min-w-[8rem]">Unit</TableHead>
                        <TableHead className="hidden md:table-cell whitespace-nowrap">Chapter ID</TableHead>
                        <TableHead className="hidden lg:table-cell min-w-[10rem]">Chapter</TableHead>
                      </>
                    )}
                    {kind === "TEST" && (
                      <TableHead className="hidden sm:table-cell text-center whitespace-nowrap">
                        Total Marks
                      </TableHead>
                    )}
                    {kind === "EXAM" && (
                      <TableHead className="hidden sm:table-cell min-w-[8rem] whitespace-nowrap">
                        Module
                      </TableHead>
                    )}
                    <TableHead className="text-center whitespace-nowrap">Questions</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium align-top min-w-[10rem] max-w-[14rem] whitespace-normal">
                        <div>{item.title}</div>
                        {(kind === "QUIZ" || kind === "TEST") && (
                          <div className="mt-1 space-y-0.5 text-xs text-muted-foreground lg:hidden">
                            <p>Course: {displayValue(item.courseType ?? courseType)}</p>
                            {displayValue(item.unitNo) !== "—" && (
                              <p>Unit No: {displayValue(item.unitNo)}</p>
                            )}
                            {displayValue(item.unitId) !== "—" && (
                              <p>
                                Unit {displayValue(item.unitId)}: {displayValue(item.unit)}
                              </p>
                            )}
                            {displayValue(item.chapterId) !== "—" && (
                              <p>
                                Ch. {displayValue(item.chapterId)}: {displayValue(item.chapter)}
                              </p>
                            )}
                            {kind === "TEST" && displayValue(item.totalMarks) !== "—" && (
                              <p>Total marks: {displayValue(item.totalMarks)}</p>
                            )}
                          </div>
                        )}
                        {kind === "EXAM" && item.moduleTitle && (
                          <p className="mt-1 text-xs text-muted-foreground sm:hidden">
                            {item.moduleTitle}
                          </p>
                        )}
                      </TableCell>
                      {(kind === "QUIZ" || kind === "TEST") && (
                        <>
                          <TableCell className="hidden sm:table-cell text-muted-foreground whitespace-nowrap">
                            {displayValue(item.courseType ?? courseType)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground whitespace-nowrap">
                            {displayValue(item.unitNo)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground whitespace-nowrap">
                            {displayValue(item.unitId)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-normal">
                            {displayValue(item.unit)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground whitespace-nowrap">
                            {displayValue(item.chapterId)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-normal">
                            {displayValue(item.chapter)}
                          </TableCell>
                        </>
                      )}
                      {kind === "TEST" && (
                        <TableCell className="hidden sm:table-cell text-center text-muted-foreground whitespace-nowrap">
                          {displayValue(item.totalMarks)}
                        </TableCell>
                      )}
                      {kind === "EXAM" && (
                        <TableCell className="hidden sm:table-cell text-muted-foreground whitespace-normal">
                          {item.moduleTitle ?? "—"}
                        </TableCell>
                      )}
                      <TableCell className="text-center whitespace-nowrap align-top">
                        {item.noOfQuestions ?? "—"}
                      </TableCell>
                      <TableCell className="text-right align-top whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full gap-1"
                          onClick={() => navigate(`/my-courses/assessment/${item._id}/preview`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </section>
    </DashboardWithSidebarLayout>
  );
}
