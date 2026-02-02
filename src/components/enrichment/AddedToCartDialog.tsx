import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AddedToCartDialog({
  open,
  onOpenChange,
  productTitle,
  onContinue,
  onViewCart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTitle?: string;
  onContinue: () => void;
  onViewCart: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="surface-glass max-w-md rounded-3xl border border-border/60 p-0 shadow-elev">
        <div className="p-6 md:p-8">
          <DialogHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/40 ring-1 ring-border/60">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>
            <DialogTitle className="mt-4 text-center text-2xl font-extrabold">Item added to cart!</DialogTitle>
          </DialogHeader>

          <p className="mt-2 text-center text-sm text-muted-foreground">{productTitle}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" onClick={onContinue}>
              Continue Shopping
            </Button>
            <Button variant="brand" className="w-full" onClick={onViewCart}>
              View Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
