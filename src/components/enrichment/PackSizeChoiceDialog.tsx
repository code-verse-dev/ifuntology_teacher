import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PACK_SIZE_12, PACK_SIZE_15, type PackSize } from "@/utils/packQuantity";

export default function PackSizeChoiceDialog({
  open,
  onOpenChange,
  productTitle,
  onSelect,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTitle?: string;
  onSelect: (size: PackSize) => void;
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="surface-glass max-w-md rounded-3xl border border-border/60 p-0 shadow-elev">
        <div className="p-6 md:p-8">
          <DialogHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/40 ring-1 ring-border/60">
              <Package className="h-9 w-9 text-emerald-600" />
            </div>
            <DialogTitle className="mt-4 text-center text-2xl font-extrabold">
              Choose a pack size
            </DialogTitle>
          </DialogHeader>

          {productTitle ? (
            <p className="mt-2 text-center text-sm font-medium">{productTitle}</p>
          ) : null}

          <p className="mt-2 text-center text-sm text-muted-foreground">
            This product cannot be added as a single unit. You can add multiples
            of 12 or 15 (for example 12, 24, 36 or 15, 30, 45).
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 w-full text-base font-semibold"
              disabled={loading}
              onClick={() => onSelect(PACK_SIZE_12)}
            >
              Add {PACK_SIZE_12}
            </Button>
            <Button
              variant="brand"
              className="h-12 w-full text-base font-semibold"
              disabled={loading}
              onClick={() => onSelect(PACK_SIZE_15)}
            >
              Add {PACK_SIZE_15}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
