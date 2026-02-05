import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  EventProps,
  DayPropGetter,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSSProperties } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Clock,
  Monitor,
  Trash2,
  Check,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./calendar-custom.css";
import { useFindScheduleQuery } from "@/redux/services/apiSlices/availabilitySlice";
import { useCreateSessionMutation } from "@/redux/services/apiSlices/sessionSlice";
import { toast } from "sonner";
import swal from "sweetalert";

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
  const [createSession, { isLoading: bookingLoading, error, isSuccess }] =
    useCreateSessionMutation();
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [purpose, setPurpose] = useState("");

  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  const { data, isLoading, isError, refetch } = useFindScheduleQuery(
    selectedDate,
    {
      skip: !selectedDate,
    }
  );
  const slots = data?.data || [];

  useEffect(() => {
    document.title = "Book a Session • iFuntology Teacher";
  }, []);

  const events: any[] = useMemo(
    () =>
      [
        {
          id: 1,
          title: "Zoom Meeting",
          start: "2026-02-10", // YYYY-MM-DD
          end: "2026-02-10",
          platform: "Zoom Meeting",
          available: true,
          timeRange: "10:00-10:30",
          color: "#dcfce7",
        },
        {
          id: 2,
          title: "Google Meet",
          start: "2026-02-20",
          end: "2026-02-20",
          platform: "Google Meet",
          available: true,
          timeRange: "09:00-09:30",
          color: "#fce7f3",
        },
      ].map((ev) => ({
        ...ev,
        start: new Date(ev.start + "T00:00:00"), // normalize to midnight
        end: new Date(ev.end + "T00:00:00"),
      })),
    []
  );
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(format(start, "yyyy-MM-dd"));
  };

  const dayPropGetter: DayPropGetter = (date: Date) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const isPast = date < todayStart;
    const isSelected = format(date, "yyyy-MM-dd") === selectedDate;

    const eventOnDay = events.find((ev) => {
      const evDate = new Date(ev.start);
      evDate.setHours(0, 0, 0, 0); // normalize
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return evDate.getTime() === d.getTime();
    });

    let style: CSSProperties = {};

    if (isPast) {
      style = {
        backgroundColor: "#f3f4f6",
        color: "#9ca3af",
        pointerEvents: "none",
        opacity: 0.6,
      };
    } else if (isSelected) {
      style = {
        backgroundColor: "#7ec844",
        color: "#ffffff",
        borderRadius: "8px",
        fontWeight: 600,
      };
    } else if (eventOnDay?.color) {
      style = {
        backgroundColor: eventOnDay.color,
        border: "1px solid currentColor",
      };
    } else {
      style = {
        backgroundColor: "hsl(var(--card) / 0.3)",
      };
    }

    return { style };
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
            <ChevronLeft
              className="h-5 w-5 cursor-pointer hover:text-foreground"
              onClick={goToBack}
            />
            <ChevronRight
              className="h-5 w-5 cursor-pointer hover:text-foreground"
              onClick={goToNext}
            />
          </div>
        </span>
      );
    };

    return (
      <div className="rbc-toolbar mb-4 flex-col items-start gap-2 border-b-0 p-0 !flex">
        <span className="mb-0 text-sm font-semibold text-red-500">
          Select Date *
        </span>
        <div className="flex items-center justify-between w-full">
          <div className="text-left mb-4">{label()}</div>
        </div>
      </div>
    );
  };

  const formatTimeRange = (start: string, end: string) => {
    const to12Hour = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      const hour = h % 12 || 12;
      const ampm = h >= 12 ? "PM" : "AM";
      return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
    };

    return `${to12Hour(start)} - ${to12Hour(end)}`;
  };

  const to24HourWithSeconds = (time: string) =>
    time.length === 5 ? `${time}:00` : time;

  const handleBookSession = async () => {
    if (!title || !platform || !subject || !selectedSlot) {
      toast.error("Please fill in all required fields and select a time slot");
      return;
    }

    const payload: any = {
      title,
      subject,
      platform,
      date: selectedDate,
      slots: [
        {
          startTime: to24HourWithSeconds(selectedSlot.startTime),
          endTime: to24HourWithSeconds(selectedSlot.endTime),
        },
      ],
    };
    if (purpose.trim()) {
      payload.purpose = purpose.trim();
    }

    try {
      const res: any = await createSession(payload).unwrap();
      if (res?.status) {
        swal("Success", res?.message, "success");
        setTitle("");
        setPlatform("");
        setSubject("");
        setPurpose("");
        setSelectedSlot(null);
      } else {
        swal("Error", res?.message || "Failed to book session", "error");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      const message = err?.data?.message || "Failed to book session";
      swal("Error", message, "error");
    }
  };

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full  space-y-6">
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
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Session Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full appearance-none rounded-full border border-border/40 bg-muted/30 px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select Platform</option>
                    <option>Zoom Meeting</option>
                    <option>Google Meet</option>
                  </select>

                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Subject <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full appearance-none rounded-full border border-border/40 bg-muted/30 px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select Subject</option>
                    <option value="Funtology">Funtology</option>
                    <option value="Barbertology">Barbertology</option>
                    <option value="Skintology Fundamentals">
                      Skintology Fundamentals
                    </option>
                    <option value="Nailtology Fundamentals">
                      Nailtology Fundamentals
                    </option>
                  </select>

                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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

            <div className="md:col-span-4 rounded-xl bg-muted/30 p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">
                Available Time Slots
              </h3>

              {isLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading slots...
                </div>
              ) : slots.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No slots available for this date
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {/* {slots.map((slot: any, index: number) => (
                    <button
                      key={index}
                      className="flex items-center justify-center gap-2 rounded-full border border-border/50 bg-transparent px-3 py-2 text-xs font-medium hover:bg-orange-600 hover:text-white transition-colors"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {formatTimeRange(slot.startTime, slot.endTime)}
                    </button>
                  ))} */}
                  {slots.map((slot: any, i: number) => {
                    const active =
                      selectedSlot?.startTime === slot.startTime &&
                      selectedSlot?.endTime === slot.endTime;

                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-full px-3 py-2 text-xs flex gap-2 items-center justify-center
                          ${
                            active
                              ? "bg-orange-600 text-white"
                              : "border hover:bg-orange-600 hover:text-white"
                          }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        {formatTimeRange(slot.startTime, slot.endTime)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Upcoming Sessions - Spans 4 cols */}
            <div className="md:col-span-4 rounded-xl bg-muted/30 p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">
                Upcoming Sessions
              </h3>
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
                  <span className="rounded-full bg-green-500 px-3 py-0.5 text-[10px] font-bold text-white">
                    confirmed
                  </span>
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
            {/* <Calendar
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
            /> */}
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={["month"]}
              selectable
              onSelectSlot={handleSelectSlot}
              style={{ height: "100%" }}
              defaultDate={new Date()}
              dayPropGetter={dayPropGetter}
              components={{
                event: EventComponent,
                toolbar: CustomToolbar,
              }}
              onSelectEvent={(event) => setSelectedEvent(event)}
            />
          </div>
          {/* Bottom Section: Purpose + Actions */}
          <div className="mt-8 rounded-xl border border-border/60 bg-background p-6 space-y-6">
            {/* Purpose */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">
                Purpose{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </label>

              <textarea
                placeholder="Describe the purpose of this meeting..."
                rows={4}
                className="w-full resize-none rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setTitle("");
                  setPlatform("");
                  setSubject("");
                  setSelectedSlot(null);
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={handleBookSession}
                disabled={bookingLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {bookingLoading ? "Booking..." : "Book a Session"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Event Detail Dialog */}
        <Dialog
          open={!!selectedEvent}
          onOpenChange={() => setSelectedEvent(null)}
        >
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
                      <DialogDescription>
                        {selectedEvent
                          ? format(selectedEvent.start, "dd MMM yyyy")
                          : ""}
                      </DialogDescription>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setSelectedEvent(null)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center justify-between py-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Time
                    </div>
                    <div>{selectedEvent?.timeRange}</div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" /> Platform
                    </div>
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
