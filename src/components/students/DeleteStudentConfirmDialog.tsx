import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteStudentMutation } from "@/redux/services/apiSlices/invitationSlice";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId?: string;
  studentName?: string;
};

export default function DeleteStudentConfirmDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
}: Props) {
  const [deleteStudent, { isLoading }] = useDeleteStudentMutation();
  const displayName = studentName?.trim() || "this student";

  const handleDelete = async () => {
    if (!studentId || isLoading) return;
    try {
      const res: any = await deleteStudent({ studentId }).unwrap();
      if (res?.status) {
        toast.success(res?.message ?? "Student deleted successfully.");
        onOpenChange(false);
      } else {
        toast.error(res?.message ?? "Could not delete student.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message ?? err?.message ?? "Could not delete student.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isLoading && !nextOpen) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="rounded-[2rem] border-none bg-white p-8 shadow-2xl dark:bg-slate-900 sm:max-w-[460px]">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Trash2 className="h-5 w-5 text-rose-600" />
            Delete student?
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            All data regarding{" "}
            <span className="font-semibold text-foreground">{displayName}</span>{" "}
            will be permanently deleted. Are you sure you want to delete this student?
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-full font-bold"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-full bg-rose-600 font-bold text-white hover:bg-rose-700"
            onClick={() => void handleDelete()}
            disabled={isLoading || !studentId}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete student"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
