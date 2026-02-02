import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function QuoteSubmittedDialog({
  open,
  onOpenChange,
  onDownload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="surface-glass max-w-md rounded-3xl border border-border/60 p-0 shadow-elev">
        <div className="p-8">
          <DialogHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/40 ring-1 ring-border/60">
              <CheckCircle2 className="h-9 w-9 text-primary" />
            </div>
            <DialogTitle className="mt-4 text-center text-2xl font-extrabold">System Alert</DialogTitle>
          </DialogHeader>

          <p className="mt-2 text-center text-sm text-muted-foreground">Your quote request has been submitted!</p>

          <div className="mt-6 rounded-2xl border border-border/60 bg-secondary/15 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold text-accent">Pending</span>
            </div>
            <div className="mt-3 text-xs text-destructive">
              You will be notified once the admin reviews it.
            </div>
          </div>

          <div className="mt-7">
            <Button variant="brand" size="pill" className="w-full" onClick={onDownload}>
              Download Quote
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
