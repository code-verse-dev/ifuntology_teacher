import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronRight, ClipboardList, Users } from "lucide-react";
import { toast } from "sonner";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card className="surface-glass rounded-2xl border border-border/60 p-5 shadow-elev">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-muted-foreground">{title}</div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight">{value}</div>
          <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 ring-1 ring-border/60">
          {icon}
        </div>
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

function AssignmentCard({ title, course, submissions, due }: { title: string; course: string; submissions: string; due: string }) {
  // parse submissions like "38/45" to a percent for the progress bar
  const parts = submissions.split("/").map((s) => parseInt(s, 10));
  const pct = parts.length === 2 && parts[1] > 0 ? Math.round((parts[0] / parts[1]) * 100) : 0;

  return (
    <Card className="rounded-2xl border border-border/60 p-4 shadow-elev">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{course}</div>
        </div>
        <div className="text-xs text-muted-foreground">{submissions}</div>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-border/30">
        <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
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
      <section className="mx-auto w-full max-w-7xl space-y-6">
        {/* Hero header */}
        <div
          className="surface-glass overflow-hidden rounded-3xl border border-border/60 shadow-elev"
          style={{
            background:
              "linear-gradient(100deg, hsl(var(--primary) / 0.38), hsl(var(--primary) / 0.18)), radial-gradient(520px 320px at 88% 40%, hsl(var(--primary) / 0.28), transparent 60%)",
          }}
        >
          <div className="relative p-6 sm:p-8">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
                Welcome back, Tom! <span className="align-middle">👋</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Here’s what’s happening with your classes today.
              </p>

              <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Button
                  variant="glass"
                  size="pill"
                  className="w-full rounded-full sm:w-auto"
                  onClick={() => navigate("/book-a-session")}
                >
                  Book a Session
                </Button>
                <Button
                  variant="glass"
                  size="pill"
                  className="w-full rounded-full sm:w-auto"
                  onClick={() => toast.message("Request a Quotation (coming soon)")}
                >
                  Request a Quotation
                </Button>
                <Button
                  variant="glass"
                  size="pill"
                  className="w-full rounded-full sm:w-auto"
                  onClick={() => navigate("/invite-student")}
                >
                  Invite Students
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Users className="h-5 w-5 text-primary" />} title="Total Students" value="2" subtitle="Across all batches" />
          <StatCard
            icon={<ClipboardList className="h-5 w-5 text-primary" />}
            title="Active Subscriptions"
            value="2"
            subtitle="LMS & Write to Read"
          />
          <StatCard icon={<ChevronRight className="h-5 w-5 text-primary" />} title="Pending POs" value="4" subtitle="Awaiting approval" />
          <StatCard icon={<Calendar className="h-5 w-5 text-primary" />} title="Books to Grade" value="1" subtitle="Pending review" />
        </div>

        {/* Activity + upcoming */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="surface-glass rounded-3xl border border-border/60 p-0 shadow-elev lg:col-span-2">
            <div className="flex items-center justify-between gap-3 px-6 pt-6">
              <h2 className="text-lg font-extrabold tracking-tight">Recent Activity</h2>
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={() => toast.message("View all (coming soon)")}
              >
                View All
              </Button>
            </div>
            <div className="px-3 pb-4 pt-3 sm:px-6">
              <div className="space-y-2">
                {["Quote request submitted for Funtology Kits", "Training session scheduled for Dec 20", "Emma Johnson completed Module 5", "Order #ORD-2024-042 has been shipped"].map(
                  (item, idx) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toast.message("Open activity (coming soon)")}
                      className="group w-full rounded-2xl border border-border/60 bg-card/30 px-4 py-3 text-left transition hover:bg-card/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">{item}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {idx === 0 ? "2 hours ago" : idx === 1 ? "5 hours ago" : idx === 2 ? "1 day ago" : "2 days ago"}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  ),
                )}
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
          <h2 className="mb-3 text-lg font-extrabold">Active Assignments</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <AssignmentCard title="Chapter 5 Quiz" course="Funtology" submissions="38/45" due="2024-12-20" />
            <AssignmentCard title="Final Project" course="Creative Writing" submissions="38/45" due="2024-12-20" />
            <AssignmentCard title="Practice Assignment" course="Barberology" submissions="38/45" due="2024-12-20" />
          </div>
        </div>
      </section>
    </DashboardWithSidebarLayout>
  );
}
