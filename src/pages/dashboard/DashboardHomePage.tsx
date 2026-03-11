import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  Package,
  TrendingUp,
  UserPlus,
  Users,
  Bell,
  BadgeDollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useGetMySessionsQuery,
} from "@/redux/services/apiSlices/sessionSlice";
import { useGetAllNotificationsQuery } from "@/redux/services/apiSlices/notificationSlice";
import socket from "@/config/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetDashboardStatsQuery } from "@/redux/services/apiSlices/subscriptionSlice";

function StatCard({
  icon,
  iconBackground,
  title,
  value,
  subtitle,
  showWarning,
}: {
  icon: ReactNode;
  iconBackground: string;
  title: string;
  value: string;
  subtitle: string;
  showWarning?: boolean;
}) {
  return (
    <Card className="surface-glass rounded-2xl border border-border/60 p-5 shadow-elev">
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-icon-circle text-white"
          style={{ background: iconBackground }}
        >
          {icon}
        </div>
        <TrendingUp className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          {title}
          {showWarning && (
            <AlertCircle className="h-4 w-4 text-amber-500" aria-hidden />
          )}
        </div>
        <div className="mt-2 text-3xl font-extrabold tracking-tight">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
      </div>
    </Card>
  );
}

function UpcomingCard({
  date,
  time,
  platform,
  status,
  title,
}: {
  date: string;
  time: string;
  platform: string;
  status: "confirmed" | "pending";
  title: string;
}) {
  const statusLabel = status === "confirmed" ? "Confirmed" : "Pending";
  const statusClass =
    status === "confirmed"
      ? "bg-secondary/50 text-foreground ring-1 ring-border/60"
      : "bg-secondary/30 text-muted-foreground ring-1 ring-border/60";

  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {date}
            </span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{time}</span>
          </div>
          <div className="text-sm font-semibold">{platform}</div>
        </div>

        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 text-sm text-muted-foreground">{title}</div>
      <div className="mt-4">
        <Button
          variant="brand"
          size="sm"
          className="rounded-full bg-[#ff7a2f] hover:opacity-95"
          onClick={() => toast.message("Join meeting (coming soon)")}
        >
          Join Meeting
        </Button>
      </div>
    </div>
  );
}

function AssignmentCard({
  iconBackground,
  title,
  course,
  submissions,
  due,
}: {
  iconBackground: string;
  title: string;
  course: string;
  submissions: string;
  due: string;
}) {
  const parts = submissions.split("/").map((s) => parseInt(s, 10));
  const pct = parts.length === 2 && parts[1] > 0 ? Math.round((parts[0] / parts[1]) * 100) : 0;

  return (
    <Card className="rounded-2xl border border-border/60 p-5 shadow-elev">
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-icon-circle text-white"
          style={{ background: iconBackground }}
        >
          <FileText className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
          Active
        </span>
      </div>

      <div className="mt-4">
        <div className="text-sm font-bold">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{course}</div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Submissions</span>
        <div className="min-w-0 flex-1 overflow-hidden rounded-full bg-border/30">
          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">{submissions}</span>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">Due: {due}</div>
    </Card>
  );
}

export default function DashboardHomePage() {
  const {
    data: mySessionsData,
    isLoading: mySessionsLoading,
  } = useGetMySessionsQuery({
    from: format(new Date(), "yyyy-MM-dd"),
    to: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    status: "approved",
  });

  const docs = mySessionsData?.data?.docs ?? [];
  const upcomingSessions = docs.slice(0, 2);

  const to12Hour = (time: string) => {
    if (!time) return "—";
    const [h, m] = time.split(":").map(Number);
    const hour = typeof h === "number" && !isNaN(h) ? h % 24 : 0;
    const min = typeof m === "number" && !isNaN(m) ? m : 0;
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${min.toString().padStart(2, "0")} ${ampm}`;
  };

  useEffect(() => {
    document.title = "Dashboard • iFuntology Teacher";
  }, []);

  const navigate = useNavigate();

  const { data: notificationsData, refetch } = useGetAllNotificationsQuery({ limit: 4 });
  const recentNotifs: any[] = notificationsData?.data?.notifications?.docs?.slice(0, 4) ?? [];
  
  useEffect(() => {
    socket.on("notification", (data) => {
      refetch();
    });
    return () => {
      socket.off("notification");
    };
    // eslint-disable-next-line
  }, []);
  const user = useSelector((state: RootState) => state.user.userData);

  const { data: dashboardStatsData, isLoading: dashboardStatsLoading } = useGetDashboardStatsQuery();
  const dashboardStats = dashboardStatsData?.data;
  console.log(dashboardStats, 'dashboardStats');
  return (
    <DashboardWithSidebarLayout>
      <section className="w-full space-y-6">
        {/* Hero header — blue gradient */}
        <div className="bg-dashboard-header relative overflow-hidden rounded-3xl shadow-elev">
          {/* Subtle light circles in background */}
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-12 top-4 h-24 w-24 rounded-full bg-white/8"
            aria-hidden
          />
          <div className="relative p-6 sm:p-8">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                Welcome back, {user?.firstName}! 
              </h1>
              <p className="mt-2 text-sm text-white/80 sm:text-base">
                Here’s what’s happening with your classes today.
              </p>

              <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Button
                  size="pill"
                  className="w-full rounded-full border-0 bg-white text-[#10355c] hover:bg-white/95 sm:w-auto"
                  onClick={() => navigate("/book-a-session")}
                >
                  <Calendar className="mr-2 h-4 w-4 text-[#10355c]" />
                  Book a Session
                </Button>
                <Button
                  size="pill"
                  className="w-full rounded-full border-0 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 sm:w-auto"
                  onClick={() => navigate("/quotes/request")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Request a Quote
                </Button>
                <Button
                  size="pill"
                  className="w-full rounded-full border-0 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 sm:w-auto"
                  onClick={() => navigate("/invite-student")}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Students
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats — square icon boxes with gradient and shadow */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            iconBackground="linear-gradient(135deg, #22c55e, #16a34a)"
            title="Total Students"
            value={dashboardStats?.totalStudents ?? 0}
            subtitle="Across all batches"
          />
          <StatCard
            icon={<GraduationCap className="h-5 w-5" />}
            iconBackground="linear-gradient(135deg, #22c55e, #16a34a)"
            title="Active Subscriptions"
            value={dashboardStats?.activeSubscriptions ?? 0}
            subtitle="LMS & Write to Read"
          />
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            iconBackground="linear-gradient(135deg, #fb923c, #ea580c)"
            title="Pending POs"
            value={dashboardStats?.pendingPOs ?? 0}
            subtitle="Awaiting approval"
            showWarning
          />
           <StatCard
            icon={<BadgeDollarSign className="h-5 w-5" />}
            iconBackground="linear-gradient(135deg, #3b82f6, #1d4ed8)"
            title="Affiliate Earnings"
            value={`$${dashboardStats?.affiliateEarnings?.toFixed(2) ?? "0"}`}
            subtitle="+$150 this Month"
          />
        </div>

        {/* Activity + upcoming */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="surface-glass rounded-3xl border border-border/60 p-0 shadow-elev lg:col-span-2">
            <div className="flex items-center justify-between gap-3 px-6 pt-6">
              <h2 className="text-lg font-extrabold tracking-tight">Recent Activity</h2>
              <Button
                variant="link"
                className="h-auto p-0 text-orange-500 hover:text-orange-600"
                onClick={() => toast.message("View all (coming soon)")}
              >
                View All &gt;
              </Button>
            </div>
            <div className="mt-4 divide-y divide-border/50">
              {recentNotifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-10 text-muted-foreground gap-2">
                  <Bell className="h-8 w-8 opacity-20" />
                  <p className="text-sm">No recent activity.</p>
                </div>
              ) : recentNotifs.map((n) => (
                <div key={n._id} className="flex items-start gap-4 px-6 py-4 group hover:bg-muted/30 transition-colors">
                  <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${n.isRead ? "bg-slate-100 dark:bg-slate-800 text-slate-400" : "bg-orange-100 dark:bg-orange-950/30 text-orange-500"}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.content}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="surface-glass rounded-3xl border border-border/60 p-6 shadow-elev">
            <h2 className="text-lg font-extrabold tracking-tight">Upcoming Sessions</h2>
            <div className="mt-4 space-y-3">
              {mySessionsLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading upcoming sessions...
                </div>
              ) : upcomingSessions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No upcoming sessions
                </div>
              ) : (
                upcomingSessions.map((session: any) => {
                  const sessionDate = session?.date
                    ? format(new Date(session.date), "yyyy-MM-dd")
                    : "—";
                  const timeStr =
                    session?.slots?.[0]?.startTime != null
                      ? to12Hour(
                        String(session.slots[0].startTime).slice(0, 5)
                      )
                      : "—";
                  const platform = session?.platform ?? "—";
                  const status =
                    (session?.status ?? "approved").toLowerCase() === "approved"
                      ? "confirmed"
                      : "pending";
                  const title = session?.title ?? session?.subject ?? "Session";
                  return (
                    <UpcomingCard
                      key={session._id}
                      date={sessionDate}
                      time={timeStr}
                      platform={platform}
                      status={status}
                      title={title}
                    />
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Active Assignments */}
        <div>
          <h2 className="mb-4 text-lg font-extrabold tracking-tight">Active Assignments</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <AssignmentCard
              iconBackground="linear-gradient(135deg, #fb923c, #ea580c)"
              title="Chapter 5 Quiz"
              course="Funtology"
              submissions="38/45"
              due="2024-12-20"
            />
            <AssignmentCard
              iconBackground="linear-gradient(135deg, #60a5fa, #3b82f6)"
              title="Final Project"
              course="Creative Writing"
              submissions="38/45"
              due="2024-12-20"
            />
            <AssignmentCard
              iconBackground="linear-gradient(135deg, #2563eb, #1d4ed8)"
              title="Practice Assignment"
              course="Barberology"
              submissions="38/45"
              due="2024-12-20"
            />
          </div>
        </div>
      </section>
    </DashboardWithSidebarLayout>
  );
}
