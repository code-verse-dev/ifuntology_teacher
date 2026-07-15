import { BookOpen, Loader2, Lock, Sparkles, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGetClassroomAccessQuery } from "@/redux/services/apiSlices/sessionSlice";
import CreateTeacherHostedSession from "@/pages/CreateTeacherHostedSession";

export default function ClassroomSessionsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetClassroomAccessQuery();

  const access = data?.data;
  const hasAccess = Boolean(access?.hasAccess);

  // --- Previous one-time payment gate UI (restore with Pay & unlock flow) ---
  // const fee = Number(access?.fee ?? 99);
  // const currency = String(access?.currency ?? "usd").toUpperCase();

  if (isLoading) {
    return (
      <DashboardWithSidebarLayout>
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Checking classroom access…
        </div>
      </DashboardWithSidebarLayout>
    );
  }

  if (hasAccess) {
    return <CreateTeacherHostedSession />;
  }

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-2xl space-y-6 py-4">
        <div>
          <h1 className="text-2xl font-extrabold">Classroom Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Host your own Zoom classroom sessions and invite enrolled students.
            An active course Enrollment is required to use this feature.
          </p>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-orange-500/20">
          <div className="bg-gradient-to-br from-orange-500/10 via-transparent to-lime-500/10 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-orange-500/15 p-3 text-orange-600 dark:text-orange-400">
                <Lock className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-lg font-bold">Enrollment required</h2>
                <p className="text-sm text-muted-foreground">
                  Classroom sessions are available when you have at least one
                  active course Enrollment. Enroll in a course to unlock
                  hosting your own sessions.
                </p>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Video className="h-4 w-4 shrink-0 text-lime-600" />
                    Create Zoom sessions on your schedule
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0 text-lime-600" />
                    Invite your enrolled students instantly
                  </li>
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 shrink-0 text-lime-600" />
                    Requires any active LMS course Enrollment
                  </li>
                </ul>

                {/* --- Previous one-time payment unlock UI ---
                <div className="pt-2">
                  <p className="text-3xl font-extrabold text-foreground">
                    ${fee.toFixed(2)}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {currency} · one-time
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button
                    type="button"
                    className="rounded-full bg-lime-600 hover:bg-lime-700"
                    onClick={() =>
                      navigate("/payment", {
                        state: {
                          type: "CLASSROOM_SESSION",
                          total: fee,
                        },
                      })
                    }
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay & unlock access
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => navigate("/book-a-session")}
                  >
                    Book with admin instead
                  </Button>
                </div>
                --- */}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button
                    type="button"
                    className="rounded-full bg-lime-600 hover:bg-lime-700"
                    onClick={() => navigate("/shop")}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Enroll Now
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => navigate("/book-a-session")}
                  >
                    Book with admin instead
                  </Button>
                </div>

                {isError ? (
                  <p className="text-sm text-destructive">
                    Could not verify access status. Please refresh and try again.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
