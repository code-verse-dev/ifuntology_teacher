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
} from "lucide-react";
import { toast } from "sonner";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  useEffect(() => {
    document.title = "Dashboard • iFuntology Teacher";
  }, []);

  const navigate = useNavigate();

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
                Welcome back, Tom! <span className="align-middle">👋</span>
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
                  onClick={() => toast.message("Request a Quotation (coming soon)")}
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
            value="2"
            subtitle="Across all batches"
          />
          <StatCard
            icon={<GraduationCap className="h-5 w-5" />}
            iconBackground="linear-gradient(135deg, #22c55e, #16a34a)"
            title="Active Subscriptions"
            value="2"
            subtitle="LMS & Write to Read"
          />
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            iconBackground="linear-gradient(135deg, #fb923c, #ea580c)"
            title="Pending POs"
            value="4"
            subtitle="Awaiting approval"
            showWarning
          />
          <StatCard
            icon={<BookOpen className="h-5 w-5" />}
            iconBackground="linear-gradient(135deg, #3b82f6, #1d4ed8)"
            title="Books to Grade"
            value="1"
            subtitle="Pending review"
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
            <div className="px-3 pb-4 pt-3 sm:px-6">
              <div className="divide-y divide-border/60">
                {[
                  {
                    icon: FileText,
                    iconBackground: "#3b82f6",
                    text: "Quote request submitted for Funtology Kits",
                    time: "2 hours ago",
                  },
                  {
                    icon: Calendar,
                    iconBackground: "#22c55e",
                    text: "Training session scheduled for Dec 20",
                    time: "5 hours ago",
                  },
                  {
                    icon: CheckCircle2,
                    iconBackground: "#a855f7",
                    text: "Emma Johnson completed Module 5",
                    time: "1 day ago",
                  },
                  {
                    icon: Package,
                    iconBackground: "#fb923c",
                    text: "Order #ORD-2024-042 has been shipped",
                    time: "2 days ago",
                  },
                  {
                    icon: Award,
                    iconBackground: "#d97706",
                    text: "3 students earned new certificates",
                    time: "3 days ago",
                  },
                ].map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <button
                      key={activity.text}
                      type="button"
                      onClick={() => toast.message("Open activity (coming soon)")}
                      className="group flex w-full items-center gap-4 py-6 text-left transition hover:bg-card/30 first:pt-3 last:pb-3"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60"
                        style={{ color: activity.iconBackground }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold">{activity.text}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{activity.time}</div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="surface-glass rounded-3xl border border-border/60 p-6 shadow-elev">
            <h2 className="text-lg font-extrabold tracking-tight">Upcoming Sessions</h2>
            <div className="mt-4 space-y-3">
              <UpcomingCard
                date="2024-12-18"
                time="10:00 AM"
                platform="Zoom"
                status="confirmed"
                title="Discuss LMS implementation"
              />
              <UpcomingCard
                date="2024-12-19"
                time="2:00 PM"
                platform="Google Meet"
                status="pending"
                title="Write to Read onboarding"
              />
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
