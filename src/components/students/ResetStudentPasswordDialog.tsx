import { useEffect, useState } from "react";
import { Copy, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useResetStudentPasswordMutation } from "@/redux/services/apiSlices/invitationSlice";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId?: string;
  studentName?: string;
};

type ResetResult = {
  email?: string | null;
  username?: string | null;
  password: string;
  emailed?: boolean;
};

const MIN_PASSWORD_LENGTH = 8;

export default function ResetStudentPasswordDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
}: Props) {
  const [resetPassword, { isLoading }] = useResetStudentPasswordMutation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [result, setResult] = useState<ResetResult | null>(null);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setConfirmPassword("");
      setResult(null);
    }
  }, [open]);

  const passwordError =
    password.length > 0 && password.length < MIN_PASSWORD_LENGTH
      ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
      : null;
  const confirmError =
    confirmPassword.length > 0 && password !== confirmPassword
      ? "Passwords do not match."
      : null;
  const canSubmit =
    Boolean(studentId) &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password === confirmPassword &&
    !isLoading;

  const handleReset = async () => {
    if (!studentId || !canSubmit) return;
    try {
      const res: any = await resetPassword({ studentId, password }).unwrap();
      if (res?.status && res?.data?.password) {
        setResult(res.data);
        toast.success(res?.message ?? "Password reset successfully.");
      } else {
        toast.error(res?.message ?? "Could not reset password.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message ?? err?.message ?? "Could not reset password.");
    }
  };

  const copyText = async (label: string, value?: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}.`);
    }
  };

  const displayName = studentName?.trim() || "this student";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-lime-600" />
            Reset student password
          </DialogTitle>
          <DialogDescription>
            {result
              ? "Share these login details with the student. The previous password no longer works."
              : `Set a new password for ${displayName}. Existing passwords cannot be viewed for security reasons.`}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3 rounded-xl bg-muted/50 p-4 text-sm">
            {result.email ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-semibold break-all">{result.email}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 rounded-full"
                  onClick={() => copyText("Email", result.email)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
            {result.username ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p className="font-semibold">{result.username}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 rounded-full"
                  onClick={() => copyText("Username", result.username)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">New password</p>
                <p className="font-mono font-semibold">{result.password}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 rounded-full"
                onClick={() => copyText("Password", result.password)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {result.emailed ? (
              <p className="text-xs text-muted-foreground">
                An email with the new password was also sent to the student.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-new-password">New password</Label>
              <Input
                id="student-new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-11 rounded-xl"
                autoComplete="new-password"
              />
              {passwordError ? (
                <p className="text-xs text-rose-600">{passwordError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Minimum {MIN_PASSWORD_LENGTH} characters.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-confirm-password">Confirm password</Label>
              <Input
                id="student-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="h-11 rounded-xl"
                autoComplete="new-password"
              />
              {confirmError ? (
                <p className="text-xs text-rose-600">{confirmError}</p>
              ) : null}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            {result ? "Close" : "Cancel"}
          </Button>
          {!result ? (
            <Button
              type="button"
              className="rounded-full bg-lime-600 hover:bg-lime-700 text-white"
              disabled={!canSubmit}
              onClick={handleReset}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting…
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
