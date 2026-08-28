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
import { useDeleteQuoteMutation } from "@/redux/services/apiSlices/quoteSlice";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId?: string;
  organizationName?: string;
  onDeleted?: () => void;
};

export default function DeleteQuoteConfirmDialog({
  open,
  onOpenChange,
  quoteId,
  organizationName,
  onDeleted,
}: Props) {
  const [deleteQuote, { isLoading }] = useDeleteQuoteMutation();
  const displayName = organizationName?.trim() || "this quote";

  const handleDelete = async () => {
    if (!quoteId || isLoading) return;
    try {
      const res: any = await deleteQuote(quoteId).unwrap();
      if (res?.status) {
        toast.success(res?.message ?? "Quote deleted successfully.");
        onOpenChange(false);
        onDeleted?.();
      } else {
        toast.error(res?.message ?? "Could not delete quote.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message ?? err?.message ?? "Could not delete quote.");
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
            Delete quote?
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            This will permanently delete the quote for{" "}
            <span className="font-semibold text-foreground">{displayName}</span>.
            This action cannot be undone.
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
            disabled={isLoading || !quoteId}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete quote"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
