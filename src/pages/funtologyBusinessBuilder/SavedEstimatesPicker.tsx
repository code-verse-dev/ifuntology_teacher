import { Link } from "react-router-dom";
import { BookmarkCheck, FolderOpen, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetMySavedEstimatesQuery } from "@/redux/services/apiSlices/businessBuilderSlice";
import type { SavedEstimate } from "@/redux/services/apiSlices/businessBuilderSlice";
import { formatSavedEstimateDate } from "./savedEstimateUtils";
import { formatCurrency } from "./estimateData";

const CLEAR_VALUE = "__clear_selection__";

type Props = {
  selectedId?: string | null;
  onSelect: (estimate: SavedEstimate) => void;
  onClear: () => void;
};

export default function SavedEstimatesPicker({
  selectedId,
  onSelect,
  onClear,
}: Props) {
  const { data, isLoading, isFetching } = useGetMySavedEstimatesQuery({
    page: 1,
    limit: 50,
  });
  const docs: SavedEstimate[] = Array.isArray(data?.data?.docs)
    ? data.data.docs
    : [];
  const selected = docs.find((d) => d._id === selectedId) ?? null;
  const hasSelection = Boolean(selectedId);

  return (
    <Card className="rounded-2xl border border-border/60 p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Saved estimates
          </p>
          <p className="text-sm text-muted-foreground">
            Load a previously saved estimate to fill this form.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
          <Select
            value={selectedId || undefined}
            onValueChange={(id) => {
              if (id === CLEAR_VALUE) {
                onClear();
                return;
              }
              const match = docs.find((d) => d._id === id);
              if (match) onSelect(match);
            }}
            disabled={isLoading || docs.length === 0}
          >
            <SelectTrigger className="w-full min-w-[240px] lg:w-[320px]">
              <SelectValue
                placeholder={
                  isLoading || isFetching
                    ? "Loading saved estimates…"
                    : docs.length === 0
                      ? "No saved estimates yet"
                      : "Select a saved estimate"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {hasSelection ? (
                <>
                  <SelectItem value={CLEAR_VALUE}>Clear selection</SelectItem>
                  <SelectSeparator />
                </>
              ) : null}
              {docs.map((doc) => (
                <SelectItem key={doc._id} value={doc._id}>
                  {doc.name}
                  {doc.estimateGrandTotal
                    ? ` · ${formatCurrency(doc.estimateGrandTotal)}`
                    : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasSelection ? (
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={onClear}
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          ) : null}
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/funtology-business-builder/estimates">
              <FolderOpen className="h-4 w-4" />
              View all
            </Link>
          </Button>
        </div>
      </div>
      {selected ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
          {isFetching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
          )}
          <span className="font-semibold text-foreground">{selected.name}</span>
          <span>·</span>
          <span>Updated {formatSavedEstimateDate(selected.updatedAt)}</span>
          {selected.intro?.businessName ? (
            <>
              <span>·</span>
              <span>{selected.intro.businessName}</span>
            </>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
