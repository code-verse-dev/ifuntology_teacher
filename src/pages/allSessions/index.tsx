import { useEffect, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useGetMySessionsQuery } from "@/redux/services/apiSlices/sessionSlice";

interface Query {
  from?: string;
  to?: string;
  status?: string;
  page?: number;
  limit?: number;
  keyword?: string;
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
  const navigate = useNavigate();
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

  const {
    data: mySessionsData,
    error: mySessionsError,
    isLoading: mySessionsLoading,
  } = useGetMySessionsQuery(queryOptions);

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
