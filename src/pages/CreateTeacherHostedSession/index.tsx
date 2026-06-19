import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  UserPlus,
  Video,
} from "lucide-react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  useCreateTeacherHostedSessionMutation,
  useGetInviteableStudentsQuery,
} from "@/redux/services/apiSlices/sessionSlice";
import { toast } from "sonner";

/** Normalize to backend format e.g. "17:15:00" */
function to24HourWithSeconds(time: string): string {
  const t = time.trim();
  if (!t) return "";
  const parts = t.split(":");
  const h = String(Number(parts[0])).padStart(2, "0");
  const m = String(Number(parts[1] ?? 0)).padStart(2, "0");
  const s =
    parts.length >= 3
      ? String(Number(parts[2])).padStart(2, "0")
      : "00";
  return `${h}:${m}:${s}`;
}

/** Parse "HH:MM" or "HH:MM:SS" for display */
function partsFromTimeString(time: string): { h: number; m: number; s: number } | null {
  const t = time.trim();
  if (!t) return null;
  const p = t.split(":").map((x) => Number(String(x).trim()));
  if (p.some((n) => Number.isNaN(n))) return null;
  return { h: p[0] ?? 0, m: p[1] ?? 0, s: p[2] ?? 0 };
}

function formatSingleTimeTo12Hour(time: string): string {
  const parts = partsFromTimeString(time);
  if (!parts) return "—";
  const { h, m } = parts;
  const hour24 = ((h % 24) + 24) % 24;
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatTimeRange12h(start: string, end: string): string {
  return `${formatSingleTimeTo12Hour(start)} – ${formatSingleTimeTo12Hour(end)}`;
}

/** Local calendar date + wall-clock start → instant for comparison */
function getLocalSlotStart(selectedDate: string, timeHHMM: string): Date | null {
  const timeNorm = to24HourWithSeconds(timeHHMM);
  const pr = partsFromTimeString(timeNorm);
  if (!pr) return null;
  const [y, mo, d] = selectedDate.split("-").map(Number);
  if (!y || !mo || !d) return null;
  const dt = new Date(y, mo - 1, d, pr.h, pr.m, pr.s, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function studentDisplayName(s: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  const name = `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim();
  return name || s.email || "Student";
}

export default function CreateTeacherHostedSession() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("Zoom Meeting");
  const [subject, setSubject] = useState("");
  const [purpose, setPurpose] = useState("");
  /** HTML time input values are always "HH:MM" (24h) */
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const todayMin = format(new Date(), "yyyy-MM-dd");

  const {
    data: inviteableRaw,
    isLoading: studentsLoading,
  } = useGetInviteableStudentsQuery("");

  const students: any[] = useMemo(() => {
    const d = inviteableRaw?.data;
    return Array.isArray(d) ? d : [];
  }, [inviteableRaw]);

  const [createHosted, { isLoading: submitting }] = useCreateTeacherHostedSessionMutation();

  const previewRange = useMemo(() => {
    if (!startTime || !endTime) return null;
    return formatTimeRange12h(startTime, endTime);
  }, [startTime, endTime]);

  useEffect(() => {
    document.title = "Classroom Sessions • iFuntology Teacher";
  }, []);

  const toggleStudent = (id: string, checked: boolean) => {
    setSelectedStudentIds((prev) =>
      checked ? [...prev.filter((x) => x !== id), id] : prev.filter((x) => x !== id)
    );
  };

  const validateBeforeSubmit = (): boolean => {
    if (!title.trim() || !platform || !subject) {
      toast.error("Fill in title, subject, and platform.");
      return false;
    }
    if (!selectedDate || !startTime || !endTime) {
      toast.error("Choose a session date, start time, and end time.");
      return false;
    }

    const startNorm = to24HourWithSeconds(startTime);
    const endNorm = to24HourWithSeconds(endTime);
    const startMs = getLocalSlotStart(selectedDate, startNorm)?.getTime();
    const endMs = getLocalSlotStart(selectedDate, endNorm)?.getTime();
    if (startMs == null || endMs == null) {
      toast.error("Invalid date or time.");
      return false;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const sessionDay = new Date(
      Number(selectedDate.slice(0, 4)),
      Number(selectedDate.slice(5, 7)) - 1,
      Number(selectedDate.slice(8, 10)),
      0,
      0,
      0,
      0
    );
    if (sessionDay.getTime() < todayStart.getTime()) {
      toast.error("Session date must be today or in the future.");
      return false;
    }

    if (endMs <= startMs) {
      toast.error("End time must be after start time.");
      return false;
    }

    if (startMs <= Date.now()) {
      toast.error("Start date and time must be in the future.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateBeforeSubmit()) return;

    const startNorm = to24HourWithSeconds(startTime);
    const endNorm = to24HourWithSeconds(endTime);

    const body: Record<string, unknown> = {
      title: title.trim(),
      subject,
      platform,
      date: selectedDate,
      slots: [{ startTime: startNorm, endTime: endNorm }],
    };
    if (purpose.trim()) body.purpose = purpose.trim();
    if (selectedStudentIds.length > 0) body.studentIds = selectedStudentIds;

    try {
      const res: any = await createHosted(body).unwrap();
      if (res?.status) {
        toast.success(res?.message || "Session created");
        navigate("/all-sessions");
      } else {
        toast.error(res?.message || "Could not create session");
      }
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Could not create session");
    }
  };

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/book-a-session/classroom")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Classroom Sessions</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Create your own Zoom session, set the date and time, and invite enrolled students.
          </p>
        </div>

        <Card className="rounded-2xl border border-border/60 p-6 space-y-6">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-muted-foreground">
            Admin-booked sessions still use{" "}
            <strong className="text-foreground">Book a session</strong> on the previous page. This
            flow is only for sessions you host yourself.
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Session title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Lab review"
              className="w-full rounded-xl border border-border/40 bg-muted/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Platform <span className="text-red-500">*</span>
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-xl border border-border/40 bg-muted/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Zoom Meeting">Zoom Meeting</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-border/40 bg-muted/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select subject</option>
                <option value="Funtology">Funtology</option>
                <option value="Barbertology">Barbertology</option>
                <option value="Skintology Fundamentals">Skintology Fundamentals</option>
                <option value="Nailtology Fundamentals">Nailtology Fundamentals</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Session date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={todayMin}
                className="w-full rounded-xl border border-border/40 bg-muted/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session time <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Enter start and end using the time pickers (stored as 24-hour values like{" "}
              <span className="font-mono text-foreground">17:15:00</span> for the API).
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Start</label>
                <input
                  type="time"
                  step={60}
                  className="w-full rounded-xl border border-border/40 bg-muted/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">End</label>
                <input
                  type="time"
                  step={60}
                  className="w-full rounded-xl border border-border/40 bg-muted/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            {previewRange ? (
              <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground">
                <span className="text-muted-foreground">Preview: </span>
                {previewRange}
              </p>
            ) : null}
          </div>

          <div className="space-y-3 border-t border-border/40 pt-6">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite students <span className="font-normal text-muted-foreground">(optional)</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Selected students are notified when you create the session. You can add or change
              invites anytime from My Sessions.
            </p>
            {studentsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading students…
              </div>
            ) : inviteableRaw && inviteableRaw.status === false ? (
              <p className="text-sm text-destructive py-2">
                {inviteableRaw.message || "Could not load inviteable students."}
              </p>
            ) : students.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No inviteable students for sessions yet. You can still create the session and invite
                later from My Sessions.
              </p>
            ) : (
              <div className="max-h-[min(40vh,280px)] space-y-2 overflow-y-auto rounded-xl border border-border/60 p-3">
                {students.map((stu: any) => {
                  const id = String(stu._id);
                  const checked = selectedStudentIds.includes(id);
                  return (
                    <div
                      key={id}
                      className="flex items-start gap-3 rounded-lg border border-border/40 p-3"
                    >
                      <Checkbox
                        id={`hosted-student-${id}`}
                        checked={checked}
                        onCheckedChange={(v) => toggleStudent(id, v === true)}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={`hosted-student-${id}`}
                        className="flex-1 cursor-pointer font-normal leading-snug"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {studentDisplayName(stu)}
                        </span>
                        {stu.email ? (
                          <span className="mt-0.5 block text-xs text-muted-foreground">{stu.email}</span>
                        ) : null}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">
              Notes <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="What will you cover?"
              className="w-full resize-none rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate("/book-a-session/classroom")}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Creating…
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4 inline" />
                  Create session
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/40 p-4 text-xs text-muted-foreground flex gap-3">
          <CalendarIcon className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
          <div>
            The session must start in the future. As host, use{" "}
            <strong className="text-foreground">Start meeting</strong> on the day of the session;
            invited students use the join link from their notifications or session list.
          </div>
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
