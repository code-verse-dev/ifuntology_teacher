import { useState, useMemo, useEffect } from "react";
import { Calendar, dateFnsLocalizer, EventProps } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, Monitor, Trash2, Check, Video, ChevronLeft, ChevronRight } from "lucide-react";
import "./calendar-custom.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Event interface matching the calendar's expected structure + custom fields
interface MyEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  platform: "Zoom Meeting" | "Google Meet";
  available: boolean;
  timeRange: string;
  color?: string; // We'll use this for day background
}

export default function BookaSessionDashboard() {
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);

  useEffect(() => {
    document.title = "Book a Session • iFuntology Teacher";
  }, []);

  // Events data
  const events: MyEvent[] = useMemo(
    () => [
      {
        id: 1,
        title: "Zoom Meeting",
        start: new Date(2025, 11, 1), // Dec 1, 2025
        end: new Date(2025, 11, 1),
        platform: "Zoom Meeting",
        available: true,
        timeRange: "10:00-10:30",
        color: "#dcfce7", // Emerald-100 equivalent
      },
      {
        id: 2,
        title: "Google Meet",
        start: new Date(2025, 11, 4), // Dec 4
        end: new Date(2025, 11, 4),
        platform: "Google Meet",
        available: true,
        timeRange: "09:00-09:30",
        color: "#fce7f3", // Pink-100
      },
      {
        id: 3,
        title: "Zoom Meeting",
        start: new Date(2025, 11, 8), // Dec 8
        end: new Date(2025, 11, 8),
        platform: "Zoom Meeting",
        available: true,
        timeRange: "10:00-10:30",
        color: "#fef3c7", // Amber-100
      },
      {
        id: 4,
        title: "Google Meet",
        start: new Date(2025, 11, 14),
        end: new Date(2025, 11, 14),
        platform: "Google Meet",
        available: true,
        timeRange: "09:00-09:30",
        color: "#fce7f3",
      },
      {
        id: 5,
        title: "Google Meet",
        start: new Date(2025, 11, 18),
        end: new Date(2025, 11, 18),
        platform: "Google Meet",
        available: true,
        timeRange: "09:00-09:30",
        color: "#fce7f3",
      },
      {
        id: 6,
        title: "Zoom Meeting",
        start: new Date(2025, 11, 20), // Dec 20
        end: new Date(2025, 11, 20),
        platform: "Zoom Meeting",
        available: true,
        timeRange: "10:00-10:30",
        color: "#fef3c7", // Using Amber for this example based on screenshot looking yellowish
      },
      {
        id: 7,
        title: "Zoom Meeting",
        start: new Date(2025, 11, 23),
        end: new Date(2025, 11, 23),
        platform: "Zoom Meeting",
        available: true,
        timeRange: "10:00-10:30",
        color: "#dcfce7",
      },
      {
        id: 8,
        title: "Zoom Meeting",
        start: new Date(2025, 11, 26),
        end: new Date(2025, 11, 26),
        platform: "Zoom Meeting",
        available: true,
        timeRange: "10:00-10:30",
        color: "#fce7f3",
      },
    ],
    []
  );

  // Custom Day Cell Styling
  const dayPropGetter = (date: Date) => {
    // Check if there is an event on this day
    const eventOnDay = events.find(
      (ev) =>
        ev.start.getDate() === date.getDate() &&
        ev.start.getMonth() === date.getMonth() &&
        ev.start.getFullYear() === date.getFullYear()
    );

    if (eventOnDay && eventOnDay.color) {
      return {
        style: {
          backgroundColor: eventOnDay.color,
          border: '1px solid currentColor', // Optional: adds a subtle border
        },
      };
    }
    return {
      style: {
        backgroundColor: 'hsl(var(--card) / 0.3)', // Default light background for empty cells if needed
      }
    };
  };

  // Custom Event Component
  const EventComponent = ({ event }: EventProps<MyEvent>) => {
    return (
      <div className="flex flex-col gap-1 p-1 text-xs text-foreground">
        <div className="flex items-center gap-1 font-semibold text-black">
          {event.platform === "Zoom Meeting" ? (
            <Video className="h-3 w-3 text-blue-600" />
          ) : (
            // Simple placeholder for Google Meet icon color/shape
            <div className="h-3 w-3 rounded-full bg-green-500" />
            // Or use an icon like Video but styled differently. 
            // Keeping it simple with Lucide 'Video' for now or the same Video icon.
          )}
          <span>{event.title}</span>
        </div>
        <div className="flex items-start gap-1 text-[10px] leading-tight text-gray-700">
          <Check className="h-3 w-3 text-green-600 mt-[1px]" />
          <span>
            Available: {event.platform.split(" ")[0]} with <br />
            Admin ({event.timeRange})
          </span>
        </div>
      </div>
    );
  };

  // Custom Toolbar
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate("PREV");
    };

    const goToNext = () => {
      toolbar.onNavigate("NEXT");
    };

    const label = () => {
      const date = toolbar.date;
      return (
        <span className="text-xl font-bold flex items-center gap-2">
          {format(date, "MMMM, yyyy")}
          <div className="flex items-center text-muted-foreground">
            <ChevronLeft className="h-5 w-5 cursor-pointer hover:text-foreground" onClick={goToBack} />
            <ChevronRight className="h-5 w-5 cursor-pointer hover:text-foreground" onClick={goToNext} />
          </div>
        </span>
      );
    };

    return (
      <div className="rbc-toolbar mb-4 flex-col items-start gap-2 border-b-0 p-0 !flex">
        <span className="mb-0 text-sm font-semibold text-red-500">Select Date *</span>
        <div className="flex items-center justify-between w-full">
          <div className="text-left mb-4">{label()}</div>
        </div>
      </div>
    );
  };

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <h1 className="text-2xl font-extrabold">Book a Session</h1>

        <Card className="rounded-2xl border border-border/60 p-6">

          {/* Top Section matching the screenshot */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 mb-8">
            {/* Left: Session form (Session Title, Type, Select Date) - Spans 4 cols */}
            <div className="md:col-span-4 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Session Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Review Session"
                    className="w-full rounded-full border border-border/40 bg-muted/30 px-4 py-2 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Session Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-full border border-border/40 bg-muted/30 px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option>All</option>
                    <option>Zoom Meeting</option>
                    <option>Google Meet</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Select Date <span className="text-red-500">*</span>
                </label>
                <div className="text-lg font-bold">December, 2025</div>
              </div>
            </div>

            {/* Middle: Available Time Slots - Spans 4 cols */}
            <div className="md:col-span-4 rounded-xl bg-muted/30 p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Available Time Slots</h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Active Slot Example */}
                <button className="flex items-center justify-center gap-2 rounded-full bg-orange-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-orange-700 transition-colors">
                  <Clock className="h-3.5 w-3.5" />
                  9:00 AM
                </button>

                {/* Inactive Slots */}
                {["11:00 AM", "1:00 PM", "02:00 PM", "04:00 PM", "7:00 PM", "09:00 PM", "12:00 PM"].map((t) => (
                  <button key={t} className="flex items-center justify-center gap-2 rounded-full border border-border/50 bg-transparent px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                    <Clock className="h-3.5 w-3.5" />
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Upcoming Sessions - Spans 4 cols */}
            <div className="md:col-span-4 rounded-xl bg-muted/30 p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Upcoming Sessions</h3>
              <div className="rounded-xl bg-background p-4 shadow-sm border border-border/40">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      2024-12-18
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      10:00 AM
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-600 mt-1">
                      <Video className="h-3.5 w-3.5" />
                      Zoom
                    </div>
                  </div>
                  <span className="rounded-full bg-green-500 px-3 py-0.5 text-[10px] font-bold text-white">confirmed</span>
                </div>

                <Button className="w-full rounded-full bg-orange-600 hover:bg-orange-700 text-white font-medium h-9 mb-3">
                  Join Meeting
                </Button>

                <div className="pt-3 border-t border-border/30 text-xs text-muted-foreground">
                  Discuss LMS implementation
                </div>
              </div>
            </div>
          </div>

          {/* The Calendar */}
          <div className="rounded-md border border-border/60 bg-white/50 dark:bg-card/30 p-4 h-[800px]">
            {/* Note: height is important for react-big-calendar */}
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              views={["month"]}
              defaultDate={new Date(2025, 11, 1)} // Setting to Dec 2025 to match screenshot/data
              dayPropGetter={dayPropGetter}
              components={{
                event: EventComponent,
                toolbar: CustomToolbar,
              }}
              onSelectEvent={(event) => setSelectedEvent(event)}
            />
          </div>
        </Card>

        {/* Event Detail Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <div className="mx-auto w-[420px]">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-accent/10 p-3">
                      <CalendarIcon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <DialogTitle>{selectedEvent?.title}</DialogTitle>
                      <DialogDescription>{selectedEvent ? format(selectedEvent.start, "dd MMM yyyy") : ""}</DialogDescription>
                    </div>
                  </div>
                  <div>
                    <Button variant="destructive" size="sm" onClick={() => setSelectedEvent(null)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center justify-between py-2 border-b border-border/60">
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Time</div>
                    <div>{selectedEvent?.timeRange}</div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2"><Monitor className="h-4 w-4" /> Platform</div>
                    <div>{selectedEvent?.platform}</div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setSelectedEvent(null)}>Close</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </section>
    </DashboardWithSidebarLayout>
  );
}
