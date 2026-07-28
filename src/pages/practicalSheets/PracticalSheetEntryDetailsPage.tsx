import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";
import {
  computeRowCreditTotal,
  formatEntryDateLabel,
  getPracticalColumnIcon,
  getPracticalColumns,
  todayDateString,
} from "@/constants/practicalSheet";
import {
  useGetStudentPracticalSheetQuery,
  useTeacherUpdatePracticalEntryMutation,
} from "@/redux/services/apiSlices/practicalSheetSlice";

export default function PracticalSheetEntryDetailsPage() {
  const navigate = useNavigate();
  const { studentId, courseType, entryDate } = useParams<{
    studentId: string;
    courseType: string;
    entryDate: string;
  }>();
  const decodedCourseType = decodeURIComponent(courseType ?? "");
  const columns = useMemo(
    () => getPracticalColumns(decodedCourseType),
    [decodedCourseType],
  );
  const qtyCols = useMemo(
    () => columns?.filter((c) => c.key !== "total") ?? [],
    [columns],
  );

  const { data, isLoading, isError } = useGetStudentPracticalSheetQuery(
    {
      studentId: studentId ?? "",
      courseType: decodedCourseType,
      from: entryDate,
      to: entryDate,
    },
    { skip: !studentId || !decodedCourseType || !entryDate || !columns },
  );
  const [updateEntry, { isLoading: isSaving }] =
    useTeacherUpdatePracticalEntryMutation();

  const sheet = data?.data;
  const entry = useMemo(() => {
    const rows = sheet?.rows ?? [];
    return rows.find((r: any) => r.entryDate === entryDate) ?? null;
  }, [sheet, entryDate]);

  const [cells, setCells] = useState<Record<string, string>>({});
  const today = todayDateString();
  const isToday = entryDate === today;
  const canEdit = Boolean(entry) && isToday && !entry?.approved;

  useEffect(() => {
    document.title = `Practical Entry • ${decodedCourseType || "Course"}`;
  }, [decodedCourseType]);

  useEffect(() => {
    if (entry?.cells) {
      setCells({ ...entry.cells });
    }
  }, [entry]);

  const updateCell = (key: string, value: string) => {
    if (!canEdit || !columns || key === "total") return;
    setCells((prev) => {
      const next = { ...prev, [key]: value };
      next.total = computeRowCreditTotal(next, columns);
      return next;
    });
  };

  const persist = async (approve: boolean) => {
    if (!studentId || !entryDate || !columns) return;
    if (!canEdit && !approve) return;
    if (approve && (!isToday || entry?.approved)) {
      toast.message("Only today's pending entry can be approved here");
      return;
    }
    try {
      const res: any = await updateEntry({
        studentId,
        courseType: decodedCourseType,
        entryDate,
        cells: canEdit ? cells : entry?.cells,
        approve,
      }).unwrap();
      if (res?.status === false) {
        throw new Error(res?.message ?? "Failed to update entry");
      }
      toast.success(
        approve ? "Entry saved and approved" : "Entry saved successfully",
      );
    } catch (error: any) {
      toast.error(
        error?.data?.message ?? error?.message ?? "Failed to update entry",
      );
    }
  };

  if (!columns) {
    return (
      <DashboardWithSidebarLayout>
        <section className="mx-auto w-full max-w-3xl space-y-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Practical sheet is not available for this course.
          </p>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => navigate("/practical-sheets")}
          >
            Back
          </Button>
        </section>
      </DashboardWithSidebarLayout>
    );
  }

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full space-y-6">
        <button
          type="button"
          onClick={() => navigate("/practical-sheets")}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Practical Sheets
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError || !entry ? (
          <Card className="rounded-2xl p-10 text-center text-sm text-muted-foreground">
            Entry not found for this date.
          </Card>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold">
                  {sheet?.name || "Student"} · {decodedCourseType}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Entry for {formatEntryDateLabel(entryDate)}
                  {isToday ? " (today)" : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {entry.approved ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approved
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Pending
                  </span>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() =>
                    navigate(
                      `/my-students/${studentId}/practical-sheet/${encodeURIComponent(decodedCourseType)}`,
                    )
                  }
                >
                  Open full sheet
                </Button>
              </div>
            </div>

            <Card className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold">Entry details</h2>
                  <p className="text-sm text-muted-foreground">
                    {canEdit
                      ? "You can edit quantities before approving today's entry."
                      : entry.approved
                        ? "This entry is approved and locked."
                        : "Past entries are view-only from this page."}
                  </p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold dark:bg-slate-800">
                  Total credits:{" "}
                  {computeRowCreditTotal(cells, columns) || entry.cells?.total || "—"}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {qtyCols.map((col) => {
                  const Icon = getPracticalColumnIcon(col.key);
                  return (
                    <div
                      key={col.key}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: col.bg, color: col.text }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{col.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Credit × {col.creditWeight}
                        </p>
                      </div>
                      <div className="w-24 space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">
                          Qty
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          step="1"
                          value={cells[col.key] ?? ""}
                          onChange={(e) => updateCell(col.key, e.target.value)}
                          disabled={!canEdit || isSaving}
                          className="h-9 rounded-xl"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {canEdit ? (
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    disabled={isSaving}
                    onClick={() => persist(false)}
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save changes
                  </Button>
                  <Button
                    type="button"
                    className="rounded-full bg-lime-600 text-white hover:bg-lime-700"
                    disabled={isSaving}
                    onClick={() => persist(true)}
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Save &amp; Approve
                  </Button>
                </div>
              ) : null}
            </Card>
          </>
        )}
      </section>
    </DashboardWithSidebarLayout>
  );
}
