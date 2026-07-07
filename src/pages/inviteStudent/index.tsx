import { useState, useEffect, useMemo } from "react";
import { Mail, Key, Upload } from "lucide-react";
import { toast } from "sonner";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  useInviteStudentBulkCsvMutation,
  useInviteStudentBulkMutation,
  useInviteStudentMutation,
} from "@/redux/services/apiSlices/invitationSlice";
import { useGetMySubscriptionsQuery } from "@/redux/services/apiSlices/subscriptionSlice";

type CreatedCredential = {
  username: string;
  password: string;
};

const extractManualCredentials = (res: any): CreatedCredential[] => {
  const data = res?.data;
  if (!data) return [];

  if (typeof data.username === "string" && typeof data.password === "string") {
    return [{ username: data.username, password: data.password }];
  }

  if (Array.isArray(data.successes)) {
    return data.successes
      .filter((item: any) => item?.username && item?.password)
      .map((item: any) => ({
        username: String(item.username),
        password: String(item.password),
      }));
  }

  return [];
};

type BulkInviteRow = {
  key: string;
  firstName: string;
  lastName: string;
  email: string;
  courseType: string[];
};

const makeRow = (): BulkInviteRow => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  firstName: "",
  lastName: "",
  email: "",
  courseType: ["Funtology"],
});

export default function InviteStudent() {
  useEffect(() => {
    document.title = "Invite Students • iFuntology Teacher";
  }, []);

  const { data: subscriptions, refetch: refetchSubscriptions } = useGetMySubscriptionsQuery({ status: "ACTIVE" });
  const subscriptionsData = subscriptions?.data?.docs ?? [];
  const [sendOpen, setSendOpen] = useState(false);
  const [createdOpen, setCreatedOpen] = useState(false);

  // Form 1: Email invitation (bulk rows)
  const [emailRows, setEmailRows] = useState<BulkInviteRow[]>([makeRow()]);

  // Form 2: Manual credentials
  const [manualRows, setManualRows] = useState<BulkInviteRow[]>([makeRow()]);

  // Credentials from MANUAL response (if API returns them)
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredential[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const [inviteStudent] = useInviteStudentMutation();
  const [inviteStudentBulk] = useInviteStudentBulkMutation();
  const [inviteStudentBulkCsv] = useInviteStudentBulkCsvMutation();
  const [submittingType, setSubmittingType] = useState<"EMAIL" | "MANUAL" | null>(null);
  const seatAvailabilityByCourse = useMemo(() => {
    const map: Record<string, number> = {};
    for (const sub of subscriptionsData) {
      const courseType = typeof sub?.courseType === "string" ? sub.courseType : "";
      if (!courseType) continue;
      const totalSeats = Number(sub?.numberOfSeats ?? 0);
      const usedSeats = Number(sub?.usedSeats ?? 0);
      map[courseType] = Math.max(0, totalSeats - usedSeats);
    }
    return map;
  }, [subscriptionsData]);
  const availableCourses: string[] = useMemo(() => {
    const fromSubs: string[] = subscriptionsData
      .map((s: any) => (typeof s?.courseType === "string" ? s.courseType : ""))
      .filter((c: string) => c.trim().length > 0);
    const unique: string[] = Array.from(new Set(fromSubs));
    return unique.length > 0
      ? unique
      : ["Funtology", "Barbertology", "Nailtology", "Skintology"];
  }, [subscriptionsData]);

  const toggleRowCourse = (
    key: string,
    value: string,
    rows: BulkInviteRow[],
    setRows: React.Dispatch<React.SetStateAction<BulkInviteRow[]>>
  ) => {
    const row = rows.find((r) => r.key === key);
    if (!row) return;
    const nextCourses = row.courseType.includes(value)
      ? row.courseType.filter((v) => v !== value)
      : [...row.courseType, value];
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, courseType: nextCourses } : r)));
  };

  const validateSeatAvailabilityByRows = (
    rows: Array<{ courseType: string[] }>
  ) => {
    const requestedByCourse: Record<string, number> = {};
    for (const row of rows) {
      const selected = Array.isArray(row.courseType) ? row.courseType : [];
      for (const course of selected) {
        requestedByCourse[course] = (requestedByCourse[course] ?? 0) + 1;
      }
    }
    for (const [course, requested] of Object.entries(requestedByCourse)) {
      const available = seatAvailabilityByCourse[course] ?? 0;
      if (requested > available) {
        toast.error(`Only ${available} seat(s) available for ${course}.`);
        return false;
      }
    }
    return true;
  };

  const updateEmailRow = (key: string, field: "firstName" | "lastName" | "email", value: string) => {
    setEmailRows((rows) => rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const addEmailRow = () => {
    setEmailRows((rows) => [...rows, makeRow()]);
  };

  const removeEmailRow = (key: string) => {
    setEmailRows((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.key !== key)));
  };

  const handleEmailBulkInvitation = async () => {
    setSubmittingType("EMAIL");
    const invites = emailRows
      .map((r) => ({
        firstName: r.firstName.trim(),
        lastName: r.lastName.trim(),
        email: r.email.trim().toLowerCase(),
        courseType: r.courseType,
        type: "EMAIL" as const,
      }))
      .filter((r) => r.firstName || r.lastName || r.email);

    if (invites.length === 0) {
      toast.error("Add at least one student with first name, last name, and email.");
      setSubmittingType(null);
      return;
    }

    const invalid = invites.find((r) => !r.firstName || !r.lastName || !r.email);
    if (invalid) {
      toast.error("Each student row must have first name, last name, and email.");
      setSubmittingType(null);
      return;
    }
    const missingCourse = invites.find((r) => !Array.isArray(r.courseType) || r.courseType.length === 0);
    if (missingCourse) {
      toast.error("Please select at least one course for each student.");
      setSubmittingType(null);
      return;
    }
    if (!validateSeatAvailabilityByRows(invites)) {
      setSubmittingType(null);
      return;
    }

    try {
      const res: any = await inviteStudentBulk(invites).unwrap();
      if (res?.status) {
        toast.message(res?.message ?? "Invitations sent.");
        setSendOpen(true);
        setEmailRows([makeRow()]);
        refetchSubscriptions();
      } else {
        toast.error(res?.message || "Failed to send invitations");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to send invitations");
    } finally {
      setSubmittingType(null);
    }
  };

  const handleCsvInvitationUpload = async () => {
    if (!csvFile) {
      toast.error("Please choose a CSV file first.");
      return;
    }

    const lowerName = csvFile.name.toLowerCase();
    if (!lowerName.endsWith(".csv")) {
      toast.error("Only .csv files are supported.");
      return;
    }

    setSubmittingType("EMAIL");
    try {
      const res: any = await inviteStudentBulkCsv(csvFile).unwrap();
      if (res?.status) {
        toast.message(res?.message ?? "CSV invitations sent.");
        setSendOpen(true);
        setCsvFile(null);
        refetchSubscriptions();
      } else {
        toast.error(res?.message || "Failed to upload CSV invitations");
      }
    } catch (err: any) {
      const parseErrors: Array<{ row: number; message: string }> =
        err?.data?.data?.parseErrors ?? [];
      if (Array.isArray(parseErrors) && parseErrors.length > 0) {
        const preview = parseErrors
          .slice(0, 3)
          .map((e) => `Row ${e.row}: ${e.message}`)
          .join(" | ");
        toast.error(`CSV has invalid rows. ${preview}`);
      } else {
        toast.error(err?.data?.message || err?.message || "Failed to upload CSV invitations");
      }
    } finally {
      setSubmittingType(null);
    }
  };

  const updateManualRow = (key: string, field: "firstName" | "lastName", value: string) => {
    setManualRows((rows) => rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const addManualRow = () => {
    setManualRows((rows) => [...rows, makeRow()]);
  };

  const removeManualRow = (key: string) => {
    setManualRows((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.key !== key)));
  };

  const handleManualBulkInvitation = async () => {
    setSubmittingType("MANUAL");
    const body = manualRows
      .map((r) => ({
        firstName: r.firstName.trim(),
        lastName: r.lastName.trim(),
        courseType: r.courseType,
        type: "MANUAL" as const,
      }))
      .filter((r) => r.firstName || r.lastName);

    if (body.length === 0) {
      toast.error("Add at least one student with first name and last name.");
      setSubmittingType(null);
      return;
    }

    const invalid = body.find((r) => !r.firstName || !r.lastName);
    if (invalid) {
      toast.error("Each student row must have first name and last name.");
      setSubmittingType(null);
      return;
    }
    const missingCourse = body.find((r) => !Array.isArray(r.courseType) || r.courseType.length === 0);
    if (missingCourse) {
      toast.error("Please select at least one course for each student.");
      setSubmittingType(null);
      return;
    }
    if (!validateSeatAvailabilityByRows(body)) {
      setSubmittingType(null);
      return;
    }

    try {
      const res: any =
        body.length === 1
          ? await inviteStudent(body[0]).unwrap()
          : await inviteStudentBulk(body).unwrap();

      if (res.status) {
        toast.message(res.message);
        const credentials = extractManualCredentials(res);
        if (credentials.length === 0) {
          toast.error("Account created, but credentials were not returned. Please contact support.");
        }
        setCreatedCredentials(credentials);
        setCreatedOpen(true);
        setManualRows([makeRow()]);
        refetchSubscriptions();
      } else {
        toast.error(res?.message || "Failed to create student account");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to generate credentials"
      );
    } finally {
      setSubmittingType(null);
    }
  };

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full space-y-6">
        <h1 className="text-2xl font-extrabold">Invite Students</h1>

        <Card className="rounded-2xl border border-border/60 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-accent/20 p-3">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Method 1: Email Invitation</div>
                  <div className="text-xs text-muted-foreground">Automated email with login link</div>
                </div>
              </div>

              <div className="space-y-2">
                {emailRows.map((row, idx) => (
                  <div key={row.key} className="rounded-md border border-border/60 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Student {idx + 1}</span>
                      {emailRows.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => removeEmailRow(row.key)}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        First Name
                      </label>
                      <Input
                        placeholder="Jane"
                        value={row.firstName}
                        onChange={(e) => updateEmailRow(row.key, "firstName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Last Name
                      </label>
                      <Input
                        placeholder="Doe"
                        value={row.lastName}
                        onChange={(e) => updateEmailRow(row.key, "lastName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Email
                      </label>
                      <Input
                        placeholder="student@school.edu"
                        type="email"
                        value={row.email}
                        onChange={(e) => updateEmailRow(row.key, "email", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Select Course(s)
                      </label>
                      <div className="rounded-md border border-border/60 p-2 space-y-2">
                        {availableCourses.map((course) => (
                          <label key={course} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={row.courseType.includes(course)}
                              onChange={() => toggleRowCourse(row.key, course, emailRows, setEmailRows)}
                            />
                            {course}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addEmailRow}>
                  Add Multiple Students
                </Button>
              </div>
              <div className="rounded-md border border-border/60 p-3 space-y-3">
                <div className="text-xs font-semibold text-muted-foreground">
                  Bulk upload with CSV
                </div>
                <p className="text-xs text-muted-foreground">
                  Required headers: <span className="font-mono">firstName,lastName,email,courseType</span>. For multiple courses use <span className="font-mono">|</span>, e.g. <span className="font-mono">Funtology|Barbertology</span>.
                </p>
                <Input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                />
                {csvFile ? (
                  <p className="text-xs text-muted-foreground">
                    Selected file: <span className="font-medium text-foreground">{csvFile.name}</span>
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  disabled={submittingType !== null}
                  onClick={handleCsvInvitationUpload}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {submittingType === "EMAIL" ? "Uploading…" : "Upload CSV & Send Invites"}
                </Button>
              </div>
              {/* What happens next (left) */}
              <div className="mt-4 rounded-lg border border-border/60 bg-card/30 p-3 text-sm">
                <div className="mb-2 font-semibold">What happens next:</div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                  <li>System creates student account</li>
                  <li>Email sent with credentials</li>
                  <li>Student clicks link of site url</li>
                  <li>Student can login immediately</li>
                </ol>
              </div>

              <div className="mt-3">
                <Button
                  variant="brand"
                  disabled={submittingType !== null}
                  onClick={handleEmailBulkInvitation}
                >
                  {submittingType === "EMAIL" ? "Sending…" : "Send Email Invitations"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-accent/20 p-3">
                  <Key className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Method 2: Generate Credentials</div>
                  <div className="text-xs text-muted-foreground">Manual username & password</div>
                </div>
              </div>

              <div className="space-y-2">
                {manualRows.map((row, idx) => (
                  <div key={row.key} className="rounded-md border border-border/60 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Student {idx + 1}</span>
                      {manualRows.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => removeManualRow(row.key)}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        First Name
                      </label>
                      <Input
                        placeholder="Jane"
                        value={row.firstName}
                        onChange={(e) => updateManualRow(row.key, "firstName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Last Name
                      </label>
                      <Input
                        placeholder="Doe"
                        value={row.lastName}
                        onChange={(e) => updateManualRow(row.key, "lastName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Select Course(s)
                      </label>
                      <div className="rounded-md border border-border/60 p-2 space-y-2">
                        {availableCourses.map((course) => (
                          <label key={course} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={row.courseType.includes(course)}
                              onChange={() => toggleRowCourse(row.key, course, manualRows, setManualRows)}
                            />
                            {course}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addManualRow}>
                  Add Multiple Students
                </Button>
              </div>

              {/* What happens next (right) */}
              <div className="mt-4 rounded-lg border border-border/60 bg-card/30 p-3 text-sm">
                <div className="mb-2 font-semibold">What happens next:</div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                  <li>System generates credentials</li>
                  <li>You receive username &amp; password</li>
                  <li>Share credentials with student</li>
                  <li>Student can login immediately</li>
                </ol>
              </div>

              <div className="mt-3">
                <Button
                  variant="brand"
                  disabled={submittingType !== null}
                  onClick={handleManualBulkInvitation}
                >
                  {submittingType === "MANUAL" ? "Generating…" : "Generate Credentials"}
                </Button>
              </div>
            </div>
          </div>

          {/* <div className="mt-6 rounded-md border border-border/60 bg-card/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Bulk Invitation</div>
                <div className="text-xs text-muted-foreground">Upload a CSV with student details to invite many at once.</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4" />
                  <span className="ml-2">Download Template</span>
                </Button>
                <Button variant="accent">
                  <Upload className="h-4 w-4" />
                  <span className="ml-2">Upload CSV</span>
                </Button>
              </div>
            </div>
          </div> */}
        </Card>

        {/* Dialog: Invitation Sent (screen 17) */}
        <Dialog open={sendOpen} onOpenChange={setSendOpen}>
          <DialogContent>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-4">
                <svg className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <DialogTitle>System Alert</DialogTitle>
              <DialogDescription>Your email invitation has been sent successfully!</DialogDescription>
              <div className="w-full">
                <Button className="w-full" onClick={() => setSendOpen(false)}>
                  Okay
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Dialog: Student Account Created (screen 18) */}
        <Dialog open={createdOpen} onOpenChange={(open) => { setCreatedOpen(open); if (!open) setCreatedCredentials([]); }}>
          <DialogContent>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-4">
                <svg className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <DialogTitle>System Alert</DialogTitle>
              <DialogDescription>
                {createdCredentials.length > 1
                  ? `${createdCredentials.length} student accounts created!`
                  : "Student Account Created!"}
              </DialogDescription>

              <div className="w-full max-h-64 overflow-y-auto text-sm text-muted-foreground space-y-3">
                {createdCredentials.length === 0 ? (
                  <p className="text-center text-xs">Credentials were not included in the response.</p>
                ) : (
                  createdCredentials.map((cred, index) => (
                    <div
                      key={`${cred.username}-${index}`}
                      className="rounded-lg border border-border/60 p-3 space-y-2"
                    >
                      {createdCredentials.length > 1 ? (
                        <div className="text-xs font-semibold text-foreground">Student {index + 1}</div>
                      ) : null}
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M16 11V8a4 4 0 10-8 0v3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div>Username</div>
                        </div>
                        <div className="font-mono text-foreground">{cred.username}</div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 11v2m0 4h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div>Password</div>
                        </div>
                        <div className="font-mono text-foreground">{cred.password}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="w-full">
                <Button
                  className="w-full"
                  disabled={createdCredentials.length === 0}
                  onClick={() => {
                    const text = createdCredentials
                      .map((cred) => `${cred.username}:${cred.password}`)
                      .join("\n");
                    if (text && navigator.clipboard?.writeText) {
                      navigator.clipboard.writeText(text);
                      toast.success("Credentials copied to clipboard");
                    }
                  }}
                >
                  Copy Credentials
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </DashboardWithSidebarLayout>
  );
}
