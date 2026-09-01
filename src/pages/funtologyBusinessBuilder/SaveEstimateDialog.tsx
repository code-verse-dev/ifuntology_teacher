import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateSavedEstimateMutation,
  useUpdateSavedEstimateMutation,
  type SavedEstimate,
  type SavedEstimatePayload,
} from "@/redux/services/apiSlices/businessBuilderSlice";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  existing?: SavedEstimate | null;
  payload: Omit<SavedEstimatePayload, "name"> | null;
  onSaved?: (estimate: SavedEstimate, mode: "created" | "updated") => void;
};

export default function SaveEstimateDialog({
  open,
  onOpenChange,
  defaultName,
  existing,
  payload,
  onSaved,
}: Props) {
  const [name, setName] = useState(defaultName);
  const [createEstimate, { isLoading: isCreating }] =
    useCreateSavedEstimateMutation();
  const [updateEstimate, { isLoading: isUpdating }] =
    useUpdateSavedEstimateMutation();
  const busy = isCreating || isUpdating;
  const canUpdate = Boolean(existing?._id);

  useEffect(() => {
    if (open) {
      setName(existing?.name?.trim() || defaultName);
    }
  }, [open, defaultName, existing?.name]);

  const closeIfIdle = (next: boolean) => {
    if (busy && !next) return;
    onOpenChange(next);
  };

  const submit = async (mode: "create" | "update") => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a name for this estimate.");
      return;
    }
    if (!payload) {
      toast.error("Nothing to save yet.");
      return;
    }
    const body: SavedEstimatePayload = { ...payload, name: trimmed };
    try {
      const res: any =
        mode === "update" && existing?._id
          ? await updateEstimate({ id: existing._id, data: body }).unwrap()
          : await createEstimate(body).unwrap();
      if (!res?.status) {
        toast.error(res?.message ?? "Failed to save estimate.");
        return;
      }
      const saved = res?.data as SavedEstimate;
      toast.success(
        mode === "update" ? "Estimate updated." : "Estimate saved."
      );
      onOpenChange(false);
      onSaved?.(saved, mode === "update" ? "updated" : "created");
    } catch (err: any) {
      toast.error(
        err?.data?.message ?? err?.message ?? "Failed to save estimate."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={closeIfIdle}>
      <DialogContent className="rounded-2xl sm:max-w-[480px]">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-extrabold">
            Save estimate
          </DialogTitle>
          <DialogDescription>
            This estimate is stored on your account so it stays available after
            you log out.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="saved-estimate-name" className="text-xs">
            Estimate name
          </Label>
          <Input
            id="saved-estimate-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Downtown salon build-out"
            maxLength={120}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          {canUpdate ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void submit("create")}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Save as new
              </Button>
              <Button
                type="button"
                variant="brand"
                disabled={busy}
                onClick={() => void submit("update")}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Update saved
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="brand"
              disabled={busy}
              onClick={() => void submit("create")}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save estimate
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
