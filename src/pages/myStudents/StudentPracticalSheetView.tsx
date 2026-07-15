import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ClipboardList, Loader2 } from "lucide-react";
import {
  createEmptyPracticalRows,
  getPracticalColumns,
  PRACTICAL_SHEET_ROW_COUNT,
  type PracticalColumn,
} from "@/constants/practicalSheet";
import {
  useGetStudentPracticalSheetQuery,
  type PracticalSheetRow,
} from "@/redux/services/apiSlices/practicalSheetSlice";

type SheetViewState = {
  name: string;
  startDate: string;
  dueDate: string;
  grade: string;
  rows: PracticalSheetRow[];
  exists: boolean;
};

function buildViewState(
  columns: PracticalColumn[],
  data?: Partial<SheetViewState> | null,
): SheetViewState {
  const emptyRows = createEmptyPracticalRows(columns);
  const incomingRows = data?.rows ?? [];

  return {
    name: data?.name ?? "",
    startDate: data?.startDate ?? "",
    dueDate: data?.dueDate ?? "",
    grade: data?.grade ?? "",
    exists: data?.exists ?? false,
    rows: emptyRows.map((fallback, index) => {
      const incoming = incomingRows[index];
      if (!incoming?.cells) return fallback;
      return {
        cells: Object.fromEntries(
          columns.map((col) => [col.key, incoming.cells?.[col.key] ?? ""]),
        ),
      };
    }),
  };
}

function isRowFilled(row: PracticalSheetRow, columns: PracticalColumn[]) {
  return columns.some((col) => (row.cells[col.key] ?? "").trim() !== "");
}

export default function StudentPracticalSheetView() {
  const { studentId, courseType } = useParams<{
    studentId: string;
    courseType: string;
  }>();
  const navigate = useNavigate();
  const decodedCourseType = decodeURIComponent(courseType ?? "");
  const columns = useMemo(
    () => getPracticalColumns(decodedCourseType),
    [decodedCourseType],
  );

  const { data, isLoading, isError } = useGetStudentPracticalSheetQuery(
    {
      studentId: studentId ?? "",
      courseType: decodedCourseType,
    },
    { skip: !studentId || !decodedCourseType || !columns },
  );

  const sheet = useMemo(() => {
    if (!columns) return null;
    if (data?.data) return buildViewState(columns, data.data);
    if (!isLoading) return buildViewState(columns);
    return null;
  }, [columns, data, isLoading]);

  const filledRows = useMemo(() => {
    if (!sheet || !columns) return [];
    return sheet.rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => isRowFilled(row, columns));
  }, [sheet, columns]);

  useEffect(() => {
    document.title = `${decodedCourseType || "Course"} Practical Sheet • iFuntology Teacher`;
  }, [decodedCourseType]);

  if (!columns) {
    return (
      <DashboardWithSidebarLayout>
        <section className="mx-auto w-full max-w-3xl space-y-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Practical sheet is not available for this course yet.
          </p>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => navigate(`/my-students/${studentId}`)}
          >
            Go back
          </Button>
        </section>
      </DashboardWithSidebarLayout>
    );
  }

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full space-y-6">
        <button
          onClick={() => navigate(`/my-students/${studentId}`)}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Student Profile
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">
              {decodedCourseType} — Practical Sheet
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Read-only view of the student&apos;s daily practical log.
            </p>
          </div>
          {data?.data?.exists === false && (
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <ClipboardList className="h-3.5 w-3.5" />
              Not started yet
            </div>
          )}
        </div>

        {isLoading || !sheet ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <Card className="rounded-2xl p-10 text-center text-sm text-muted-foreground">
            Unable to load practical sheet for this student.
          </Card>
        ) : (
          <>
            <Card className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="mt-1 font-semibold">{sheet.name || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="mt-1 font-semibold">{sheet.startDate || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="mt-1 font-semibold">{sheet.dueDate || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Grade</p>
                  <p className="mt-1 font-semibold">{sheet.grade || "—"}</p>
                </div>
              </div>
            </Card>

            {filledRows.length === 0 ? (
              <Card className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                No rows filled yet.
              </Card>
            ) : (
              <Card className="overflow-hidden rounded-2xl border border-slate-200 p-0 dark:border-slate-800">
                <div className="overflow-auto">
                  <table className="min-w-[1400px] w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/60">
                        <th className="sticky left-0 z-10 w-10 border border-slate-300 bg-slate-100 px-2 py-2 text-center font-bold dark:border-slate-700 dark:bg-slate-900">
                          #
                        </th>
                        {columns.map((col) => (
                          <th
                            key={col.key}
                            className="border border-slate-300 px-1 py-2 align-middle font-bold leading-tight text-slate-800 dark:border-slate-700 dark:text-slate-100"
                            style={{
                              width: col.key === "total" ? 70 : 95,
                              minWidth: col.key === "total" ? 70 : 95,
                            }}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filledRows.map(({ row, index }) => (
                        <tr key={index} className="bg-white dark:bg-slate-950">
                          <td className="sticky left-0 z-10 border border-slate-300 bg-slate-50 px-2 py-1.5 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                            {index + 1}
                          </td>
                          {columns.map((col) => (
                            <td
                              key={col.key}
                              className="border border-slate-300 px-1 py-1.5 text-center text-slate-900 dark:border-slate-700 dark:text-slate-100"
                            >
                              {row.cells[col.key] || ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-slate-200 px-4 py-3 text-xs text-muted-foreground dark:border-slate-800">
                  {filledRows.length} of {PRACTICAL_SHEET_ROW_COUNT} rows filled
                </div>
              </Card>
            )}
          </>
        )}
      </section>
    </DashboardWithSidebarLayout>
  );
}
