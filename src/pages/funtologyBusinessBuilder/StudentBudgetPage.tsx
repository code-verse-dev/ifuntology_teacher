import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileDown, Wallet } from "lucide-react";
import { toast } from "sonner";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BILL_FIELDS,
  CLOTHING_OPTIONS,
  DEFAULT_SAVINGS_RATE,
  MARITAL_OPTIONS,
  PET_ITEMS,
  SUBSCRIPTION_ITEMS,
  VACATION_ITEMS,
  computeStudentBudget,
  formatCurrency,
  optionCost,
  parseQty,
} from "./studentBudgetData";
import { generateStudentBudgetPdf } from "./generateStudentBudgetPdf";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card className="rounded-2xl border border-border/60 p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-lg font-extrabold ${accent}`}>{value}</p>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "negative" | "positive";
}) {
  const toneClass =
    tone === "negative"
      ? "text-rose-600 dark:text-rose-400"
      : tone === "positive"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-foreground";
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}

type StudentBudgetPageProps = {
  /** When true, render step content only (no page chrome). */
  embedded?: boolean;
};

export default function StudentBudgetPage({
  embedded = false,
}: StudentBudgetPageProps) {
  const [annualSalary, setAnnualSalary] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("single");
  const [children, setChildren] = useState("0");
  const [savingsRate, setSavingsRate] = useState(DEFAULT_SAVINGS_RATE);

  const [billSelections, setBillSelections] = useState<Record<string, string>>(
    {}
  );
  const [childcareChildren, setChildcareChildren] = useState("0");

  const [clothing, setClothing] = useState("none");
  const [diningOut, setDiningOut] = useState("");
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<
    Set<string>
  >(() => new Set());
  const [selectedPets, setSelectedPets] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedVacations, setSelectedVacations] = useState<Set<string>>(
    () => new Set()
  );
  const [vacationTrips, setVacationTrips] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    if (!embedded) {
      document.title = "Calculate Student Budget • iFuntology Teacher";
    }
  }, [embedded]);

  const input = useMemo(
    () => ({
      annualSalary,
      maritalStatus,
      children,
      savingsRate,
      billSelections,
      childcareChildren,
      clothing,
      diningOut,
      selectedSubscriptions: Array.from(selectedSubscriptions),
      selectedPets: Array.from(selectedPets),
      selectedVacations: Array.from(selectedVacations),
      vacationTrips,
    }),
    [
      annualSalary,
      maritalStatus,
      children,
      savingsRate,
      billSelections,
      childcareChildren,
      clothing,
      diningOut,
      selectedSubscriptions,
      selectedPets,
      selectedVacations,
      vacationTrips,
    ]
  );

  const r = useMemo(() => computeStudentBudget(input), [input]);

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

  const handleGeneratePdf = async () => {
    if (r.totalAnnualIncome <= 0) {
      toast.error("Enter an annual salary before generating a PDF.");
      return;
    }
    try {
      await generateStudentBudgetPdf(input);
      toast.success("Student budget PDF downloaded.");
    } catch {
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const content = (
      <>
        <div>
          {!embedded && (
            <Link
              to="/funtology-business-builder"
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Business Builder
            </Link>
          )}

          <div className="mb-2 flex items-center gap-2 text-primary">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              {embedded ? "Step 3 · Student Budget" : "Student Budget"}
            </span>
          </div>
          {embedded ? (
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Calculate Student Budget
            </h2>
          ) : (
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Calculate Student Budget
            </h1>
          )}
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Enter income and household details, choose bills, and select
            expenses. Totals, taxes, savings, and what's left for the year
            update automatically.
          </p>
        </div>

        {/* Top stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Left for the Year"
            value={formatCurrency(r.remainingAnnualTotal)}
            accent="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label="Per Month"
            value={formatCurrency(r.remainingMonthlyAverage)}
            accent="text-foreground"
          />
          <StatCard
            label="Budget Spent"
            value={formatCurrency(r.budgetSpent)}
            accent="text-sky-600 dark:text-sky-400"
          />
          <StatCard
            label="Annual Savings"
            value={formatCurrency(r.savingsAnnual)}
            accent="text-primary"
          />
        </div>

        {/* Income & Household */}
        <Card className="overflow-hidden rounded-2xl border border-border/60 shadow-sm">
          <div className="border-b border-border/40 bg-muted/30 px-4 py-3">
            <h2 className="text-sm font-bold text-foreground">
              Income & Household
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Tax deductions are estimated at 15% of annual income.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-xs">Annual Salary ($)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="h-9"
                placeholder="0"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Marital Status</Label>
              <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {MARITAL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Children</Label>
              <Input
                type="number"
                min={0}
                className="h-9"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Family Size</Label>
              <Input
                readOnly
                className="h-9 bg-muted/50"
                value={String(r.familySize)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Savings Rate (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                className="h-9"
                value={savingsRate}
                onChange={(e) => setSavingsRate(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Bills + Expenses */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
          {/* Bills */}
          <Card className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <div className="border-b border-border/40 bg-emerald-600 px-4 py-3">
              <h2 className="text-sm font-bold text-white">Bills</h2>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-card text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                    <th className="px-3 py-2">Bill Type</th>
                    <th className="px-2 py-2">Selection</th>
                    <th className="w-24 px-2 py-2 text-right">Monthly</th>
                    <th className="w-24 px-3 py-2 text-right">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {BILL_FIELDS.map((field) => {
                    const value = billSelections[field.id] ?? "";
                    const monthly = optionCost(field.options, value);
                    return (
                      <tr
                        key={field.id}
                        className="border-b border-border/40 last:border-0"
                      >
                        <td className="px-3 py-2 font-medium leading-snug text-foreground">
                          {field.name}
                        </td>
                        <td className="px-2 py-2">
                          <Select
                            value={value}
                            onValueChange={(next) =>
                              setBillSelections((prev) => ({
                                ...prev,
                                [field.id]: next,
                              }))
                            }
                          >
                            <SelectTrigger className="h-8 min-w-[130px] text-xs">
                              <SelectValue placeholder={field.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-2 py-2 text-right text-muted-foreground">
                          {formatCurrency(monthly)}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-foreground">
                          {formatCurrency(monthly * 12)}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Childcare */}
                  <tr className="border-b border-border/40 last:border-0">
                    <td className="px-3 py-2 font-medium leading-snug text-foreground">
                      Childcare
                      <span className="block text-[10px] font-normal text-muted-foreground">
                        Number of children
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        type="number"
                        min={0}
                        className="h-8 w-20 text-center text-xs"
                        value={childcareChildren}
                        onChange={(e) => setChildcareChildren(e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2 text-right text-muted-foreground">
                      {formatCurrency(r.childcareMonthly)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-foreground">
                      {formatCurrency(r.childcareMonthly * 12)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 bg-[#e8f2fc]/60 px-4 py-2.5 dark:bg-primary/10">
              <span className="text-xs font-semibold text-[#1a4d8c] dark:text-primary">
                Total Bills
              </span>
              <span className="text-sm font-bold text-[#1a4d8c] dark:text-primary">
                {formatCurrency(r.billsMonthly)} / mo ·{" "}
                {formatCurrency(r.billsAnnual)} / yr
              </span>
            </div>
          </Card>

          {/* Expenses */}
          <Card className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <div className="border-b border-border/40 bg-sky-600 px-4 py-3">
              <h2 className="text-sm font-bold text-white">Expenses</h2>
            </div>
            <div className="flex-1 space-y-4 p-4">
              {/* Clothing + Dining */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Clothing</Label>
                  <Select value={clothing} onValueChange={setClothing}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Choose your store" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLOTHING_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Dining Out ($/mo)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="h-9"
                    placeholder="0"
                    value={diningOut}
                    onChange={(e) => setDiningOut(e.target.value)}
                  />
                </div>
              </div>

              {/* Subscriptions */}
              <div>
                <p className="mb-2 text-xs font-bold text-foreground">
                  Subscriptions
                </p>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {SUBSCRIPTION_ITEMS.map((item) => {
                    const checked = selectedSubscriptions.has(item.id);
                    return (
                      <label
                        key={item.id}
                        htmlFor={`sub-${item.id}`}
                        className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted/20"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Checkbox
                            id={`sub-${item.id}`}
                            checked={checked}
                            onCheckedChange={(v) =>
                              toggleInSet(
                                setSelectedSubscriptions,
                                item.id,
                                v === true
                              )
                            }
                          />
                          <span className="text-xs font-medium text-foreground">
                            {item.name}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatCurrency(item.monthlyCost)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Pets */}
              <div>
                <p className="mb-2 text-xs font-bold text-foreground">Pet</p>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
                  {PET_ITEMS.map((item) => {
                    const checked = selectedPets.has(item.id);
                    return (
                      <label
                        key={item.id}
                        htmlFor={`pet-${item.id}`}
                        className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted/20"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Checkbox
                            id={`pet-${item.id}`}
                            checked={checked}
                            onCheckedChange={(v) =>
                              toggleInSet(setSelectedPets, item.id, v === true)
                            }
                          />
                          <span className="text-xs font-medium text-foreground">
                            {item.name}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatCurrency(item.monthlyCost)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Vacations */}
              <div>
                <p className="mb-2 text-xs font-bold text-foreground">
                  Vacations{" "}
                  <span className="font-normal text-muted-foreground">
                    (cost per year)
                  </span>
                </p>
                <div className="space-y-1">
                  {VACATION_ITEMS.map((item) => {
                    const checked = selectedVacations.has(item.id);
                    const trips = vacationTrips[item.id] ?? "";
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted/20"
                      >
                        <label
                          htmlFor={`vac-${item.id}`}
                          className="flex min-w-0 cursor-pointer items-center gap-2"
                        >
                          <Checkbox
                            id={`vac-${item.id}`}
                            checked={checked}
                            onCheckedChange={(v) =>
                              toggleInSet(
                                setSelectedVacations,
                                item.id,
                                v === true
                              )
                            }
                          />
                          <span className="text-xs font-medium text-foreground">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatCurrency(item.perTripCost)}/trip
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            className="h-8 w-16 text-center text-xs"
                            placeholder="Trips"
                            disabled={!checked}
                            value={trips}
                            onChange={(e) =>
                              setVacationTrips((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                          />
                          <span className="w-20 shrink-0 text-right text-xs font-semibold text-foreground">
                            {formatCurrency(
                              (checked ? parseQty(trips) : 0) * item.perTripCost
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 bg-[#e8f2fc]/60 px-4 py-2.5 dark:bg-primary/10">
              <span className="text-xs font-semibold text-[#1a4d8c] dark:text-primary">
                Total Expenses
              </span>
              <span className="text-sm font-bold text-[#1a4d8c] dark:text-primary">
                {formatCurrency(r.expensesMonthlyAvg)} / mo ·{" "}
                {formatCurrency(r.expensesAnnual)} / yr
              </span>
            </div>
          </Card>
        </div>

        {/* Savings & Taxes + Annual Net Pay */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
          <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <div className="border-b border-border/40 bg-muted/30 px-4 py-3">
              <h2 className="text-sm font-bold text-foreground">
                Savings & Taxes
              </h2>
            </div>
            <div className="flex-1 space-y-2.5 p-4">
              <SummaryRow
                label="Total Annual Income"
                value={formatCurrency(r.totalAnnualIncome)}
              />
              <SummaryRow
                label="Average Monthly Income"
                value={formatCurrency(r.averageMonthlyIncome)}
              />
              <SummaryRow
                label="Tax Deductions"
                value={`- ${formatCurrency(r.taxDeductions)}`}
                tone="negative"
              />
              <SummaryRow
                label="Remaining Income"
                value={formatCurrency(r.remainingIncome)}
              />
              <SummaryRow
                label="Total in Savings Account"
                value={formatCurrency(r.savingsAnnual)}
                tone="positive"
              />
              <SummaryRow
                label="Total Income After Savings"
                value={formatCurrency(r.totalIncomeAfterSavings)}
              />
            </div>
          </Card>

          <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <div className="border-b border-border/40 bg-muted/30 px-4 py-3">
              <h2 className="text-sm font-bold text-foreground">
                Annual Net Pay
              </h2>
            </div>
            <div className="flex-1 space-y-2.5 p-4">
              <SummaryRow
                label="Total Annual Takehome"
                value={formatCurrency(r.totalAnnualTakehome)}
              />
              <SummaryRow
                label="Bills"
                value={`- ${formatCurrency(r.billsAnnual)}`}
                tone="negative"
              />
              <SummaryRow
                label="Expenses"
                value={`- ${formatCurrency(r.expensesAnnual)}`}
                tone="negative"
              />
              <SummaryRow
                label="Remaining Annual Total"
                value={formatCurrency(r.remainingAnnualTotal)}
              />
              <SummaryRow
                label="Monthly Average"
                value={formatCurrency(r.remainingMonthlyAverage)}
              />
              <SummaryRow
                label="Remaining Total with Savings"
                value={formatCurrency(r.remainingTotalWithSavings)}
                tone="positive"
              />
            </div>
          </Card>
        </div>

        {/* Financial Snapshot */}
        <Card className="overflow-hidden rounded-2xl border border-border/60 shadow-sm">
          <div className="border-b border-border/40 bg-muted/30 px-4 py-3">
            <h2 className="text-sm font-bold text-foreground">
              Financial Snapshot (Annual)
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-2.5 p-4 sm:grid-cols-2">
            <SummaryRow
              label="Total Income After Savings"
              value={formatCurrency(r.totalIncomeAfterSavings)}
            />
            <SummaryRow
              label="Total in Savings Account"
              value={formatCurrency(r.savingsAnnual)}
            />
            <SummaryRow label="Bills" value={formatCurrency(r.billsAnnual)} />
            <SummaryRow
              label="Expenses"
              value={formatCurrency(r.expensesAnnual)}
            />
            <SummaryRow
              label="Remaining Total with Savings"
              value={formatCurrency(r.remainingTotalWithSavings)}
            />
            <SummaryRow
              label="Personal Checking"
              value={formatCurrency(r.personalChecking)}
            />
            <SummaryRow
              label="Business Checking"
              value={formatCurrency(r.businessChecking)}
            />
          </div>
        </Card>

        {/* Final total + PDF */}
        <Card className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Label className="text-base font-bold text-foreground">
                Left for the Year
              </Label>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(r.remainingAnnualTotal)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(r.remainingMonthlyAverage)} per month
              </p>
            </div>
            <Button
              type="button"
              variant="brand"
              className="w-full sm:w-auto"
              onClick={handleGeneratePdf}
            >
              <FileDown className="h-4 w-4" />
              Generate PDF Budget
            </Button>
          </div>
        </Card>
      </>
  );

  if (embedded) {
    return <div className="space-y-5">{content}</div>;
  }

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full max-w-7xl space-y-5 pb-10">
        {content}
      </section>
    </DashboardWithSidebarLayout>
  );
}
