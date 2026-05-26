import { useEffect, useState, useMemo } from "react";
import { format, addDays } from "date-fns";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  useGetMySessionsQuery,
  useJoinMeetingMutation,
  useStartMeetingMutation,
  useGetInviteableStudentsQuery,
  useSetSessionInvitesMutation,
} from "@/redux/services/apiSlices/sessionSlice";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  Video,
  UserPlus,
} from "lucide-react";

interface Query {
  from?: string;
  to?: string;
  status?: string;
  page?: number;
  limit?: number;
  keyword?: string;
}

function to12Hour(time: string) {
  if (!time) return "—";
  const [h, m] = time.split(":").map(Number);
  const hour = typeof h === "number" && !isNaN(h) ? h % 24 : 0;
  const min = typeof m === "number" && !isNaN(m) ? m : 0;
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${min.toString().padStart(2, "0")} ${ampm}`;
}

function getInvitedStudentIds(session: any): string[] {
  const raw = session?.invitedStudents ?? [];
  if (!Array.isArray(raw)) return [];
  return raw.map((x: any) => String(x?._id ?? x));
}

function studentDisplayName(s: { firstName?: string; lastName?: string; email?: string }) {
  const name = `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim();
  return name || s.email || "Student";
}

const getStatusColor = (status: "pending" | "approved" | "decined") => {
  switch (status) {
    case "pending":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
    case "approved":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";

    case "decined":
      return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400";
  }
};

export default function MyOrdersPage() {
  const [paginationConfig, setPaginationConfig] = useState({
    pageNumber: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 0,
  });
  const [queryOptions, setQueryOptions] = useState<Query>({
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);
  const [joinMeeting] = useJoinMeetingMutation();
  const [startMeeting] = useStartMeetingMutation();
  const [inviteSessionId, setInviteSessionId] = useState<string | null>(null);
  const [selectedInviteStudentIds, setSelectedInviteStudentIds] = useState<string[]>([]);
  const [setSessionInvites, { isLoading: savingInvites }] =
    useSetSessionInvitesMutation();

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const upcomingRangeEnd = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const {
    data: upcomingSessionsData,
    isLoading: upcomingSessionsLoading,
  } = useGetMySessionsQuery({
    from: todayStr,
    to: upcomingRangeEnd,
    status: "approved",
    limit: 10,
    page: 1,
  });

  const upcomingSessions: any[] = upcomingSessionsData?.data?.docs ?? [];

  const {
    data: inviteableRaw,
    isLoading: inviteableLoading,
  } = useGetInviteableStudentsQuery(inviteSessionId ?? "", {
    skip: !inviteSessionId,
  });

  const inviteableStudents: any[] = useMemo(() => {
    const d = inviteableRaw?.data;
    return Array.isArray(d) ? d : [];
  }, [inviteableRaw]);

  const inviteSession = useMemo(
    () => upcomingSessions.find((s: any) => s._id === inviteSessionId) ?? null,
    [upcomingSessions, inviteSessionId]
  );

  useEffect(() => {
    if (!inviteSessionId || !inviteSession) return;
    setSelectedInviteStudentIds(getInvitedStudentIds(inviteSession));
  }, [inviteSessionId, inviteSession]);

  const {
    data: mySessionsData,
    error: mySessionsError,
    isLoading: mySessionsLoading,
  } = useGetMySessionsQuery(queryOptions);

  const handleJoinOrStartMeeting = async (session: any) => {
    const sessionId = session?._id;
    if (!sessionId) return;
    const teacherHosted = Boolean(session.teacherHosted);
    setJoiningSessionId(sessionId);
    try {
      if (teacherHosted) {
        const res: any = await startMeeting(sessionId).unwrap();
        if (res?.status && res?.data?.startUrl) {
          window.open(res.data.startUrl, "_blank");
        } else {
          toast.error(res?.message || "Failed to start meeting");
        }
      } else {
        const res: any = await joinMeeting(sessionId).unwrap();
        if (res?.status) {
          window.open(res?.data?.joinUrl, "_blank");
        } else {
          toast.error(res?.message || "Failed to join meeting");
        }
      }
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        (teacherHosted ? "Failed to start meeting" : "Failed to join meeting");
      toast.error(message);
    } finally {
      setJoiningSessionId(null);
    }
  };

  const toggleInviteStudent = (studentId: string, checked: boolean) => {
    setSelectedInviteStudentIds((prev) =>
      checked ? [...prev.filter((id) => id !== studentId), studentId] : prev.filter((id) => id !== studentId)
    );
  };

  const handleSaveInvites = async () => {
    if (!inviteSessionId) return;
    if (selectedInviteStudentIds.length === 0) {
      toast.error("Select at least one student.");
      return;
    }
    try {
      const res: any = await setSessionInvites({
        sessionId: inviteSessionId,
        studentIds: selectedInviteStudentIds,
      }).unwrap();
      if (res?.status) {
        toast.success(res?.message || "Invites updated");
        setInviteSessionId(null);
      } else {
        toast.error(res?.message || "Failed to update invites");
      }
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to update invites");
    }
  };

  useEffect(() => {
    if (mySessionsData?.data) {
      setPaginationConfig({
        pageNumber: mySessionsData?.data?.page,
        limit: mySessionsData?.data?.limit,
        totalDocs: mySessionsData?.data?.total,
        totalPages: mySessionsData?.data?.totalPages,
      });
    }
  }, [mySessionsData]);

  useEffect(() => {
    document.title = "My Sessions • iFuntology Teacher";
  }, []);

  useEffect(() => {
    setQueryOptions((prev) => ({
      ...prev,
      keyword: search || undefined,
      page: 1, // reset to first page on filter change
    }));
  }, [search]);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full  space-y-6">
        <h1 className="text-2xl font-extrabold">My Sessions</h1>

        {/* Upcoming Sessions */}
        <Card className="rounded-2xl border border-border/60 p-5">
          <h2 className="text-lg font-bold text-foreground mb-4">Upcoming Sessions</h2>
          {upcomingSessionsLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading upcoming sessions…
            </div>
          ) : upcomingSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No upcoming sessions
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((session: any) => {
                const slot = session?.slots?.[0];
                const isJoining = joiningSessionId === session._id;
                const teacherHosted = Boolean(session.teacherHosted);
                const invitedIds = getInvitedStudentIds(session);
                const invitedLabel =
                  invitedIds.length === 0
                    ? "No students invited yet"
                    : `${invitedIds.length} student${invitedIds.length !== 1 ? "s" : ""} invited`;
                return (
                  <div
                    key={session._id}
                    className="rounded-xl bg-muted/30 dark:bg-muted/20 p-4 border border-border/40 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                          {format(new Date(session.date), "yyyy-MM-dd")}
                        </div>
                        {slot && (
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {to12Hour(String(slot.startTime))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                          <Video className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{session.platform}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {teacherHosted ? (
                          <Badge className="border-0 bg-violet-600 text-[9px] hover:bg-violet-600">
                            Your session
                          </Badge>
                        ) : null}
                        <Badge className="shrink-0 bg-green-500 hover:bg-green-600 border-0 text-[10px]">
                          approved
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {session.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mb-3 border-b border-border/40 pb-2">
                      {invitedLabel}
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full border-orange-500/60 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 font-medium h-9"
                        onClick={() => setInviteSessionId(session._id)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite students
                      </Button>
                      <Button
                        className="w-full rounded-full bg-orange-600 hover:bg-orange-700 text-white font-medium h-9"
                        onClick={() => handleJoinOrStartMeeting(session)}
                        disabled={isJoining}
                      >
                        {isJoining ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                            {teacherHosted ? "Starting…" : "Joining…"}
                          </>
                        ) : teacherHosted ? (
                          "Start meeting"
                        ) : (
                          "Join Meeting"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Dialog
          open={!!inviteSessionId}
          onOpenChange={(open) => {
            if (!open) setInviteSessionId(null);
          }}
        >
          <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col gap-0">
            <DialogHeader>
              <DialogTitle>Invite students</DialogTitle>
              <DialogDescription>
                Choose who can see this session in their upcoming list. Selected
                students are notified.
              </DialogDescription>
            </DialogHeader>

            {inviteSession && (
              <p className="text-sm font-medium text-foreground truncate border-b border-border/40 pb-3 -mt-1">
                {inviteSession.title}
              </p>
            )}

            {inviteableLoading ? (
              <div className="flex justify-center py-10 text-muted-foreground gap-2">
                <Loader2 className="h-6 w-6 animate-spin shrink-0" />
                <span className="text-sm">Loading students…</span>
              </div>
            ) : inviteableRaw && inviteableRaw.status === false ? (
              <p className="text-sm text-destructive py-4">
                {inviteableRaw.message || "Could not load students."}
              </p>
            ) : inviteableStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No students are linked to your account for this session.
              </p>
            ) : (
              <>
                {selectedInviteStudentIds.length > 0 ? (
                  <div className="mb-3 rounded-lg bg-muted/40 px-3 py-2 text-xs">
                    <span className="font-semibold text-foreground">
                      Students invited to this session ({selectedInviteStudentIds.length}):{" "}
                    </span>
                    <span className="text-muted-foreground">
                      {selectedInviteStudentIds
                        .map((id) => {
                          const st = inviteableStudents.find(
                            (u: any) => String(u._id) === id
                          );
                          return st ? studentDisplayName(st) : `…${id.slice(-6)}`;
                        })
                        .join(", ")}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mb-2">
                    No students selected yet. Check the boxes below to invite.
                  </p>
                )}

                <div className="overflow-y-auto max-h-[min(50vh,320px)] space-y-2 pr-1 -mr-1">
                  {inviteableStudents.map((stu: any) => {
                    const id = String(stu._id);
                    const checked = selectedInviteStudentIds.includes(id);
                    return (
                      <div
                        key={id}
                        className="flex items-start gap-3 rounded-lg border border-border/60 p-3"
                      >
                        <Checkbox
                          id={`invite-student-${id}`}
                          checked={checked}
                          onCheckedChange={(v) =>
                            toggleInviteStudent(id, v === true)
                          }
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor={`invite-student-${id}`}
                          className="flex-1 cursor-pointer leading-snug font-normal"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {studentDisplayName(stu)}
                          </span>
                          {stu.email ? (
                            <span className="block text-xs text-muted-foreground mt-0.5">
                              {stu.email}
                            </span>
                          ) : null}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <DialogFooter className="mt-4 gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteSessionId(null)}
                disabled={savingInvites}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-orange-600 hover:bg-orange-700"
                onClick={handleSaveInvites}
                disabled={
                  savingInvites ||
                  inviteableLoading ||
                  selectedInviteStudentIds.length === 0
                }
              >
                {savingInvites ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Saving…
                  </>
                ) : (
                  "Save invites"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Search and Filter */}
        <Card className="rounded-2xl border border-border/60 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 w-full md:w-1/2">
              <div className="flex-1">
                <Input
                  placeholder="Search By Title"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                />
              </div>
              <Button
                variant="outline"
                className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
              >
                Filter By
              </Button>
            </div>
          </div>
        </Card>

        {/* Sessions Table */}
        <Card className="rounded-xl border border-border/60 p-4">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Session ID</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Platform</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Slots</th>
                </tr>
              </thead>
              {mySessionsLoading ? (
                <tbody>
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Loading sessions...
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y">
                  {Array.isArray(mySessionsData?.data?.docs) &&
                    mySessionsData.data.docs.map(
                      (session: any, index: number) => (
                        <tr key={session._id || index} className="align-top">
                          <td className="py-3">
                            {(() => {
                              const d = new Date(session.date);
                              if (isNaN(d.getTime())) return session.date;
                              const day = String(d.getDate()).padStart(2, "0");
                              const month = d
                                .toLocaleString("en-GB", { month: "short" })
                                .toLowerCase();
                              const year = d.getFullYear();
                              return `${day} ${month}, ${year}`;
                            })()}
                          </td>
                          <td className="py-3 font-mono">
                            {session.sessionId}
                          </td>
                          <td className="py-3">
                            <span className="inline-flex flex-wrap items-center gap-2">
                              {session.title}
                              {session.teacherHosted ? (
                                <Badge className="border-0 bg-violet-600 text-[10px] hover:bg-violet-600">
                                  Your session
                                </Badge>
                              ) : null}
                            </span>
                          </td>
                          <td className="py-3">{session.platform}</td>
                          <td className="py-3">
                            <Badge
                              className={`${getStatusColor(
                                session.status
                              )} border-0`}
                            >
                              {session.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            {Array.isArray(session.slots)
                              ? session.slots.map((slot: any, i: number) => {
                                  const to12Hour = (time: string) => {
                                    const [h, m] = time.split(":").map(Number);
                                    const hour = h % 12 || 12;
                                    const ampm = h >= 12 ? "PM" : "AM";
                                    return `${hour}:${m
                                      .toString()
                                      .padStart(2, "0")} ${ampm}`;
                                  };
                                  return (
                                    <div key={i} className="text-xs">
                                      {to12Hour(slot.startTime)} -{" "}
                                      {to12Hour(slot.endTime)}
                                    </div>
                                  );
                                })
                              : "-"}
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              )}
            </table>
          </div>
          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {paginationConfig.totalDocs > 0
                ? `Showing ${
                    (paginationConfig.pageNumber - 1) * paginationConfig.limit +
                    1
                  }-${Math.min(
                    paginationConfig.pageNumber * paginationConfig.limit,
                    paginationConfig.totalDocs
                  )} of ${paginationConfig.totalDocs} item(s)`
                : "No items to show"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={paginationConfig.pageNumber === 1}
                onClick={() =>
                  setQueryOptions((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page! - 1),
                  }))
                }
              >
                Previous
              </Button>
              {Array.from({ length: paginationConfig.totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={
                    paginationConfig.pageNumber === i + 1 ? "default" : "ghost"
                  }
                  size="sm"
                  className={
                    paginationConfig.pageNumber === i + 1
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : undefined
                  }
                  onClick={() =>
                    setQueryOptions((prev) => ({ ...prev, page: i + 1 }))
                  }
                >
                  {String(i + 1).padStart(2, "0")}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                disabled={
                  paginationConfig.pageNumber === paginationConfig.totalPages
                }
                onClick={() =>
                  setQueryOptions((prev) => ({
                    ...prev,
                    page: Math.min(paginationConfig.totalPages, prev.page! + 1),
                  }))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
