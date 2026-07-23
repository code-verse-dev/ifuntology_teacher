import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Award,
  Calendar,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Filter,
  Loader2,
  Search,
  User,
  Users,
} from "lucide-react";
import {
  computeRowCreditTotal,
  createEmptyPracticalRows,
  getPracticalColumnIcon,
  getPracticalColumns,
  getPracticalRowStatus,
  PRACTICAL_SHEET_DATA_ROW_COUNT,
  PRACTICAL_SHEET_INTRO,
  PRACTICAL_SHEET_LOG_TITLE,
  type PracticalColumn,
  type PracticalRowStatus,
} from "@/constants/practicalSheet";
import {
  useGetStudentPracticalSheetQuery,
  type PracticalSheetRow,
} from "@/redux/services/apiSlices/practicalSheetSlice";

type SheetViewState = {
  name: string;
  batchClass: string;
  startDate: string;
  dueDate: string;
  grade: string;
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

function buildViewState(
  columns: PracticalColumn[],
  data?: Partial<SheetViewState> | null,
): SheetViewState {
  const emptyRows = createEmptyPracticalRows(columns);
  const incomingRows = data?.rows ?? [];

  return {
    name: data?.name ?? "",
    batchClass: data?.batchClass ?? "",
    startDate: data?.startDate ?? "",
    dueDate: data?.dueDate ?? "",
    grade: data?.grade ?? "",
    exists: data?.exists ?? false,
    rows: emptyRows.map((fallback, index) => {
      if (index === 0) return fallback;
      const incoming = incomingRows[index];
      if (!incoming?.cells) return fallback;
      const cells = Object.fromEntries(
        columns.map((col) => [
          col.key,
          col.key === "total" ? "" : (incoming.cells?.[col.key] ?? ""),
        ]),
      );
      cells.total = computeRowCreditTotal(cells, columns);
      return { cells };
    }),
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
  value: number;
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

function InfoField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-semibold">{value || "—"}</p>
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

  const { data, isLoading, isError } = useGetStudentPracticalSheetQuery(
    {
      studentId: studentId ?? "",
      courseType: decodedCourseType,
    },
    { skip: !studentId || !decodedCourseType || !columns },
  );

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const sheet = useMemo(() => {
    if (!columns) return null;
    if (data?.data) return buildViewState(columns, data.data);
    if (!isLoading) return buildViewState(columns);
    return null;
  }, [columns, data, isLoading]);

  const stats = useMemo(() => {
    const total = PRACTICAL_SHEET_DATA_ROW_COUNT;
    if (!sheet || !columns) {
      return { completed: 0, inProgress: 0, notStarted: total, remaining: total, percent: 0 };
    }
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    sheet.rows.forEach((row, index) => {
      if (index === 0) return;
      const status = getPracticalRowStatus(row.cells, columns);
      if (status === "completed") completed += 1;
      else if (status === "in-progress") inProgress += 1;
      else notStarted += 1;
    });
    const percent = total ? Math.round((completed / total) * 100) : 0;
    return { completed, inProgress, notStarted, remaining: total - completed, percent };
  }, [sheet, columns]);

  const visibleRows = useMemo(() => {
    if (!sheet || !columns) return [];
    const query = search.trim().toLowerCase();
    return sheet.rows
      .map((row, index) => ({
        row,
        index,
        status: getPracticalRowStatus(row.cells, columns),
        isWeightRow: index === 0,
      }))
      .filter(({ index, status }) => {
        if (index === 0) return statusFilter === "all";
        return statusFilter === "all" || status === statusFilter;
      })
      .filter(({ index, row }) => {
        if (!query) return true;
        if (index === 0) return "credits".includes(query) || "0".includes(query);
        if (String(index).includes(query)) return true;
        return columns!.some((col) =>
          (row.cells[col.key] ?? "").toLowerCase().includes(query),
        );
      });
  }, [sheet, columns, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(visibleRows.length / rowsPerPage));

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search, rowsPerPage]);

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
    const header = ["Day", ...columns.map((col) => col.label)];
    const lines = sheet.rows.map((row, index) => [
      index === 0 ? "Credits" : String(index),
      ...columns.map((col) =>
        col.key === "total" && index > 0
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
              {PRACTICAL_SHEET_LOG_TITLE} · Read-only · Row 0 = credit times · TOTAL =
              count × credit time
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
              disabled={!sheet}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <InfoField
                  label="Student Name"
                  value={sheet.name}
                  icon={<User className="h-3.5 w-3.5" />}
                />
                <InfoField
                  label="Batch / Class"
                  value={sheet.batchClass}
                  icon={<Users className="h-3.5 w-3.5" />}
                />
                <InfoField
                  label="Start Date"
                  value={sheet.startDate}
                  icon={<Calendar className="h-3.5 w-3.5" />}
                />
                <InfoField
                  label="Due Date"
                  value={sheet.dueDate}
                  icon={<CalendarClock className="h-3.5 w-3.5" />}
                />
                <InfoField
                  label="Grade"
                  value={sheet.grade}
                  icon={<Award className="h-3.5 w-3.5" />}
                />
              </div>
            </Card>

            <Card className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                <div className="flex items-center gap-4 lg:w-72 lg:shrink-0">
                  <ProgressRing percent={stats.percent} />
                  <div>
                    <p className="text-sm font-bold">Overall Progress</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {stats.completed} of {PRACTICAL_SHEET_DATA_ROW_COUNT} days completed
                    </p>
                    <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-lime-500 to-violet-500 transition-all"
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatBox
                    label="Completed"
                    value={stats.completed}
                    tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    icon={<ClipboardList className="h-4 w-4" />}
                  />
                  <StatBox
                    label="In Progress"
                    value={stats.inProgress}
                    tone="bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    icon={<Loader2 className="h-4 w-4" />}
                  />
                  <StatBox
                    label="Not Started"
                    value={stats.notStarted}
                    tone="bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    icon={<CalendarClock className="h-4 w-4" />}
                  />
                  <StatBox
                    label="Days Remaining"
                    value={stats.remaining}
                    tone="bg-sky-500/15 text-sky-600 dark:text-sky-400"
                    icon={<Calendar className="h-4 w-4" />}
                  />
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                  <ClipboardList className="h-4 w-4 text-lime-600" />
                  Daily Entry
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
                      placeholder="Search day…"
                      className="h-9 w-[180px] rounded-xl pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-auto">
                <table className="min-w-[1400px] w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60">
                      <th className="sticky left-0 z-10 w-12 border border-slate-200 bg-slate-100 px-2 py-3 text-center font-bold dark:border-slate-800 dark:bg-slate-900">
                        Day
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
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          className="border border-slate-200 px-4 py-10 text-center text-sm text-muted-foreground dark:border-slate-800"
                        >
                          No days match your filters.
                        </td>
                      </tr>
                    ) : (
                      pagedRows.map(({ row, index, status, isWeightRow }) => {
                        const meta = STATUS_META[status];
                        const displayTotal = isWeightRow
                          ? ""
                          : computeRowCreditTotal(row.cells, columns);
                        return (
                          <tr
                            key={index}
                            className={
                              isWeightRow
                                ? "bg-amber-50 dark:bg-amber-950/20"
                                : "bg-white dark:bg-slate-950"
                            }
                          >
                            <td className="sticky left-0 z-10 border border-slate-200 bg-slate-50 px-2 py-1.5 text-center dark:border-slate-800 dark:bg-slate-900">
                              <span
                                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                                  isWeightRow
                                    ? "bg-amber-500/20 text-amber-700 ring-1 ring-amber-500/40 dark:text-amber-300"
                                    : meta.badge
                                }`}
                              >
                                {isWeightRow ? "0" : index}
                              </span>
                            </td>
                            {columns.map((col) => (
                              <td
                                key={col.key}
                                className="border border-slate-200 px-1 py-1.5 text-center font-medium text-slate-900 dark:border-slate-800 dark:text-slate-100"
                              >
                                {col.key === "total"
                                  ? displayTotal
                                  : row.cells[col.key] || ""}
                              </td>
                            ))}
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
