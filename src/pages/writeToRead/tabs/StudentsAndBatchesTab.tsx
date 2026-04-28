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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Plus, Loader2, ChevronLeft, Info, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCreateInviteBatchMutation,
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
};

export type InviteBatchDoc = {
  _id: string;
  title?: string;
  status?: string;
  createdAt?: string;
  invites?: InviteRow[];
};

type StudentFieldRow = InviteRowInput & { key: string };

function newRowKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyStudentRow(): StudentFieldRow {
  return { key: newRowKey(), firstName: "", lastName: "", email: "" };
}

function formatBatchDate(value?: string) {
  if (!value) return "—";
  try {
    return format(parseISO(value), "M/d/yyyy");
  } catch {
    return value;
  }
}

export function StudentsAndBatchesTab() {
  const { data: wtrRes } = useGetMyWtrSubscriptionQuery();
  const wtrSub = wtrRes?.status && wtrRes?.data ? wtrRes.data : null;
  const subscriptionId = wtrSub?._id ? String(wtrSub._id) : "";

  const { data: batchesRes, isLoading: batchesLoading, isFetching } = useGetInviteBatchesQuery(
    {
      page: 1,
      limit: 10,
      subscriptionId,
    },
    { skip: !subscriptionId }
  );

  const [createBatch, { isLoading: isCreatingBatch }] = useCreateInviteBatchMutation();

  const [selectedBatch, setSelectedBatch] = useState<InviteBatchDoc | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [batchTitle, setBatchTitle] = useState("");
  const [studentRows, setStudentRows] = useState<StudentFieldRow[]>(() => [emptyStudentRow()]);

  const batches = useMemo(() => {
    const raw = batchesRes?.data?.docs ?? batchesRes?.docs;
    return Array.isArray(raw) ? (raw as InviteBatchDoc[]) : [];
  }, [batchesRes]);

  const resetCreateForm = useCallback(() => {
    setBatchTitle("");
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
        email: r.email.trim().toLowerCase(),
      }))
      .filter((r) => r.firstName || r.lastName || r.email);

    if (invites.length === 0) {
      toast.error("Add at least one student with first name, last name, and email.");
      return;
    }

    const incomplete = invites.find((r) => !r.firstName || !r.lastName || !r.email);
    if (incomplete) {
      toast.error("Each student needs first name, last name, and a valid email.");
      return;
    }

    try {
      const res = await createBatch({
        title,
        subscriptionId,
        invites,
      }).unwrap();
      if (res?.status) {
        toast.success(res?.message ?? "Invitations sent.");
        setCreateOpen(false);
        setSelectedBatch(null);
      } else {
        toast.error(res?.message ?? "Could not create batch.");
      }
    } catch (e: any) {
      toast.error(e?.data?.message ?? e?.message ?? "Could not create batch.");
    }
  };

  const loadingList = batchesLoading || isFetching;

  return (
    <TabsContent value="students" className="space-y-8 mt-0 outline-none">
      {!selectedBatch ? (
        <div className="space-y-6 text-left">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-lime-600" />
              My Batches
            </h3>
            <Button
              className="rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold h-11 px-6 border-none shrink-0"
              onClick={() => {
                if (!subscriptionId) {
                  toast.error("You need an active Write to Read subscription to create a batch.");
                  return;
                }
                setCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Batch
            </Button>
          </div>

          {loadingList ? (
            <div className="flex justify-center py-16 text-slate-500">
              <Loader2 className="h-10 w-10 animate-spin text-lime-600" />
            </div>
          ) : batches.length === 0 ? (
            <Card className="rounded-[2rem] border border-slate-100 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No invite batches yet. Create one to add students to Write to Read.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {batches.map((batch) => {
                const inviteCount = batch.invites?.length ?? 0;
                const createdCount =
                  batch.invites?.filter((i) => i.rowStatus === "CREATED").length ?? 0;
                return (
                  <button
                    key={batch._id}
                    type="button"
                    onClick={() => setSelectedBatch(batch)}
                    className="rounded-[2rem] bg-gradient-to-br from-[#0f4c64] to-[#1c5d76] p-7 text-left text-white shadow-lg transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-lg font-bold leading-tight">{batch.title ?? "Untitled batch"}</h4>
                      <Badge className="shrink-0 border-none bg-green-500/20 px-3 text-[10px] font-bold text-green-400">
                        {batch.status ?? "—"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs font-medium lowercase text-white/60">
                      Created {formatBatchDate(batch.createdAt)}
                    </p>
                    <div className="mt-4 space-y-2 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Invites</span>
                        <span className="font-bold">{inviteCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Enrolled</span>
                        <span className="font-bold text-green-400">{createdCount}</span>
                      </div>
                    </div>
                    <p className="mt-4 text-xs font-semibold text-lime-200">View students →</p>
                  </button>
                );
              })}
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {(selectedBatch.invites ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-sm text-slate-500">
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
                          <span className="text-sm font-medium text-slate-500">{inv.email}</span>
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
              At least one complete student row is required (first name, last name, email).
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
                    Duplicate last row
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
                          Email
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

            <div className="flex items-start gap-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-5 dark:border-orange-900/30 dark:bg-orange-950/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 dark:bg-slate-800">
                <Info className="h-5 w-5" />
              </div>
              <p className="pt-1 text-xs font-bold leading-relaxed text-orange-600">
                Students receive email invitations. New accounts get temporary login details from the
                server.
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
                disabled={isCreatingBatch}
                onClick={handleSubmitCreate}
              >
                {isCreatingBatch ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending…
                  </span>
                ) : (
                  "Send invitations"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
}
