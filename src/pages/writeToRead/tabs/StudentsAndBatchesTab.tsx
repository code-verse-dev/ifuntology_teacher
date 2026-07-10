import { useCallback, useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
  Copy,
  Upload,
  Filter,
  MoreVertical,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ResetStudentPasswordDialog from "@/components/students/ResetStudentPasswordDialog";
import {
  useCreateInviteBatchMutation,
  useCreateInviteBatchCsvMutation,
  useGetInviteBatchesQuery,
  type InviteRowInput,
} from "@/redux/services/apiSlices/batchSlice";
import { useGetMyWtrSubscriptionQuery } from "@/redux/services/apiSlices/paymentSlice";

type InviteRow = {
  email: string;
  firstName: string;
  lastName: string;
  rowStatus?: string;
  booksCount?: number;
  createdUser?: string;
};

export type InviteBatchDoc = {
  _id: string;
  title?: string;
  status?: string;
  createdAt?: string;
  invites?: InviteRow[];
};

type StudentFieldRow = InviteRowInput & { key: string };

type CreatedCredential = {
  firstName?: string;
  lastName?: string;
  username: string;
  password: string;
};

function extractManualCredentials(res: any): CreatedCredential[] {
  const data = res?.data;
  if (!data) return [];

  if (Array.isArray(data.manualCredentials)) {
    return data.manualCredentials
      .filter((item: any) => item?.username && item?.password)
      .map((item: any) => ({
        firstName: item.firstName,
        lastName: item.lastName,
        username: String(item.username),
        password: String(item.password),
      }));
  }

  return [];
}

function credentialLabel(cred: CreatedCredential) {
  const name = [cred.firstName, cred.lastName].filter(Boolean).join(" ").trim();
  return name || cred.username;
}

function newRowKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyStudentRow(): StudentFieldRow {
  return { key: newRowKey(), firstName: "", lastName: "", email: "" };
}

function formatBatchDate(value?: string) {
  if (!value) return "—";
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

const BATCH_ICON_COLORS = [
  "bg-teal-500",
  "bg-violet-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-emerald-500",
];

function batchInitials(index: number, title?: string) {
  const label = title?.trim() || `Batch ${index + 1}`;
  const words = label.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }
  return `B${index + 1}`;
}

function batchStatusLabel(status?: string) {
  if (!status) return "Draft";
  const normalized = status.replace(/_/g, " ").toLowerCase();
  return normalized.replace(/\b\w/g, (c) => c.toUpperCase());
}

function batchStatusClass(status?: string) {
  const s = (status ?? "").toUpperCase();
  if (s === "COMPLETED" || s === "ACTIVE" || s === "CREATED") {
    return "bg-green-500/15 text-green-500 dark:bg-green-500/10 dark:text-green-400";
  }
  if (s === "IN_PROGRESS" || s === "PROCESSING") {
    return "bg-blue-500/15 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400";
  }
  if (s === "PENDING") {
    return "bg-orange-500/15 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400";
  }
  return "bg-slate-500/15 text-slate-500 dark:bg-slate-500/10 dark:text-slate-400";
}

export function StudentsAndBatchesTab() {
  const { data: wtrRes } = useGetMyWtrSubscriptionQuery();
  const wtrSub = wtrRes?.status && wtrRes?.data ? wtrRes.data : null;
  const subscriptionId = wtrSub?._id ? String(wtrSub._id) : "";

  const [selectedBatch, setSelectedBatch] = useState<InviteBatchDoc | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredential[]>([]);
  const [batchTitle, setBatchTitle] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [studentRows, setStudentRows] = useState<StudentFieldRow[]>(() => [emptyStudentRow()]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [resetTarget, setResetTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: batchesRes, isLoading: batchesLoading, isFetching } = useGetInviteBatchesQuery(
    {
      page,
      limit: 10,
      subscriptionId,
    },
    { skip: !subscriptionId }
  );
  const [createBatch, { isLoading: isCreatingBatch }] = useCreateInviteBatchMutation();
  const [createBatchCsv, { isLoading: isCreatingBatchCsv }] = useCreateInviteBatchCsvMutation();

  const batches = useMemo(() => {
    const raw = batchesRes?.data?.docs ?? batchesRes?.docs;
    return Array.isArray(raw) ? (raw as InviteBatchDoc[]) : [];
  }, [batchesRes]);

  const filteredBatches = useMemo(() => {
    if (statusFilter === "all") return batches;
    return batches.filter(
      (batch) => (batch.status ?? "DRAFT").toUpperCase() === statusFilter.toUpperCase()
    );
  }, [batches, statusFilter]);

  const totalDocs =
    batchesRes?.data?.totalDocs ?? batchesRes?.totalDocs ?? filteredBatches.length;
  const totalPages = batchesRes?.data?.totalPages ?? batchesRes?.totalPages ?? 1;
  const pageStart = totalDocs === 0 ? 0 : (page - 1) * 10 + 1;
  const pageEnd = Math.min(page * 10, totalDocs);

  const resetCreateForm = useCallback(() => {
    setBatchTitle("");
    setCsvFile(null);
    setStudentRows([emptyStudentRow()]);
  }, []);

  useEffect(() => {
    if (!createOpen) resetCreateForm();
  }, [createOpen, resetCreateForm]);

  const updateStudentRow = (key: string, field: keyof InviteRowInput, value: string) => {
    setStudentRows((rows) => rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const addStudentRow = () => {
    setStudentRows((rows) => [...rows, emptyStudentRow()]);
  };

  const duplicateLastRow = () => {
    setStudentRows((rows) => {
      if (rows.length === 0) return [emptyStudentRow()];
      const last = rows[rows.length - 1];
      return [
        ...rows,
        {
          key: newRowKey(),
          firstName: last.firstName,
          lastName: last.lastName,
          email: last.email,
        },
      ];
    });
  };

  const removeStudentRow = (key: string) => {
    setStudentRows((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.key !== key)));
  };

  const handleBatchCreateSuccess = (res: any) => {
    const credentials = extractManualCredentials(res);
    if (credentials.length > 0) {
      setCreatedCredentials(credentials);
      setCredentialsOpen(true);
    }
    toast.success(res?.message ?? "Batch created successfully.");
    setCreateOpen(false);
    setSelectedBatch(null);
  };

  const handleSubmitCreate = async () => {
    if (!subscriptionId) {
      toast.error("You need an active Write to Read subscription to invite students.");
      return;
    }
    const title = batchTitle.trim();
    if (!title) {
      toast.error("Please enter a batch name.");
      return;
    }
    const invites: InviteRowInput[] = studentRows
      .map((r) => ({
        firstName: r.firstName.trim(),
        lastName: r.lastName.trim(),
        ...(r.email.trim() ? { email: r.email.trim().toLowerCase() } : {}),
      }))
      .filter((r) => r.firstName || r.lastName || r.email);

    if (invites.length === 0) {
      toast.error("Add at least one student with first name and last name.");
      return;
    }

    const incomplete = invites.find((r) => !r.firstName || !r.lastName);
    if (incomplete) {
      toast.error("Each student needs a first name and last name.");
      return;
    }

    try {
      const res = await createBatch({
        title,
        subscriptionId,
        invites,
      }).unwrap();
      if (res?.status) {
        handleBatchCreateSuccess(res);
      } else {
        toast.error(res?.message ?? "Could not create batch.");
      }
    } catch (e: any) {
      toast.error(e?.data?.message ?? e?.message ?? "Could not create batch.");
    }
  };

  const handleSubmitCreateCsv = async () => {
    if (!subscriptionId) {
      toast.error("You need an active Write to Read subscription to invite students.");
      return;
    }
    const title = batchTitle.trim();
    if (!title) {
      toast.error("Please enter a batch name.");
      return;
    }
    if (!csvFile) {
      toast.error("Please choose a CSV file.");
      return;
    }
    if (!csvFile.name.toLowerCase().endsWith(".csv")) {
      toast.error("Only .csv files are supported.");
      return;
    }

    try {
      const res = await createBatchCsv({
        title,
        subscriptionId,
        file: csvFile,
      }).unwrap();
      if (res?.status) {
        handleBatchCreateSuccess(res);
      } else {
        toast.error(res?.message ?? "Could not create batch from CSV.");
      }
    } catch (e: any) {
      toast.error(e?.data?.message ?? e?.message ?? "Could not create batch from CSV.");
    }
  };

  const loadingList = batchesLoading || isFetching;

  return (
    <TabsContent value="students" className="space-y-8 mt-0 outline-none">
      {!selectedBatch ? (
        <div className="space-y-6 text-left">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Users className="h-5 w-5 text-lime-500" />
              My Batches
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-[150px] rounded-full border-slate-200 bg-white font-semibold dark:border-slate-700 dark:bg-slate-900">
                  <Filter className="mr-2 h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="h-11 shrink-0 rounded-full border-none bg-lime-600 px-6 font-bold text-white hover:bg-lime-700"
                onClick={() => {
                  if (!subscriptionId) {
                    toast.error("You need an active Write to Read subscription to create a batch.");
                    return;
                  }
                  setCreateOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Batch
              </Button>
            </div>
          </div>

          {loadingList ? (
            <div className="flex justify-center py-16 text-slate-500">
              <Loader2 className="h-10 w-10 animate-spin text-lime-600" />
            </div>
          ) : filteredBatches.length === 0 ? (
            <Card className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No invite batches yet. Create one to add students to Write to Read.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
                      <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Batch Name
                      </th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Created On
                      </th>
                      <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Invites
                      </th>
                      <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Enrolled
                      </th>
                      <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Status
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredBatches.map((batch, index) => {
                      const inviteCount = batch.invites?.length ?? 0;
                      const enrolledCount =
                        batch.invites?.filter((i) => i.rowStatus === "CREATED").length ?? 0;
                      return (
                        <tr
                          key={batch._id}
                          className="bg-white transition-colors hover:bg-slate-50/70 dark:bg-slate-900/30 dark:hover:bg-slate-800/30"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white",
                                  BATCH_ICON_COLORS[index % BATCH_ICON_COLORS.length]
                                )}
                              >
                                {batchInitials(index, batch.title)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                  {batch.title ?? "Untitled batch"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-slate-500">
                            {formatBatchDate(batch.createdAt)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                              {inviteCount}
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-green-500">
                              {enrolledCount}
                              <Users className="h-3.5 w-3.5" />
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              className={cn(
                                "rounded-full border-none px-3 py-1 text-[10px] font-bold uppercase",
                                batchStatusClass(batch.status)
                              )}
                            >
                              {batchStatusLabel(batch.status)}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full border-slate-200 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                                onClick={() => setSelectedBatch(batch)}
                              >
                                View Students
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                onClick={() => setSelectedBatch(batch)}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {pageStart} to {pageEnd} of {totalDocs} batch
                  {totalDocs === 1 ? "" : "es"}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-lime-600 px-3 text-sm font-bold text-white">
                    {page}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 text-left">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Button
                type="button"
                variant="ghost"
                className="mb-1 h-auto gap-2 px-0 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                onClick={() => setSelectedBatch(null)}
              >
                <ChevronLeft className="h-4 w-4" />
                All batches
              </Button>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedBatch.title ?? "Batch"}
              </h3>
              <p className="text-xs text-slate-500">
                Created {formatBatchDate(selectedBatch.createdAt)} · Status:{" "}
                {selectedBatch.status ?? "—"}
              </p>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[2rem] border-none bg-white shadow-sm dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Student
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Email
                    </th>
                    <th className="px-6 py-5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Book written
                    </th>
                    {/* <th className="px-6 py-5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Certificate
                    </th> */}
                    <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Invite status
                    </th>
                    <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {(selectedBatch.invites ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-10 text-center text-sm text-slate-500">
                        No students on this batch yet.
                      </td>
                    </tr>
                  ) : (
                    (selectedBatch.invites ?? []).map((inv, idx) => (
                      <tr
                        key={`${inv.email}-${idx}`}
                        className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                      >
                        <td className="px-8 py-5">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {inv.firstName} {inv.lastName}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-medium text-slate-500">
                            {inv.email || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{inv.booksCount ?? 0}</span>
                        </td>
                        {/* <td className="px-6 py-5 text-center">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">1</span>
                        </td> */}
                        <td className="px-8 py-5 text-right">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] font-bold uppercase",
                              inv.rowStatus === "CREATED" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                              inv.rowStatus === "FAILED" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}
                          >
                            {inv.rowStatus ?? "PENDING"}
                          </Badge>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {inv.createdUser && inv.rowStatus === "CREATED" ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full font-bold"
                              onClick={() =>
                                setResetTarget({
                                  id: String(inv.createdUser),
                                  name: `${inv.firstName} ${inv.lastName}`.trim(),
                                })
                              }
                            >
                              Reset password
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none bg-white p-8 shadow-2xl dark:bg-slate-900 sm:max-w-[640px] md:p-12 custom-scrollbar">
          <DialogHeader className="space-y-4 text-left">
            <DialogTitle className="text-2xl font-extrabold leading-tight text-slate-900 dark:text-white">
              Create batch & invite students
            </DialogTitle>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              At least one student row is required (first name and last name). Email is optional.
            </p>
          </DialogHeader>

          <div className="mt-6 space-y-8">
            <div className="space-y-3 text-left">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Batch name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={batchTitle}
                onChange={(e) => setBatchTitle(e.target.value)}
                placeholder="e.g. Spring 2026 – Grade 7"
                className="h-14 rounded-2xl border-none bg-slate-50 px-6 text-sm font-medium dark:bg-slate-800/50"
              />
            </div>

            <div className="space-y-4 text-left">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Students <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full font-bold"
                    onClick={addStudentRow}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add student
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full font-bold"
                    onClick={duplicateLastRow}
                  >
                    <Copy className="mr-1 h-4 w-4" />
                    Add Multiple Students
                  </Button>
                </div>
              </div>

              <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
                {studentRows.map((row, index) => (
                  <div
                    key={row.key}
                    className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Student {index + 1}
                      </span>
                      {studentRows.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-bold text-red-600 hover:text-red-700"
                          onClick={() => removeStudentRow(row.key)}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          First name
                        </Label>
                        <Input
                          value={row.firstName}
                          onChange={(e) => updateStudentRow(row.key, "firstName", e.target.value)}
                          placeholder="Jane"
                          className="h-11 rounded-xl border-none bg-white px-4 text-sm dark:bg-slate-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Last name
                        </Label>
                        <Input
                          value={row.lastName}
                          onChange={(e) => updateStudentRow(row.key, "lastName", e.target.value)}
                          placeholder="Doe"
                          className="h-11 rounded-xl border-none bg-white px-4 text-sm dark:bg-slate-900"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-3">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Email <span className="font-normal text-slate-400">(optional)</span>
                        </Label>
                        <Input
                          type="email"
                          value={row.email}
                          onChange={(e) => updateStudentRow(row.key, "email", e.target.value)}
                          placeholder="jane.doe@school.edu"
                          className="h-11 rounded-xl border-none bg-white px-4 text-sm dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Or upload CSV
              </Label>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Required headers: <span className="font-mono">firstName,lastName</span>. Optional:{" "}
                <span className="font-mono">email</span>
              </p>
              <Input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                className="h-11 rounded-xl border-none bg-white px-4 text-sm dark:bg-slate-900"
              />
              {csvFile ? (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Selected: <span className="font-semibold">{csvFile.name}</span>
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full font-bold"
                disabled={isCreatingBatch || isCreatingBatchCsv}
                onClick={handleSubmitCreateCsv}
              >
                {isCreatingBatchCsv ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload CSV & send invitations
                  </span>
                )}
              </Button>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-5 dark:border-orange-900/30 dark:bg-orange-950/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 dark:bg-slate-800">
                <Info className="h-5 w-5" />
              </div>
              <p className="pt-1 text-xs font-bold leading-relaxed text-orange-600">
                Students with an email receive invitations automatically. Without an email, the
                system generates a username and password for you to share manually.
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-14 flex-1 rounded-full border-slate-200 font-extrabold dark:border-slate-800"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-14 flex-1 rounded-full border-none bg-lime-500 font-extrabold text-white shadow-lg hover:bg-lime-600"
                disabled={isCreatingBatch || isCreatingBatchCsv}
                onClick={handleSubmitCreate}
              >
                {isCreatingBatch ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending…
                  </span>
                ) : (
                  "Create batch"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={credentialsOpen}
        onOpenChange={(open) => {
          setCredentialsOpen(open);
          if (!open) setCreatedCredentials([]);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[2rem] border-none bg-white p-8 shadow-2xl dark:bg-slate-900 sm:max-w-[520px]">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-green-500/10 p-4">
              <svg className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <DialogHeader className="space-y-2 text-center">
              <DialogTitle className="text-xl font-extrabold">
                {createdCredentials.length > 1
                  ? "Student accounts created"
                  : "Student account created"}
              </DialogTitle>
              <DialogDescription>
                Share these credentials with students who were not invited by email.
              </DialogDescription>
            </DialogHeader>

            <div className="w-full max-h-64 space-y-3 overflow-y-auto text-sm text-muted-foreground">
              {createdCredentials.map((cred, index) => (
                <div
                  key={`${cred.username}-${index}`}
                  className="rounded-lg border border-slate-200 p-3 space-y-2 dark:border-slate-700"
                >
                  {createdCredentials.length > 1 ? (
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {credentialLabel(cred)}
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                    <span>Username</span>
                    <span className="font-mono text-slate-900 dark:text-white">{cred.username}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span>Password</span>
                    <span className="font-mono text-slate-900 dark:text-white">{cred.password}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button
              className="w-full rounded-full"
              onClick={() => {
                const text = createdCredentials
                  .map((cred) => {
                    const label = credentialLabel(cred);
                    return `${label}\nUsername: ${cred.username}\nPassword: ${cred.password}`;
                  })
                  .join("\n\n");
                if (text && navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(text);
                  toast.success("Credentials copied to clipboard");
                }
              }}
            >
              Copy credentials
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ResetStudentPasswordDialog
        open={Boolean(resetTarget)}
        onOpenChange={(open) => {
          if (!open) setResetTarget(null);
        }}
        studentId={resetTarget?.id}
        studentName={resetTarget?.name}
      />
    </TabsContent>
  );
}
