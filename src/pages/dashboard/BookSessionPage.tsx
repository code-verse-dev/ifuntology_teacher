import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "04:00 PM",
];

export default function BookSessionPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slot, setSlot] = useState<string>(timeSlots[0]);

  useEffect(() => {
    document.title = "Book a Session • iFuntology Teacher";
  }, []);

  const dateLabel = useMemo(() => {
    if (!date) return "—";
    return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }, [date]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60 ring-1 ring-border/60">
            <CalendarDays className="text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Book a Session</h1>
        </div>
        <Button variant="glass" size="pill" onClick={() => navigate("/dashboard")}
          className="hidden sm:inline-flex">
          Cancel
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="surface-glass rounded-3xl border border-border/60 p-6 shadow-elev lg:col-span-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title *</Label>
              <Input id="title" required placeholder="e.g., Review Session" className="h-11 rounded-full" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Session Type *</Label>
              <Input id="type" required placeholder="All" className="h-11 rounded-full" />
            </div>

            <div className="space-y-2">
              <Label>Select Date *</Label>
              <div className="rounded-2xl border border-border/60 bg-secondary/25 p-3">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <div className="font-semibold">{date?.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </div>
                </div>
                <Calendar mode="single" selected={date} onSelect={setDate} className="bg-transparent" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold">Available Time Slots</div>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((t) => {
                  const active = t === slot;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSlot(t)}
                      className={
                        "rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                        (active
                          ? "bg-accent-gradient text-accent-foreground border-transparent shadow-elev"
                          : "border-border/60 bg-secondary/20 text-foreground hover:bg-secondary/35")
                      }
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose (Optional)</Label>
              <Textarea id="purpose" placeholder="Describe the purpose of this meeting..." className="min-h-28 rounded-2xl" />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="glass" size="pill" onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                variant="brand"
                size="pill"
                className="w-full sm:w-auto"
                onClick={() => {
                  toast.success("Session booked (demo)");
                  navigate("/session-booked", {
                    state: { date: dateLabel, time: slot, platform: "Google Meet" },
                  });
                }}
              >
                Book a Session
              </Button>
            </div>
          </div>
        </Card>

        <Card className="surface-glass rounded-3xl border border-border/60 p-6 shadow-elev">
          <div className="text-sm font-semibold text-foreground">Booking Information</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" /> Booked dates won't appear on the calendar
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" /> Both you and admin will be notified
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" /> You can cancel bookings up to 24 hours in advance
            </li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
