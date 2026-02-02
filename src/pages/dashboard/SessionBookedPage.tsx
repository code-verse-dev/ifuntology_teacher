import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Calendar, Clock, Video } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type LocationState = {
  date?: string;
  time?: string;
  platform?: string;
};

export default function SessionBookedPage() {
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  useEffect(() => {
    document.title = "Session Booked • iFuntology Teacher";
  }, []);

  const details = useMemo(
    () => ({
      date: state.date ?? "25 Dec 2025",
      time: state.time ?? "11:00 AM",
      platform: state.platform ?? "Google Meet",
    }),
    [state.date, state.time, state.platform],
  );

  return (
    <DashboardLayout>
      <section className="mx-auto flex max-w-3xl items-center justify-center py-10">
        <Card className="w-full surface-glass rounded-3xl border border-border/60 p-8 text-center shadow-elev sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/50 ring-1 ring-border/60">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight">System Alert</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your session has been booked successfully!</p>

          <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-border/60 bg-secondary/20 p-4 sm:grid-cols-3">
            <div className="text-left">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-4 w-4" /> Date
              </div>
              <div className="mt-1 text-sm font-semibold">{details.date}</div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" /> Time
              </div>
              <div className="mt-1 text-sm font-semibold">{details.time}</div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Video className="h-4 w-4" /> Platform
              </div>
              <div className="mt-1 text-sm font-semibold">{details.platform}</div>
            </div>
          </div>

          <div className="mt-7">
            <Button asChild variant="brand" size="pill" className="w-full sm:w-auto">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </Card>
      </section>
    </DashboardLayout>
  );
}
