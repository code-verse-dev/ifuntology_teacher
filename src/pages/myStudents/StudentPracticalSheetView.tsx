import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Coins,
  Download,
  Filter,
  Loader2,
  Save,
  Search,
  User,
} from "lucide-react";
import {
  computeRowCreditTotal,
  currentMonthRange,
  formatEntryDateLabel,
  getPracticalColumnIcon,
  getPracticalColumns,
  getPracticalRowStatus,
  PRACTICAL_SHEET_INTRO,
  PRACTICAL_SHEET_LOG_TITLE,
  type PracticalColumn,
  type PracticalRowStatus,
} from "@/constants/practicalSheet";
import {
  useGetStudentPracticalSheetQuery,
  useTeacherUpdatePracticalEntryMutation,
  type PracticalSheetMonthProgress,
  type PracticalSheetRow,
} from "@/redux/services/apiSlices/practicalSheetSlice";

type SheetViewState = {
  name: string;
  creditWeights: Record<string, string>;
  monthProgress: PracticalSheetMonthProgress | null;
  today: string | null;
  rows: PracticalSheetRow[];
  exists: boolean;
};

type StatusFilter = "all" | PracticalRowStatus;

const ROWS_PER_PAGE_OPTIONS = [10, 20, 30];

const STATUS_META: Record<
  PracticalRowStatus,
  { label: string; dot: string; badge: string }
> = {
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30",
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-amber-500",
    badge:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30",
  },
  "not-started": {
    label: "Not Started",
    dot: "bg-rose-500",
    badge:
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30",
  },
};

function normalizeRow(
  row: PracticalSheetRow,
  columns: PracticalColumn[],
): PracticalSheetRow {
  const cells = Object.fromEntries(
    columns.map((col) => [
      col.key,
      col.key === "total" ? "" : (row.cells?.[col.key] ?? ""),
    ]),
  );
  cells.total = computeRowCreditTotal(cells, columns);
  return {
    entryDate: row.entryDate ?? null,
    cells,
    approved: Boolean(row.approved),
    approvedAt: row.approvedAt ?? null,
    approvedBy: row.approvedBy ?? null,
  };
}

function buildViewState(
  columns: PracticalColumn[],
  data?: Partial<SheetViewState> | null,
): SheetViewState {
  const incomingRows = data?.rows ?? [];
  return {
    name: data?.name ?? "",
    creditWeights: data?.creditWeights ?? {},
    monthProgress: data?.monthProgress ?? null,
    today: data?.today ?? null,
    exists: data?.exists ?? false,
    rows: incomingRows.map((row) => normalizeRow(row, columns)),
  };
}

function ProgressRing({ percent }: { percent: number }) {
  const size = 76;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-200 dark:stroke-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="url(#practicalProgressTeacher)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
        <defs>
          <linearGradient
            id="practicalProgressTeacher"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-extrabold">{percent}%</span>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string | number;
  tone: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-extrabold leading-none">{value}</p>
        <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
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

  const defaultRange = useMemo(() => currentMonthRange(), []);
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [appliedFrom, setAppliedFrom] = useState(defaultRange.from);
  const [appliedTo, setAppliedTo] = useState(defaultRange.to);

  const { data, isLoading, isError, isFetching } =
    useGetStudentPracticalSheetQuery(
      {
        studentId: studentId ?? "",
        courseType: decodedCourseType,
        from: appliedFrom,
        to: appliedTo,
      },
      { skip: !studentId || !decodedCourseType || !columns },
    );
  const [updateEntry, { isLoading: isUpdatingEntry }] =
    useTeacherUpdatePracticalEntryMutation();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sheet, setSheet] = useState<SheetViewState | null>(null);
  const [savingEntryDate, setSavingEntryDate] = useState<string | null>(null);

  useEffect(() => {
    if (!columns) return;
    if (data?.data) {
      setSheet(buildViewState(columns, data.data));
      return;
    }
    if (!isLoading) {
      setSheet((prev) => prev ?? buildViewState(columns));
    }
  }, [columns, data, isLoading]);

  const updateCell = (entryDate: string, columnKey: string, value: string) => {
    if (!columns || columnKey === "total") return;
    setSheet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((row) => {
          if (row.entryDate !== entryDate) return row;
          const cells = { ...row.cells, [columnKey]: value };
          cells.total = computeRowCreditTotal(cells, columns);
          return { ...row, cells };
        }),
      };
    });
  };

  const persistEntry = async (entryDate: string, approve: boolean) => {
    if (!sheet || !studentId || !columns || !entryDate) return;
    const row = sheet.rows.find((r) => r.entryDate === entryDate);
    if (!row) return;
    setSavingEntryDate(entryDate);
    try {
      const res = await updateEntry({
        studentId,
        courseType: decodedCourseType,
        entryDate,
        cells: row.cells,
        approve,
      }).unwrap();
      if (res?.status === false) {
        throw new Error(res?.message ?? "Failed to update entry");
      }
      if (res?.data) {
        setSheet(buildViewState(columns, { ...res.data, exists: true }));
      }
      toast.success(
        approve
          ? `Entry for ${formatEntryDateLabel(entryDate)} saved and approved`
          : `Entry for ${formatEntryDateLabel(entryDate)} saved`,
      );
    } catch (error: any) {
      toast.error(
        error?.data?.message ?? error?.message ?? "Failed to update entry",
      );
    } finally {
      setSavingEntryDate(null);
    }
  };

  const applyDateFilter = () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }
    if (fromDate > toDate) {
      toast.error("From date cannot be after to date");
      return;
    }
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  const resetToCurrentMonth = () => {
    const range = currentMonthRange();
    setFromDate(range.from);
    setToDate(range.to);
    setAppliedFrom(range.from);
    setAppliedTo(range.to);
  };

  const monthProgress = sheet?.monthProgress;

  const stats = useMemo(() => {
    if (!sheet || !columns) {
      return { total: 0, approved: 0, pending: 0, totalCredits: "0" };
    }
    let approved = 0;
    let creditSum = 0;
    sheet.rows.forEach((row) => {
      if (row.approved) approved += 1;
      const total = computeRowCreditTotal(row.cells, columns);
      if (total) creditSum += Number(total);
    });
    const rounded = Math.round(creditSum * 100) / 100;
    return {
      total: sheet.rows.length,
      approved,
      pending: sheet.rows.length - approved,
      totalCredits: Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2),
    };
  }, [sheet, columns]);

  const visibleRows = useMemo(() => {
    if (!sheet || !columns) return [];
    const query = search.trim().toLowerCase();
    return sheet.rows
      .map((row) => ({
        row,
        status: getPracticalRowStatus(row.cells, columns),
      }))
      .filter(({ status }) => statusFilter === "all" || status === statusFilter)
      .filter(({ row }) => {
        if (!query) return true;
        const label = formatEntryDateLabel(row.entryDate).toLowerCase();
        if (label.includes(query)) return true;
        if ((row.entryDate ?? "").includes(query)) return true;
        return columns!.some((col) =>
          (row.cells[col.key] ?? "").toLowerCase().includes(query),
        );
      })
      .sort((a, b) =>
        String(b.row.entryDate ?? "").localeCompare(String(a.row.entryDate ?? "")),
      );
  }, [sheet, columns, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(visibleRows.length / rowsPerPage));

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search, rowsPerPage, appliedFrom, appliedTo]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedRows = useMemo(
    () => visibleRows.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [visibleRows, page, rowsPerPage],
  );

  useEffect(() => {
    document.title = `${decodedCourseType || "Course"} Practical Sheet • iFuntology Teacher`;
  }, [decodedCourseType]);

  const handleExport = () => {
    if (!sheet || !columns) return;
    const escape = (value: string) => `"${(value ?? "").replace(/"/g, '""')}"`;
    const header = [
      "Date",
      "Approved",
      ...columns.map((col) => col.label),
    ];
    const lines = sheet.rows.map((row) => [
      row.entryDate ?? "",
      row.approved ? "Yes" : "No",
      ...columns.map((col) =>
        col.key === "total"
          ? computeRowCreditTotal(row.cells, columns)
          : (row.cells[col.key] ?? ""),
      ),
    ]);
    const csv = [header, ...lines]
      .map((line) => line.map(escape).join(","))
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sheet.name || "student"}-${decodedCourseType}-practical-sheet.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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

  const notStarted = data?.data?.exists === false;
  const pageStart = visibleRows.length === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const pageEnd = Math.min(page * rowsPerPage, visibleRows.length);
  const qtyColumns = columns.filter((col) => col.key !== "total");

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
              {decodedCourseType} – Practical Sheet
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {PRACTICAL_SHEET_INTRO}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {PRACTICAL_SHEET_LOG_TITLE} · Edit an entry, then Save or Approve ·
              Approved entries are locked for the student
            </p>
          </div>
          <div className="flex items-center gap-2">
            {notStarted && (
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <ClipboardList className="h-3.5 w-3.5" />
                Not started yet
              </div>
            )}
            <Button
              variant="outline"
              className="gap-2 rounded-xl font-semibold"
              onClick={handleExport}
              disabled={!sheet || !sheet.rows.length}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
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
              <label className="block max-w-md space-y-1.5 text-sm">
                <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Student Name
                </span>
                <Input
                  value={sheet.name || "—"}
                  disabled
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </label>
            </Card>

            <Card className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <ProgressRing percent={monthProgress?.percent ?? 0} />
                  <div>
                    <p className="text-sm font-bold">Monthly Progress</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {monthProgress?.filled ?? 0} of {monthProgress?.totalDays ?? 0}{" "}
                      days filled this month
                    </p>
                    <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-lime-500 to-violet-500 transition-all"
                        style={{ width: `${monthProgress?.percent ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
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
                  <Button
                    type="button"
                    className="h-10 rounded-xl bg-lime-600 text-white hover:bg-lime-700"
                    onClick={applyDateFilter}
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

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatBox
                  label="Entries in Range"
                  value={stats.total}
                  tone="bg-sky-500/15 text-sky-600 dark:text-sky-400"
                  icon={<CalendarRange className="h-4 w-4" />}
                />
                <StatBox
                  label="Approved"
                  value={stats.approved}
                  tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  icon={<CalendarCheck className="h-4 w-4" />}
                />
                <StatBox
                  label="Pending Approval"
                  value={stats.pending}
                  tone="bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  icon={<ClipboardList className="h-4 w-4" />}
                />
                <StatBox
                  label="Total Credits"
                  value={stats.totalCredits}
                  tone="bg-violet-500/15 text-violet-600 dark:text-violet-400"
                  icon={<Coins className="h-4 w-4" />}
                />
              </div>
            </Card>

            {qtyColumns.length > 0 && (
              <Card className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Credit Weights Reference
                </p>
                <div className="flex flex-wrap gap-2">
                  {qtyColumns.map((col) => {
                    const Icon = getPracticalColumnIcon(col.key);
                    const weight = sheet.creditWeights?.[col.key] ?? "";
                    return (
                      <div
                        key={col.key}
                        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                        title={col.label}
                      >
                        <Icon className="h-3.5 w-3.5 text-violet-500" />
                        <span className="max-w-[140px] truncate">{col.label}</span>
                        <span className="rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-400">
                          ×{weight || "1"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                  <ClipboardList className="h-4 w-4 text-lime-600" />
                  Daily Entries
                  {isFetching && (
                    <span className="text-xs font-normal text-muted-foreground">
                      · refreshing…
                    </span>
                  )}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                  >
                    <SelectTrigger className="h-9 w-[150px] rounded-xl">
                      <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue placeholder="Filters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="not-started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search date…"
                      className="h-9 w-[180px] rounded-xl pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-auto">
                <table className="min-w-[1500px] w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60">
                      <th className="sticky left-0 z-10 w-32 border border-slate-200 bg-slate-100 px-2 py-3 text-center font-bold dark:border-slate-800 dark:bg-slate-900">
                        Date
                      </th>
                      {columns.map((col) => {
                        const Icon = getPracticalColumnIcon(col.key);
                        return (
                          <th
                            key={col.key}
                            className="border border-slate-200 px-1 py-2 align-top font-bold leading-tight text-slate-700 dark:border-slate-800 dark:text-slate-100"
                            style={{
                              width: col.key === "total" ? 72 : 96,
                              minWidth: col.key === "total" ? 72 : 96,
                            }}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <Icon className="h-4 w-4 text-violet-500" />
                              <span>{col.label}</span>
                            </div>
                          </th>
                        );
                      })}
                      <th className="sticky right-0 z-10 w-[11rem] border border-slate-200 bg-slate-100 px-2 py-3 text-center font-bold dark:border-slate-800 dark:bg-slate-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length + 2}
                          className="border border-slate-200 px-4 py-10 text-center text-sm text-muted-foreground dark:border-slate-800"
                        >
                          No entries match your filters in this date range.
                        </td>
                      </tr>
                    ) : (
                      pagedRows.map(({ row, status }) => {
                        const entryDate = row.entryDate ?? "";
                        const meta = STATUS_META[status];
                        const isApproved = Boolean(row.approved);
                        const isToday = sheet.today && entryDate === sheet.today;
                        const displayTotal = computeRowCreditTotal(row.cells, columns);
                        const rowBusy =
                          isUpdatingEntry && savingEntryDate === entryDate;
                        return (
                          <tr
                            key={entryDate}
                            className={
                              isApproved
                                ? "bg-emerald-50/70 dark:bg-emerald-950/20"
                                : "bg-white dark:bg-slate-950"
                            }
                          >
                            <td className="sticky left-0 z-10 border border-slate-200 bg-slate-50 px-2 py-1.5 text-center dark:border-slate-800 dark:bg-slate-900">
                              <div className="flex flex-col items-center gap-1">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    isApproved
                                      ? "bg-emerald-500/20 text-emerald-700 ring-1 ring-emerald-500/40 dark:text-emerald-300"
                                      : meta.badge
                                  }`}
                                >
                                  <Calendar className="h-3 w-3" />
                                  {formatEntryDateLabel(entryDate)}
                                </span>
                                {isToday && (
                                  <span className="rounded-full bg-lime-500/15 px-1.5 py-0.5 text-[9px] font-bold text-lime-700 dark:text-lime-400">
                                    Today
                                  </span>
                                )}
                              </div>
                            </td>
                            {columns.map((col) => {
                              const isTotal = col.key === "total";
                              const value = isTotal
                                ? displayTotal
                                : (row.cells[col.key] ?? "");
                              return (
                                <td
                                  key={col.key}
                                  className="border border-slate-200 p-0 dark:border-slate-800"
                                >
                                  {isTotal ? (
                                    <div className="flex h-9 w-full items-center justify-center px-1 text-center text-[11px] font-semibold text-slate-800 dark:text-slate-100">
                                      {value}
                                    </div>
                                  ) : (
                                    <input
                                      className="h-9 w-full bg-transparent px-1 text-center text-[11px] text-slate-900 outline-none placeholder:text-slate-400 focus:bg-lime-50 dark:text-slate-100 dark:focus:bg-lime-950/30"
                                      value={value}
                                      onChange={(e) =>
                                        updateCell(entryDate, col.key, e.target.value)
                                      }
                                      placeholder="0"
                                      inputMode="decimal"
                                    />
                                  )}
                                </td>
                              );
                            })}
                            <td className="sticky right-0 z-10 border border-slate-200 bg-white px-1 py-1 text-center dark:border-slate-800 dark:bg-slate-950">
                              <div className="flex flex-col items-center gap-1 py-0.5">
                                {isApproved && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Approved
                                  </span>
                                )}
                                <div className="flex flex-wrap items-center justify-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 gap-1 rounded-full px-2 text-[10px]"
                                    onClick={() => persistEntry(entryDate, false)}
                                    disabled={isUpdatingEntry}
                                  >
                                    {rowBusy ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Save className="h-3 w-3" />
                                    )}
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 gap-1 rounded-full bg-lime-600 px-2 text-[10px] text-white hover:bg-lime-700"
                                    onClick={() => persistEntry(entryDate, true)}
                                    disabled={isUpdatingEntry}
                                  >
                                    {rowBusy ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-3 w-3" />
                                    )}
                                    {isApproved ? "Re-approve" : "Approve"}
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-200 p-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-muted-foreground">
                  {(
                    ["completed", "in-progress", "not-started"] as PracticalRowStatus[]
                  ).map((key) => (
                    <span key={key} className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${STATUS_META[key].dot}`} />
                      {STATUS_META[key].label}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                    Rows per page:
                    <Select
                      value={String(rowsPerPage)}
                      onValueChange={(value) => setRowsPerPage(Number(value))}
                    >
                      <SelectTrigger className="h-8 w-[70px] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROWS_PER_PAGE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={String(option)}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {pageStart}-{pageEnd} of {visibleRows.length}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </section>
    </DashboardWithSidebarLayout>
  );
}
