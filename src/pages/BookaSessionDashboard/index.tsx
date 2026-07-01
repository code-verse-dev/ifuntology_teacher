import { useState, useEffect } from "react";
import { format } from "date-fns";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Video,
  Loader2,
  BookOpen,
  Pencil,
  MessageCircle,
  ShieldCheck,
  Send,
} from "lucide-react";
import { useFindScheduleQuery } from "@/redux/services/apiSlices/availabilitySlice";
import {
  useCreateSessionMutation,
  useGetTeacherUpcomingSessionsQuery,
  useJoinMeetingMutation,
  useStartMeetingMutation,
} from "@/redux/services/apiSlices/sessionSlice";
import { toast } from "sonner";
import swal from "sweetalert";
import { useNavigate } from "react-router-dom";

/*
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
*/

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
  teacherHosted?: boolean;
}

export default function BookaSessionDashboard() {
  const [createSession, { isLoading: bookingLoading, error, isSuccess }] =
    useCreateSessionMutation();
  const [joinMeeting, { isLoading: joinMeetingLoading }] = useJoinMeetingMutation();
  const [startMeeting, { isLoading: startMeetingLoading }] = useStartMeetingMutation();
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  /*
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const lastDayStr = format(lastDayOfMonth, "yyyy-MM-dd");
  */

  const [purpose, setPurpose] = useState("");
  const navigate = useNavigate();

  /*
  const EVENT_COLORS = ["#fce7f3", "#fef3c7", "#dcfce7"];

  const getRandomColor = () =>
    EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)];
  */

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

  /*
  const { data: mySessionsData } = useGetMySessionsQuery({
    from: todayStr,
    to: lastDayStr,
    status: "approved",
  });
  */

  const {
    data: upcomingSessionsData,
    isLoading: upcomingSessionsLoading,
  } = useGetTeacherUpcomingSessionsQuery({
    from: todayStr,
    limit: 10,
  });

  const upcomingSession =
    upcomingSessionsData?.data?.docs &&
    upcomingSessionsData.data.docs.length > 0
      ? upcomingSessionsData.data.docs[0]
      : null;

  const handleMeetingAction = async () => {
    if (!upcomingSession?._id) return;
    const teacherHosted = Boolean(upcomingSession.teacherHosted);
    try {
      if (teacherHosted) {
        const res: any = await startMeeting(upcomingSession._id).unwrap();
        if (res?.status && res?.data?.startUrl) {
          window.open(res.data.startUrl, "_blank");
        } else {
          toast.error(res?.message || "Failed to start meeting");
        }
      } else {
        const res: any = await joinMeeting(upcomingSession._id).unwrap();
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
    }
  };

  useEffect(() => {
    document.title = "Book With Admin • iFuntology Teacher";
  }, []);

  const to12Hour = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const hour = h % 12 || 12;
    const ampm = h >= 12 ? "PM" : "AM";
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  /*
  const events: MyEvent[] = useMemo(() => {
    if (!mySessionsData?.data?.docs) return [];

    return mySessionsData.data.docs.map((session: any) => {
      const sessionDate = new Date(session.date);

      return {
        id: session._id,
        title: session.platform,
        start: new Date(format(sessionDate, "yyyy-MM-dd") + "T00:00:00"),
        end: new Date(format(sessionDate, "yyyy-MM-dd") + "T00:00:00"),
        platform: session.platform,
        available: false,
        color: getRandomColor(),
        teacherHosted: Boolean(session.teacherHosted),
        timeRange: session.slots
          .map((slot: any) => {
            const start = to12Hour(slot.startTime);
            const end = to12Hour(slot.endTime);
            return `${start} - ${end}`;
          })
          .join(", "),
      };
    });
  }, [mySessionsData]);

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
      evDate.setHours(0, 0, 0, 0);
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

  const EventComponent = ({ event }: EventProps<MyEvent>) => {
    return (
      <div className="flex flex-col gap-1 p-1 text-xs text-foreground">
        <div className="flex items-center gap-1 font-semibold text-black">
          {event.platform === "Zoom Meeting" ? (
            <Video className="h-3 w-3 text-blue-600" />
          ) : (
            <div className="h-3 w-3 rounded-full bg-green-500" />
          )}
          <span>{event.title}</span>
        </div>
        <div className="flex items-start gap-1 text-[10px] leading-tight text-gray-700">
          <Check className="h-3 w-3 text-green-600 mt-[1px]" />
          <span>
            {event.teacherHosted ? (
              <>Your session ({event.timeRange})</>
            ) : (
              <>
                Confirmed: {event.platform.split(" ")[0]} with <br />
                Admin ({event.timeRange})
              </>
            )}
          </span>
        </div>
      </div>
    );
  };

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
  */

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

    const todayStrForCompare = format(new Date(), "yyyy-MM-dd");
    if (selectedDate === todayStrForCompare) {
      const startNormalized = to24HourWithSeconds(selectedSlot.startTime);
      const timePart =
        startNormalized.length === 5 ? `${startNormalized}:00` : startNormalized;
      const slotStart = new Date(`${selectedDate}T${timePart}`);
      if (Number.isNaN(slotStart.getTime()) || slotStart.getTime() <= Date.now()) {
        toast.error("This slot has passed. Please select a future time.");
        return;
      }
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

  const fieldClass =
    "w-full rounded-xl border border-border/50 bg-muted/20 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-lime-500/25";

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-7xl space-y-8">
        {/* Page header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-500/15">
            <CalendarIcon className="h-6 w-6 text-lime-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              Book With Admin
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Request a session with an admin for approval. Choose a date, time slot,
              and platform — we will notify you once it is confirmed.
            </p>
          </div>
        </div>

        {/* Three-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Session Details */}
          <Card className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-lime-500" />
              <h2 className="text-base font-bold text-lime-500">Session Details</h2>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Session Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Pencil className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lime-500" />
                  <input
                    type="text"
                    placeholder="e.g., Review Session"
                    className={`${fieldClass} pl-11 pr-4`}
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
                  <Monitor className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lime-500 z-10" />
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className={`${fieldClass} appearance-none pl-11 pr-10`}
                  >
                    <option value="">Select Platform</option>
                    <option value="Zoom Meeting">Zoom Meeting</option>
                    <option value="Call">Call</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Subject <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lime-500 z-10" />
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`${fieldClass} appearance-none pl-11 pr-10`}
                  >
                    <option value="">Select Subject</option>
                    <option value="Funtology">Funtology</option>
                    <option value="Barbertology">Barbertology</option>
                    <option value="Skintology Fundamentals">Skintology Fundamentals</option>
                    <option value="Nailtology Fundamentals">Nailtology Fundamentals</option>
                    <option value="Others">Others</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Select Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lime-500" />
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot(null);
                    }}
                    className={`${fieldClass} pl-11 pr-4`}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Available Time Slots */}
          <Card className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-foreground" />
              <h2 className="text-base font-bold text-foreground">Available Time Slots</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading slots...
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No slots available for this date</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {slots.map((slot: any, i: number) => {
                  const active =
                    selectedSlot?.startTime === slot.startTime &&
                    selectedSlot?.endTime === slot.endTime;

                  return (
                    <button
                      key={`${slot.startTime}-${slot.endTime}-${i}`}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition-colors ${
                        active
                          ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                          : "border-border/60 bg-muted/20 text-foreground hover:border-orange-500/50 hover:bg-orange-500/10"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {formatTimeRange(slot.startTime, slot.endTime)}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Upcoming Sessions */}
          <Card className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-base font-bold text-foreground">Upcoming Sessions</h2>
            </div>

            {upcomingSessionsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading upcoming sessions...
              </div>
            ) : upcomingSession ? (
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {format(new Date(upcomingSession.date), "yyyy-MM-dd")}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {to12Hour(upcomingSession.slots[0].startTime)}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-500">
                      <Video className="h-3.5 w-3.5" />
                      {upcomingSession.platform}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {upcomingSession.teacherHosted ? (
                      <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-bold text-white">
                        Your session
                      </span>
                    ) : null}
                    <span className="rounded-full bg-green-500 px-3 py-0.5 text-[10px] font-bold text-white">
                      confirmed
                    </span>
                  </div>
                </div>

                <Button
                  className="mb-3 w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleMeetingAction}
                  disabled={joinMeetingLoading || startMeetingLoading}
                >
                  {joinMeetingLoading || startMeetingLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {upcomingSession.teacherHosted ? "Starting…" : "Joining…"}
                    </>
                  ) : upcomingSession.teacherHosted ? (
                    "Start meeting"
                  ) : (
                    "Join Meeting"
                  )}
                </Button>

                <p className="border-t border-border/40 pt-3 text-xs text-muted-foreground">
                  {upcomingSession.title}
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full text-lime-500 hover:text-lime-400"
                  onClick={() => navigate("/all-sessions")}
                >
                  View All
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-muted/40" />
                  <CalendarIcon className="relative h-10 w-10 text-muted-foreground/50" />
                  <div className="absolute -right-1 top-2 h-3 w-3 rounded-full bg-lime-500/60" />
                  <div className="absolute -left-2 bottom-3 h-2 w-2 rounded-full bg-orange-400/60" />
                  <div className="absolute right-0 bottom-1 h-2.5 w-2.5 rounded-full bg-blue-400/60" />
                </div>
                <p className="text-sm font-semibold text-foreground">No upcoming sessions</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your booked sessions will appear here.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Purpose + Submit */}
        <Card className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-violet-400" />
              <label className="text-sm font-semibold text-foreground">
                Purpose <span className="font-normal text-muted-foreground">(Optional)</span>
              </label>
            </div>
            <textarea
              placeholder="Describe the purpose of this meeting..."
              rows={4}
              className="w-full resize-none rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-lime-500/25"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-lime-500" />
              <span>You&apos;ll be notified once your session is confirmed.</span>
            </div>
            <Button
              onClick={handleBookSession}
              disabled={bookingLoading}
              className="h-11 shrink-0 rounded-xl bg-gradient-to-r from-lime-500 to-cyan-500 px-8 font-semibold text-white shadow-md hover:from-lime-600 hover:to-cyan-600"
            >
              {bookingLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
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
