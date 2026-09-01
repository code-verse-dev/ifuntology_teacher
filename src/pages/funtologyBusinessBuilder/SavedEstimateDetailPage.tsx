import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  Loader2,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteSavedEstimateMutation,
  useGetSavedEstimateByIdQuery,
} from "@/redux/services/apiSlices/businessBuilderSlice";
import {
  ESTIMATE_CATEGORIES,
  formatCurrency,
  parseQty,
  sumLineItems,
} from "./estimateData";
import {
  BILL_FIELDS,
  CLOTHING_OPTIONS,
  MARITAL_OPTIONS,
  PET_ITEMS,
  SUBSCRIPTION_ITEMS,
  VACATION_ITEMS,
  computeStudentBudget,
} from "./studentBudgetData";
import { getBusinessTypeLabel } from "./introFormData";
import {
  budgetFromEstimate,
  formatSavedEstimateDate,
} from "./savedEstimateUtils";

export default function SavedEstimateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetSavedEstimateByIdQuery(id!, {
    skip: !id,
  });
  const estimate = data?.data;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEstimate, { isLoading: isDeleting }] =
    useDeleteSavedEstimateMutation();

  useEffect(() => {
    document.title = estimate?.name
      ? `${estimate.name} • Saved Estimate`
      : "Saved Estimate • iFuntology Teacher";
  }, [estimate?.name]);

  const itemQty: Record<string, string> = estimate?.itemQty ?? {};
  const budget = useMemo(
    () => budgetFromEstimate(estimate),
    [estimate]
  );
  const budgetResult = useMemo(
    () => computeStudentBudget(budget),
    [budget]
  );

  const materialsTotal = useMemo(
    () =>
      sumLineItems(
        ESTIMATE_CATEGORIES.filter((c) => c.group === "build").flatMap(
          (c) => c.items
        ),
        itemQty
      ),
    [itemQty]
  );
  const furnitureTotal = useMemo(
    () =>
      sumLineItems(
        ESTIMATE_CATEGORIES.filter((c) => c.group === "ops").flatMap(
          (c) => c.items
        ),
        itemQty
      ),
    [itemQty]
  );
  const grandTotal = materialsTotal + furnitureTotal;
  const categoriesWithQty = ESTIMATE_CATEGORIES.filter(
    (c) => sumLineItems(c.items, itemQty) > 0
  );

  const handleDelete = async () => {
    if (!id || isDeleting) return;
    try {
      const res: any = await deleteEstimate(id).unwrap();
      if (res?.status) {
        toast.success(res?.message ?? "Estimate deleted.");
        navigate("/funtology-business-builder/estimates");
      } else {
        toast.error(res?.message ?? "Could not delete estimate.");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message ?? err?.message ?? "Could not delete estimate."
      );
    }
  };

  if (!id) {
    return (
      <DashboardWithSidebarLayout>
        <section className="mx-auto w-full max-w-5xl space-y-4">
          <p className="text-muted-foreground">Invalid estimate.</p>
          <Button asChild variant="outline">
            <Link to="/funtology-business-builder/estimates">Back to list</Link>
          </Button>
        </section>
      </DashboardWithSidebarLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardWithSidebarLayout>
        <section className="mx-auto w-full max-w-5xl p-8 text-center text-muted-foreground">
          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
          Loading estimate…
        </section>
      </DashboardWithSidebarLayout>
    );
  }

  if (error || !estimate) {
    return (
      <DashboardWithSidebarLayout>
        <section className="mx-auto w-full max-w-5xl space-y-4">
          <p className="text-destructive">Failed to load this estimate.</p>
          <Button asChild variant="outline">
            <Link to="/funtology-business-builder/estimates">Back to list</Link>
          </Button>
        </section>
      </DashboardWithSidebarLayout>
    );
  }

  const intro = estimate.intro ?? {};

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-5xl space-y-6 pb-10">
        <div>
          <Link
            to="/funtology-business-builder/estimates"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to saved estimates
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {estimate.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Saved {formatSavedEstimateDate(estimate.createdAt)}
                {estimate.updatedAt && estimate.updatedAt !== estimate.createdAt
                  ? ` · Updated ${formatSavedEstimateDate(estimate.updatedAt)}`
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="brand"
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
                className="text-rose-600 hover:text-rose-700"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <Card className="rounded-2xl border border-border/60 p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Business profile
          </h2>
          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailRow label="Business name" value={intro.businessName} />
            <DetailRow label="Owner name" value={intro.name} />
            <DetailRow
              label="Business type"
              value={
                intro.businessType
                  ? getBusinessTypeLabel(intro.businessType)
                  : undefined
              }
            />
            <DetailRow label="Date" value={intro.date} />
            <DetailRow
              label="Budget"
              value={
                intro.budgetAmount
                  ? formatCurrency(Number(intro.budgetAmount) || 0)
                  : undefined
              }
            />
            <DetailRow
              label="Square footage"
              value={intro.squareFootage ? `${intro.squareFootage} sq ft` : undefined}
            />
          </dl>
        </Card>

        <Card className="rounded-2xl border border-border/60 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Salon estimate
            </h2>
          </div>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryStat label="Grand total" value={formatCurrency(grandTotal)} />
            <SummaryStat
              label="Build & setup"
              value={formatCurrency(materialsTotal)}
            />
            <SummaryStat
              label="Furniture & ops"
              value={formatCurrency(furnitureTotal)}
            />
          </div>
          {categoriesWithQty.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No salon line items were saved on this estimate.
            </p>
          ) : (
            <div className="space-y-4">
              {categoriesWithQty.map((category) => (
                <div key={category.id}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{category.title}</p>
                    <p className="text-sm font-bold">
                      {formatCurrency(sumLineItems(category.items, itemQty))}
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-border/50">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                          <th className="px-3 py-2">Item</th>
                          <th className="px-3 py-2 text-right">Qty</th>
                          <th className="px-3 py-2 text-right">Unit</th>
                          <th className="px-3 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items
                          .filter((item) => parseQty(itemQty[item.id] ?? "") > 0)
                          .map((item) => {
                            const qty = parseQty(itemQty[item.id] ?? "");
                            return (
                              <tr
                                key={item.id}
                                className="border-t border-border/40"
                              >
                                <td className="px-3 py-2">{item.name}</td>
                                <td className="px-3 py-2 text-right">{qty}</td>
                                <td className="px-3 py-2 text-right">
                                  {formatCurrency(item.unitCost)}
                                </td>
                                <td className="px-3 py-2 text-right font-medium">
                                  {formatCurrency(qty * item.unitCost)}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-2xl border border-border/60 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Student budget
            </h2>
          </div>
          {!budget.annualSalary ? (
            <p className="text-sm text-muted-foreground">
              No student budget was saved on this estimate.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SummaryStat
                  label="Annual salary"
                  value={formatCurrency(budgetResult.totalAnnualIncome)}
                />
                <SummaryStat
                  label="Left for the year"
                  value={formatCurrency(budgetResult.remainingAnnualTotal)}
                />
                <SummaryStat
                  label="Per month"
                  value={formatCurrency(budgetResult.remainingMonthlyAverage)}
                />
              </div>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow
                  label="Marital status"
                  value={
                    MARITAL_OPTIONS.find((o) => o.value === budget.maritalStatus)
                      ?.label
                  }
                />
                <DetailRow label="Children" value={budget.children} />
                <DetailRow
                  label="Savings rate"
                  value={budget.savingsRate ? `${budget.savingsRate}%` : undefined}
                />
                <DetailRow
                  label="Clothing"
                  value={
                    CLOTHING_OPTIONS.find((o) => o.value === budget.clothing)
                      ?.label
                  }
                />
                <DetailRow
                  label="Dining out / month"
                  value={
                    budget.diningOut
                      ? formatCurrency(Number(budget.diningOut) || 0)
                      : undefined
                  }
                />
                <DetailRow
                  label="Childcare children"
                  value={budget.childcareChildren}
                />
              </dl>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {BILL_FIELDS.map((field) => {
                  const selected = budget.billSelections?.[field.id];
                  const option = field.options.find((o) => o.value === selected);
                  return (
                    <DetailRow
                      key={field.id}
                      label={field.name}
                      value={option?.label}
                    />
                  );
                })}
              </div>
              <DetailRow
                label="Subscriptions"
                value={
                  SUBSCRIPTION_ITEMS.filter((item) =>
                    budget.selectedSubscriptions?.includes(item.id)
                  )
                    .map((item) => item.name)
                    .join(", ") || undefined
                }
              />
              <DetailRow
                label="Pets"
                value={
                  PET_ITEMS.filter((item) =>
                    budget.selectedPets?.includes(item.id)
                  )
                    .map((item) => item.name)
                    .join(", ") || undefined
                }
              />
              <DetailRow
                label="Vacations"
                value={
                  VACATION_ITEMS.filter((item) =>
                    budget.selectedVacations?.includes(item.id)
                  )
                    .map((item) => {
                      const trips = budget.vacationTrips?.[item.id] || "0";
                      return `${item.name} (${trips})`;
                    })
                    .join(", ") || undefined
                }
              />
            </div>
          )}
        </Card>
      </section>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteOpen(false);
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
                {estimate.name}
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
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-rose-600 text-white hover:bg-rose-700"
              disabled={isDeleting}
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

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="space-y-0.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/30 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-extrabold text-foreground">{value}</p>
    </div>
  );
}
