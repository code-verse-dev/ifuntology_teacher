import { useEffect, useState } from "react";
import { format, addDays } from "date-fns";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useGetMySessionsQuery,
  useJoinMeetingMutation,
} from "@/redux/services/apiSlices/sessionSlice";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, Loader2, Video } from "lucide-react";

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
    data: mySessionsData,
    error: mySessionsError,
    isLoading: mySessionsLoading,
  } = useGetMySessionsQuery(queryOptions);

  const handleJoinMeeting = async (sessionId: string) => {
    setJoiningSessionId(sessionId);
    try {
      const res: any = await joinMeeting(sessionId).unwrap();
      if (res?.status) {
        window.open(res?.data?.joinUrl, "_blank");
      } else {
        toast.error(res?.message || "Failed to join meeting");
      }
    } catch (error: any) {
      const message =
        error?.data?.message || error?.message || "Failed to join meeting";
      toast.error(message);
    } finally {
      setJoiningSessionId(null);
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
                      <Badge className="shrink-0 bg-green-500 hover:bg-green-600 border-0 text-[10px]">
                        approved
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {session.title}
                    </p>
                    <Button
                      className="w-full rounded-full bg-orange-600 hover:bg-orange-700 text-white font-medium h-9"
                      onClick={() => handleJoinMeeting(session._id)}
                      disabled={isJoining}
                    >
                      {isJoining ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                          Joining…
                        </>
                      ) : (
                        "Join Meeting"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

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
                          <td className="py-3">{session.title}</td>
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
