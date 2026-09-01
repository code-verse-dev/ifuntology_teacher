import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  Eye,
  FolderOpen,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteSavedEstimateMutation,
  useGetMySavedEstimatesQuery,
  type SavedEstimate,
} from "@/redux/services/apiSlices/businessBuilderSlice";
import { formatCurrency } from "./estimateData";
import { formatSavedEstimateDate } from "./savedEstimateUtils";

export default function SavedEstimatesListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [queryOptions, setQueryOptions] = useState({
    page: 1,
    limit: 10,
    keyword: "",
  });
  const [toDelete, setToDelete] = useState<SavedEstimate | null>(null);
  const { data, error, isLoading } = useGetMySavedEstimatesQuery(queryOptions);
  const [deleteEstimate, { isLoading: isDeleting }] =
    useDeleteSavedEstimateMutation();

  const res = data?.data;
  const docs: SavedEstimate[] = Array.isArray(res?.docs) ? res.docs : [];
  const totalDocs =
    typeof res?.total === "number" ? res.total : (res?.totalDocs ?? 0);
  const totalPages = typeof res?.totalPages === "number" ? res.totalPages : 0;
  const page = typeof res?.page === "number" ? res.page : 1;
  const limit = typeof res?.limit === "number" ? res.limit : 10;

  useEffect(() => {
    document.title = "Saved Estimates • iFuntology Teacher";
  }, []);

  const handleDelete = async () => {
    if (!toDelete?._id || isDeleting) return;
    try {
      const res: any = await deleteEstimate(toDelete._id).unwrap();
      if (res?.status) {
        toast.success(res?.message ?? "Estimate deleted.");
        setToDelete(null);
      } else {
        toast.error(res?.message ?? "Could not delete estimate.");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message ?? err?.message ?? "Could not delete estimate."
      );
    }
  };

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-5xl space-y-6 pb-10">
        <div>
          <Link
            to="/funtology-business-builder"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Business Builder
          </Link>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <FolderOpen className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Saved estimates
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Your saved estimates
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Estimates you save from the salon calculator or student budget stay
            on your account, even after you log out.
          </p>
        </div>

        <Card className="rounded-2xl border border-border/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search by name or business…"
              value={searchInput}
              onChange={(e) => {
                const value = e.target.value;
                setSearchInput(value);
                setQueryOptions((prev) => ({
                  ...prev,
                  keyword: value.trim(),
                  page: 1,
                }));
              }}
              className="sm:max-w-sm"
            />
            <Button asChild variant="brand">
              <Link to="/funtology-business-builder/estimate">
                <Calculator className="h-4 w-4" />
                New estimate
              </Link>
            </Button>
          </div>
        </Card>

        {isLoading ? (
          <div className="rounded-xl border border-border/60 p-8 text-center text-muted-foreground">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
            Loading saved estimates…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-border/60 p-8 text-center text-destructive">
            Failed to load saved estimates. Please try again.
          </div>
        ) : docs.length === 0 ? (
          <div className="rounded-xl border border-border/60 p-8 text-center text-muted-foreground">
            No saved estimates yet. Save from step 2 or 3 of the calculator.
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map((estimate) => (
              <Card
                key={estimate._id}
                className="rounded-2xl border border-border/60 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-foreground">
                      {estimate.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {estimate.intro?.businessName
                        ? `${estimate.intro.businessName} · `
                        : ""}
                      Updated {formatSavedEstimateDate(estimate.updatedAt)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
                        Salon {formatCurrency(estimate.estimateGrandTotal ?? 0)}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
                        Budget left{" "}
                        {formatCurrency(estimate.budgetRemainingAnnual ?? 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        to={`/funtology-business-builder/estimates/${estimate._id}`}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="brand"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/funtology-business-builder/estimate?load=${estimate._id}`
                        )
                      }
                    >
                      <Calculator className="h-4 w-4" />
                      Use in form
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => setToDelete(estimate)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {totalDocs > 0
              ? `Showing ${(page - 1) * limit + 1}-${Math.min(
                  page * limit,
                  totalDocs
                )} of ${totalDocs}`
              : "No items to show"}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() =>
                setQueryOptions((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages || totalPages === 0}
              onClick={() =>
                setQueryOptions((prev) => ({
                  ...prev,
                  page: prev.page + 1,
                }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </section>

      <Dialog
        open={!!toDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setToDelete(null);
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-[460px]">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
              <Trash2 className="h-5 w-5 text-rose-600" />
              Delete estimate?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                {toDelete?.name ?? "this estimate"}
              </span>
              . This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isDeleting}
              onClick={() => setToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-rose-600 text-white hover:bg-rose-700"
              disabled={isDeleting || !toDelete}
              onClick={() => void handleDelete()}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardWithSidebarLayout>
  );
}
