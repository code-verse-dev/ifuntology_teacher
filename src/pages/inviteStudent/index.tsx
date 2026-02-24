import { useState, useEffect } from "react";
import { Mail, Key, Download, Upload } from "lucide-react";
import { toast } from "sonner";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useInviteStudentMutation } from "@/redux/services/apiSlices/invitationSlice";

export default function InviteStudent() {
  useEffect(() => {
    document.title = "Invite Students • iFuntology Teacher";
  }, []);

  const [sendOpen, setSendOpen] = useState(false);
  const [createdOpen, setCreatedOpen] = useState(false);

  // Form 1: Email invitation
  const [firstNameEmail, setFirstNameEmail] = useState("");
  const [lastNameEmail, setLastNameEmail] = useState("");
  const [emailEmail, setEmailEmail] = useState("");
  const [courseEmail, setCourseEmail] = useState("Funtology");

  // Form 2: Manual credentials
  const [firstNameGen, setFirstNameGen] = useState("");
  const [lastNameGen, setLastNameGen] = useState("");
  const [courseGen, setCourseGen] = useState("Funtology");

  // Credentials from MANUAL response (if API returns them)
  const [createdCredentials, setCreatedCredentials] = useState<{ username?: string; password?: string } | null>(null);

  const [inviteStudent] = useInviteStudentMutation();
  const [submittingType, setSubmittingType] = useState<"EMAIL" | "MANUAL" | null>(null);

  const handleInvitation = async (type: "EMAIL" | "MANUAL") => {
    setSubmittingType(type);
    const isEmail = type === "EMAIL";
    const body = isEmail
      ? {
          firstName: firstNameEmail.trim(),
          lastName: lastNameEmail.trim(),
          email: emailEmail.trim(),
          courseType: courseEmail,
          type: "EMAIL" as const,
        }
      : {
          firstName: firstNameGen.trim(),
          lastName: lastNameGen.trim(),
          courseType: courseGen,
          type: "MANUAL" as const,
        };

    try {
      const res: any = await inviteStudent(body).unwrap();
      console.log(res, 'res');
      if(res.status){
          toast.message(res.message);
          if (isEmail) {
            setSendOpen(true);
            setFirstNameEmail("");
            setLastNameEmail("");
            setEmailEmail("");
          } else {
            setCreatedCredentials({
              username: res?.data?.username ?? res?.username,
              password: res?.data?.password ?? res?.password,
            });
            setCreatedOpen(true);
            setFirstNameGen("");
            setLastNameGen("");
          }
      }
      else{
        toast.error(res?.message || "Failed to create student account");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || (isEmail ? "Failed to send invitation" : "Failed to generate credentials")
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
                <div>
                  <label htmlFor="firstNameEmail" className="mb-1 block text-xs font-medium text-muted-foreground">
                    First Name
                  </label>
                  <Input
                    id="firstNameEmail"
                    placeholder="First Name"
                    value={firstNameEmail}
                    onChange={(e) => setFirstNameEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="lastNameEmail" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Last Name
                  </label>
                  <Input
                    id="lastNameEmail"
                    placeholder="Last Name"
                    value={lastNameEmail}
                    onChange={(e) => setLastNameEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="emailEmail" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Email
                  </label>
                  <Input
                    id="emailEmail"
                    placeholder="Email"
                    type="email"
                    value={emailEmail}
                    onChange={(e) => setEmailEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="courseEmail" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Select Course
                  </label>
                  <select
                    id="courseEmail"
                    className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                    value={courseEmail}
                    onChange={(e) => setCourseEmail(e.target.value)}
                  >
                    <option value="Funtology">Funtology</option>
                    <option value="Barbertology">Barbertology</option>
                    <option value="Nailtology">Nailtology</option>
                    <option value="Skintology">Skintology</option>
                  </select>
                </div>
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
                  disabled={submittingType !== null || !firstNameEmail.trim() || !lastNameEmail.trim() || !emailEmail.trim()}
                  onClick={() => handleInvitation("EMAIL")}
                >
                  {submittingType === "EMAIL" ? "Sending…" : "Send Email Invitation"}
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
                <div>
                  <label htmlFor="firstNameGen" className="mb-1 block text-xs font-medium text-muted-foreground">
                    First Name
                  </label>
                  <Input
                    id="firstNameGen"
                    placeholder="First Name"
                    value={firstNameGen}
                    onChange={(e) => setFirstNameGen(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="lastNameGen" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Last Name
                  </label>
                  <Input
                    id="lastNameGen"
                    placeholder="Last Name"
                    value={lastNameGen}
                    onChange={(e) => setLastNameGen(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="courseGen" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Select Course
                  </label>
                  <select
                    id="courseGen"
                    className="w-full rounded-md border border-border/60 bg-background p-2 text-sm"
                    value={courseGen}
                    onChange={(e) => setCourseGen(e.target.value)}
                  >
                    <option value="Funtology">Funtology</option>
                    <option value="Barbertology">Barbertology</option>
                    <option value="Nailtology">Nailtology</option>
                    <option value="Skintology">Skintology</option>
                  </select>
                </div>
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
                  disabled={submittingType !== null || !firstNameGen.trim() || !lastNameGen.trim()}
                  onClick={() => handleInvitation("MANUAL")}
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
        <Dialog open={createdOpen} onOpenChange={(open) => { setCreatedOpen(open); if (!open) setCreatedCredentials(null); }}>
          <DialogContent>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-4">
                <svg className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <DialogTitle>System Alert</DialogTitle>
              <DialogDescription>Student Account Created!</DialogDescription>

              <div className="w-full text-sm text-muted-foreground">
                <div className="flex items-center justify-between border-b border-border/60 py-2">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M16 11V8a4 4 0 10-8 0v3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>Username</div>
                  </div>
                  <div className="font-mono">{createdCredentials?.username ?? "—"}</div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 11v2m0 4h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>Password</div>
                  </div>
                  <div className="font-mono">{createdCredentials?.password ?? "—"}</div>
                </div>
              </div>

              <div className="w-full">
                <Button
                  className="w-full"
                  onClick={() => {
                    const text = createdCredentials?.username && createdCredentials?.password
                      ? `${createdCredentials.username}:${createdCredentials.password}`
                      : "";
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
