import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calculator, FileDown } from "lucide-react";
import { toast } from "sonner";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ADDITIONAL_ITEMS,
  CONSTRUCTION_ITEMS,
  EXPENSE_ITEMS,
  MAKEUP_SALON_DEFAULTS,
  RECEPTIONIST_DEFAULTS,
  UTILITY_ITEMS,
  WEEKS_PER_MONTH,
  calcMakeupSalonMonthly,
  calcReceptionistMonthly,
  emptyQtyMap,
  formatCurrency,
  parseAmount,
  parseQty,
  sumLineItems,
  sumSelectedMonthlyItems,
  type EstimateLineItem,
  type MonthlySelectableItem,
} from "./estimateData";
import { generateEstimatePdf } from "./generateEstimatePdf";
import ProfitBreakdownCharts from "./ProfitBreakdownCharts";

function QuantityTable({
  title,
  items,
  qtyById,
  onQtyChange,
  sectionTotal,
  totalLabel,
}: {
  title: string;
  items: EstimateLineItem[];
  qtyById: Record<string, string>;
  onQtyChange: (id: string, value: string) => void;
  sectionTotal: number;
  totalLabel: string;
}) {
  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 shadow-sm">
      <div className="border-b border-border/40 bg-muted/30 px-3 py-2.5">
        <h2 className="text-sm font-bold leading-snug text-foreground">{title}</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Qty × unit cost = line total
        </p>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-card text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
              <th className="px-2 py-2 sm:px-3">Item</th>
              <th className="w-16 px-1 py-2 text-center sm:w-20">Qty</th>
              <th className="w-[4.5rem] px-1 py-2 text-right sm:w-24">Unit</th>
              <th className="w-[4.75rem] px-2 py-2 text-right sm:w-28 sm:px-3">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const qty = parseQty(qtyById[item.id] ?? "");
              const lineTotal = qty * item.unitCost;
              return (
                <tr
                  key={item.id}
                  className="border-b border-border/40 last:border-0"
                >
                  <td className="px-2 py-1.5 font-medium leading-snug text-foreground sm:px-3">
                    {item.name}
                  </td>
                  <td className="px-1 py-1">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      className="h-8 px-1 text-center text-xs"
                      value={qtyById[item.id] ?? ""}
                      placeholder="0"
                      onChange={(e) => onQtyChange(item.id, e.target.value)}
                    />
                  </td>
                  <td className="px-1 py-1.5 text-right text-muted-foreground">
                    {formatCurrency(item.unitCost)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-semibold text-foreground sm:px-3">
                    {formatCurrency(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 bg-[#e8f2fc]/60 px-3 py-2.5 dark:bg-primary/10">
        <span className="text-xs font-semibold text-[#1a4d8c] dark:text-primary">
          {totalLabel}
        </span>
        <span className="shrink-0 text-sm font-bold text-[#1a4d8c] dark:text-primary">
          {formatCurrency(sectionTotal)}
        </span>
      </div>
    </Card>
  );
}

function CheckboxCostList({
  title,
  description,
  items,
  selectedIds,
  onToggle,
  sectionTotal,
  totalLabel,
}: {
  title: string;
  description: string;
  items: MonthlySelectableItem[];
  selectedIds: Set<string>;
  onToggle: (id: string, checked: boolean) => void;
  sectionTotal: number;
  totalLabel: string;
}) {
  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 shadow-sm">
      <div className="border-b border-border/40 bg-muted/30 px-3 py-2.5">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
      </div>

      <div className="flex-1 divide-y divide-border/40">
        {items.map((item) => {
          const checked = selectedIds.has(item.id);
          return (
            <label
              key={item.id}
              htmlFor={`${title}-${item.id}`}
              className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2.5 transition hover:bg-muted/20"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Checkbox
                  id={`${title}-${item.id}`}
                  checked={checked}
                  onCheckedChange={(value) => onToggle(item.id, value === true)}
                />
                <span className="text-xs font-medium leading-snug text-foreground sm:text-sm">
                  {item.name}
                </span>
              </div>
              <span className="shrink-0 text-xs font-semibold text-muted-foreground sm:text-sm">
                {formatCurrency(item.monthlyCost)}
                <span className="ml-0.5 text-[10px] font-normal">/mo</span>
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 bg-[#e8f2fc]/60 px-3 py-2.5 dark:bg-primary/10">
        <span className="text-xs font-semibold text-[#1a4d8c] dark:text-primary">
          {totalLabel}
        </span>
        <span className="shrink-0 text-sm font-bold text-[#1a4d8c] dark:text-primary">
          {formatCurrency(sectionTotal)}
        </span>
      </div>
    </Card>
  );
}

export default function EstimateCalculatorPage() {
  const [constructionQty, setConstructionQty] = useState(() =>
    emptyQtyMap(CONSTRUCTION_ITEMS)
  );
  const [additionalQty, setAdditionalQty] = useState(() =>
    emptyQtyMap(ADDITIONAL_ITEMS)
  );
  const [selectedUtilities, setSelectedUtilities] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(
    () => new Set()
  );
  const [makeupSalon, setMakeupSalon] = useState(MAKEUP_SALON_DEFAULTS);
  const [receptionist, setReceptionist] = useState(RECEPTIONIST_DEFAULTS);

  useEffect(() => {
    document.title = "Calculate Your Estimate • iFuntology Teacher";
  }, []);

  const constructionTotal = useMemo(
    () => sumLineItems(CONSTRUCTION_ITEMS, constructionQty),
    [constructionQty]
  );
  const additionalTotal = useMemo(
    () => sumLineItems(ADDITIONAL_ITEMS, additionalQty),
    [additionalQty]
  );
  const utilitiesTotal = useMemo(
    () => sumSelectedMonthlyItems(UTILITY_ITEMS, selectedUtilities),
    [selectedUtilities]
  );
  const expensesTotal = useMemo(
    () => sumSelectedMonthlyItems(EXPENSE_ITEMS, selectedExpenses),
    [selectedExpenses]
  );
  const makeupSalonMonthly = useMemo(
    () => calcMakeupSalonMonthly(makeupSalon),
    [makeupSalon]
  );
  const receptionistMonthly = useMemo(
    () => calcReceptionistMonthly(receptionist),
    [receptionist]
  );
  const receptionistWeeklyGross =
    parseAmount(receptionist.payRate) * parseAmount(receptionist.hoursPerWeek);
  const makeupSalonWeekly =
    parseQty(makeupSalon.stations) * parseAmount(makeupSalon.boothRentalRate);

  const grandTotal =
    constructionTotal +
    additionalTotal +
    utilitiesTotal +
    expensesTotal +
    makeupSalonMonthly +
    receptionistMonthly;

  const toggleInSet = (
    setter: Dispatch<SetStateAction<Set<string>>>,
    id: string,
    checked: boolean
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleGeneratePdf = () => {
    if (grandTotal <= 0) {
      toast.error("Add at least one cost before generating a PDF.");
      return;
    }
    try {
      generateEstimatePdf({
        constructionQty,
        additionalQty,
        selectedUtilityIds: Array.from(selectedUtilities),
        selectedExpenseIds: Array.from(selectedExpenses),
        makeupSalon: {
          ...makeupSalon,
          weeklyTotal: makeupSalonWeekly,
          monthlyTotal: makeupSalonMonthly,
        },
        receptionist: {
          ...receptionist,
          weeklyGross: receptionistWeeklyGross,
          monthlyTotal: receptionistMonthly,
        },
        constructionTotal,
        additionalTotal,
        utilitiesTotal,
        expensesTotal,
        makeupSalonTotal: makeupSalonMonthly,
        receptionistTotal: receptionistMonthly,
        grandTotal,
      });
      toast.success("PDF estimate downloaded.");
    } catch {
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-7xl space-y-5 pb-10">
        <div>
          <Link
            to="/funtology-business-builder"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Business Builder
          </Link>

          <div className="mb-2 flex items-center gap-2 text-primary">
            <Calculator className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Estimate
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Calculate Your Estimate
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Enter quantities, staff costs, and select utilities and expenses.
            Final total includes construction, additional materials, utilities,
            expenses, make up salon, and receptionist costs.
          </p>
        </div>

        <ProfitBreakdownCharts />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
          <QuantityTable
            title="Estimated Construction Material Cost"
            items={CONSTRUCTION_ITEMS}
            qtyById={constructionQty}
            onQtyChange={(id, value) =>
              setConstructionQty((prev) => ({ ...prev, [id]: value }))
            }
            sectionTotal={constructionTotal}
            totalLabel="Construction Total"
          />
          <QuantityTable
            title="Additional Material & Equipment"
            items={ADDITIONAL_ITEMS}
            qtyById={additionalQty}
            onQtyChange={(id, value) =>
              setAdditionalQty((prev) => ({ ...prev, [id]: value }))
            }
            sectionTotal={additionalTotal}
            totalLabel="Additional Total"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
          <CheckboxCostList
            title="Utilities"
            description="Select utilities to include monthly cost."
            items={UTILITY_ITEMS}
            selectedIds={selectedUtilities}
            onToggle={(id, checked) =>
              toggleInSet(setSelectedUtilities, id, checked)
            }
            sectionTotal={utilitiesTotal}
            totalLabel="Utilities Total / mo"
          />
          <CheckboxCostList
            title="Expenses (Monthly)"
            description="Select expenses to include monthly cost."
            items={EXPENSE_ITEMS}
            selectedIds={selectedExpenses}
            onToggle={(id, checked) =>
              toggleInSet(setSelectedExpenses, id, checked)
            }
            sectionTotal={expensesTotal}
            totalLabel="Expenses Total / mo"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
          <Card className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <div className="border-b border-border/40 bg-emerald-50/80 px-3 py-2.5 dark:bg-emerald-950/30">
              <h2 className="text-sm font-bold text-foreground">
                Make Up Salon Cost
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Stations × booth rental × {WEEKS_PER_MONTH} weeks = monthly
              </p>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-3 p-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Number of Staff</Label>
                <Input
                  type="number"
                  min={0}
                  className="h-9"
                  value={makeupSalon.staff}
                  placeholder="0"
                  onChange={(e) =>
                    setMakeupSalon((prev) => ({
                      ...prev,
                      staff: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Number of Stations</Label>
                <Input
                  type="number"
                  min={0}
                  className="h-9"
                  value={makeupSalon.stations}
                  placeholder="0"
                  onChange={(e) =>
                    setMakeupSalon((prev) => ({
                      ...prev,
                      stations: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Booth Rental Rate</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className="h-9"
                  value={makeupSalon.boothRentalRate}
                  onChange={(e) =>
                    setMakeupSalon((prev) => ({
                      ...prev,
                      boothRentalRate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1 border-t border-border/50 bg-emerald-50/50 px-3 py-2.5 dark:bg-emerald-950/20">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Weekly booth rental</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(makeupSalonWeekly)}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span>Monthly total</span>
                <span>{formatCurrency(makeupSalonMonthly)}</span>
              </div>
            </div>
          </Card>

          <Card className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <div className="border-b border-border/40 bg-sky-50/80 px-3 py-2.5 dark:bg-sky-950/30">
              <h2 className="text-sm font-bold text-foreground">Receptionist</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Pay rate × hours/week × {WEEKS_PER_MONTH} weeks = monthly gross
              </p>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-3 p-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Pay Rate ($/hr)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className="h-9"
                  value={receptionist.payRate}
                  onChange={(e) =>
                    setReceptionist((prev) => ({
                      ...prev,
                      payRate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Hours per Week</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.5"
                  className="h-9"
                  value={receptionist.hoursPerWeek}
                  placeholder="0"
                  onChange={(e) =>
                    setReceptionist((prev) => ({
                      ...prev,
                      hoursPerWeek: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1 border-t border-border/50 bg-sky-50/50 px-3 py-2.5 dark:bg-sky-950/20">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Weekly gross pay</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(receptionistWeeklyGross)}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-sky-700 dark:text-sky-400">
                <span>Monthly total</span>
                <span>{formatCurrency(receptionistMonthly)}</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3 text-muted-foreground">
              <span>Construction Total</span>
              <span className="font-medium text-foreground">
                {formatCurrency(constructionTotal)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-muted-foreground">
              <span>Additional Total</span>
              <span className="font-medium text-foreground">
                {formatCurrency(additionalTotal)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-muted-foreground">
              <span>Utilities Total</span>
              <span className="font-medium text-foreground">
                {formatCurrency(utilitiesTotal)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-muted-foreground">
              <span>Expenses Total</span>
              <span className="font-medium text-foreground">
                {formatCurrency(expensesTotal)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-muted-foreground">
              <span>Make Up Salon (Monthly)</span>
              <span className="font-medium text-foreground">
                {formatCurrency(makeupSalonMonthly)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-muted-foreground">
              <span>Receptionist (Monthly)</span>
              <span className="font-medium text-foreground">
                {formatCurrency(receptionistMonthly)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Label className="text-base font-bold text-foreground">
                Final Total Estimate
              </Label>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(grandTotal)}
              </p>
            </div>
            <Button
              type="button"
              variant="brand"
              className="w-full sm:w-auto"
              onClick={handleGeneratePdf}
            >
              <FileDown className="h-4 w-4" />
              Generate PDF Estimate
            </Button>
          </div>
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
