import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Loader2,
  User,
} from "lucide-react";
import {
  currentMonthRange,
  formatEntryDateLabel,
  todayDateString,
} from "@/constants/practicalSheet";
import {
  useBulkApproveTodayPracticalEntriesMutation,
  useGetTeacherPracticalEntriesQuery,
  type TeacherPracticalEntry,
} from "@/redux/services/apiSlices/practicalSheetSlice";

const COURSE_FILTERS = [
  { value: "all", label: "All courses" },
  { value: "Funtology", label: "Funtology" },
  { value: "Skintology", label: "Skintology" },
  { value: "Nailtology", label: "Nailtology" },
  { value: "Barbertology", label: "Barbertology" },
] as const;

export default function PracticalSheetsPage() {
  const navigate = useNavigate();
  const defaultRange = useMemo(() => currentMonthRange(), []);
  const [courseType, setCourseType] = useState<string>("all");
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [appliedCourseType, setAppliedCourseType] = useState<string>("all");
  const [appliedFrom, setAppliedFrom] = useState(defaultRange.from);
  const [appliedTo, setAppliedTo] = useState(defaultRange.to);
  const [page, setPage] = useState(1);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const queryArgs = useMemo(
    () => ({
      page,
      limit: 20,
      from: appliedFrom,
      to: appliedTo,
      ...(appliedCourseType !== "all" ? { courseType: appliedCourseType } : {}),
    }),
    [page, appliedFrom, appliedTo, appliedCourseType],
  );

  const { data, isLoading, isFetching, isError } =
    useGetTeacherPracticalEntriesQuery(queryArgs);
  const [bulkApproveToday, { isLoading: isBulkApproving }] =
    useBulkApproveTodayPracticalEntriesMutation();

  const payload = data?.data;
  const docs: TeacherPracticalEntry[] = payload?.docs ?? [];
  const totalDocs = payload?.totalDocs ?? 0;
  const totalPages = Math.max(1, payload?.totalPages ?? 1);
  const today = payload?.today ?? todayDateString();
  const pendingTodayCount = useMemo(
    () => docs.filter((d) => d.entryDate === today && !d.approved).length,
    [docs, today],
  );

  useEffect(() => {
    document.title = "Practical Sheets • iFuntology Teacher";
  }, []);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const applyFilters = () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }
    if (fromDate > toDate) {
      toast.error("From date cannot be after to date");
      return;
    }
    setAppliedCourseType(courseType);
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setPage(1);
  };

  const resetToCurrentMonth = () => {
    const range = currentMonthRange();
    setCourseType("all");
    setFromDate(range.from);
    setToDate(range.to);
    setAppliedCourseType("all");
    setAppliedFrom(range.from);
    setAppliedTo(range.to);
    setPage(1);
  };

  const handleBulkApprove = async () => {
    try {
      const res: any = await bulkApproveToday({
        ...(appliedCourseType !== "all"
          ? { courseType: appliedCourseType }
          : {}),
      }).unwrap();
      if (res?.status === false) {
        throw new Error(res?.message ?? "Failed to bulk approve");
      }
      toast.success(res?.message ?? "Today's entries approved");
      setBulkConfirmOpen(false);
    } catch (error: any) {
      toast.error(
        error?.data?.message ?? error?.message ?? "Failed to bulk approve",
      );
    }
  };

  const openEntryDetails = (entry: TeacherPracticalEntry) => {
    navigate(
      `/practical-sheets/${entry.studentId}/${encodeURIComponent(entry.courseType)}/${entry.entryDate}`,
    );
  };

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Practical Sheets</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review daily practical entries from your students without opening each
              student sheet.
            </p>
          </div>
          <Button
            type="button"
            className="rounded-xl bg-lime-600 text-white hover:bg-lime-700"
            onClick={() => setBulkConfirmOpen(true)}
            disabled={isBulkApproving}
          >
            {isBulkApproving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-4 w-4" />
            )}
            Bulk Approve Today
          </Button>
        </div>

        <Card className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Course</Label>
                <Select value={courseType} onValueChange={setCourseType}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="Course type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_FILTERS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="h-10 rounded-xl bg-lime-600 text-white hover:bg-lime-700"
                onClick={applyFilters}
                disabled={isFetching}
              >
                Apply
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl"
                onClick={resetToCurrentMonth}
                disabled={isFetching}
              >
                This month
              </Button>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <ClipboardList className="h-4 w-4 text-lime-600" />
              Daily Entries
            </h2>
            <p className="text-xs text-muted-foreground">
              {totalDocs} entr{totalDocs === 1 ? "y" : "ies"}
              {pendingTodayCount > 0
                ? ` · ${pendingTodayCount} pending today on this page`
                : ""}
              {isFetching ? " · refreshing…" : ""}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Unable to load practical entries.
            </div>
          ) : !docs.length ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No filled entries in this date range.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground dark:bg-slate-900/60">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Course</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                      <th className="px-4 py-3 font-semibold">Approval</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((entry) => {
                      const isToday = entry.entryDate === today;
                      return (
                        <tr
                          key={`${entry.studentId}-${entry.courseType}-${entry.entryDate}`}
                          className="border-t border-slate-200 dark:border-slate-800"
                        >
                          <td className="px-4 py-3 font-medium whitespace-nowrap">
                            {formatEntryDateLabel(entry.entryDate)}
                            {isToday ? (
                              <span className="ml-2 rounded-full bg-lime-500/15 px-2 py-0.5 text-[10px] font-bold text-lime-700 dark:text-lime-400">
                                Today
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <button
                                type="button"
                                className="font-medium hover:underline"
                                onClick={() =>
                                  navigate(`/my-students/${entry.studentId}`)
                                }
                              >
                                {entry.studentName}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {entry.courseType}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {entry.total || "—"}
                          </td>
                          <td className="px-4 py-3">
                            {entry.approved ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approved
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openEntryDetails(entry)}
                              aria-label="View entry details"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={page >= totalPages || isFetching}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </section>

      <Dialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk approve today?</DialogTitle>
            <DialogDescription>
              This will approve all pending practical entries for{" "}
              <strong>{formatEntryDateLabel(today)}</strong>
              {appliedCourseType !== "all"
                ? ` in ${appliedCourseType}`
                : " across all courses"}
              . Already approved entries will be skipped.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={isBulkApproving}
              onClick={() => setBulkConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-lime-600 text-white hover:bg-lime-700"
              disabled={isBulkApproving}
              onClick={handleBulkApprove}
            >
              {isBulkApproving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              Approve all today
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardWithSidebarLayout>
  );
}
