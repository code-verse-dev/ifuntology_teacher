import { useState, useEffect } from "react";
import { Mail, Key, Download, Upload } from "lucide-react";
import { toast } from "sonner";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function InviteStudent() {
  useEffect(() => {
    document.title = "Invite Students • iFuntology Teacher";
  }, []);

  const [sendOpen, setSendOpen] = useState(false);
  const [createdOpen, setCreatedOpen] = useState(false);

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
                  <Input id="firstNameEmail" placeholder="First Name" />
                </div>

                <div>
                  <label htmlFor="lastNameEmail" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Last Name
                  </label>
                  <Input id="lastNameEmail" placeholder="Last Name" />
                </div>

                <div>
                  <label htmlFor="emailEmail" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Email
                  </label>
                  <Input id="emailEmail" placeholder="Email" />
                </div>

                <div>
                  <label htmlFor="courseEmail" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Select Course
                  </label>
                  <select id="courseEmail" className="w-full rounded-md border border-border/60 bg-background p-2 text-sm">
                    <option>Funtology</option>
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
                  onClick={() => {
                    setSendOpen(true);
                  }}
                >
                  Send Email Invitation
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
                  <Input id="firstNameGen" placeholder="First Name" />
                </div>

                <div>
                  <label htmlFor="lastNameGen" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Last Name
                  </label>
                  <Input id="lastNameGen" placeholder="Last Name" />
                </div>

                <div>
                  <label htmlFor="emailGen" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Email (Optional)
                  </label>
                  <Input id="emailGen" placeholder="Email (Optional)" />
                </div>

                <div>
                  <label htmlFor="courseGen" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Select Course
                  </label>
                  <select id="courseGen" className="w-full rounded-md border border-border/60 bg-background p-2 text-sm">
                    <option>Funtology</option>
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
                  onClick={() => {
                    setCreatedOpen(true);
                  }}
                >
                  Generate Credentials
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-md border border-border/60 bg-card/30 p-4">
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
          </div>
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
        <Dialog open={createdOpen} onOpenChange={setCreatedOpen}>
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
                  <div className="font-mono">student_user</div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 11v2m0 4h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>Password</div>
                  </div>
                  <div className="font-mono">GEQVERPAD</div>
                </div>
              </div>

              <div className="w-full">
                <Button className="w-full" onClick={() => {
                  navigator.clipboard?.writeText("student_user:GEQVERPAD");
                  toast.message("Credentials copied to clipboard");
                }}>
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
