import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  CalendarDays,
  DollarSign,
  FileDown,
  HardHat,
  LayoutGrid,
  Package,
  PieChart,
  Save,
  ShoppingCart,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
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

const STORAGE_KEY = "funtology-estimate-v1";

function Sparkline({
  color,
  points,
}: {
  color: string;
  points: number[];
}) {
  const width = 120;
  const height = 30;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const path = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)},${(
          height -
          ((p - min) / range) * height
        ).toFixed(1)}`,
    )
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-8 w-full"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KpiCard({
  label,
  sublabel,
  value,
  helper,
  icon: Icon,
  gradient,
  sparkline,
}: {
  label: string;
  sublabel: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  gradient: string;
  sparkline?: number[];
}) {
  return (
    <Card
      className={`relative overflow-hidden rounded-2xl border-0 p-4 text-white shadow-md ${gradient}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold leading-tight">{label}</p>
          <p className="text-[11px] font-medium text-white/70">{sublabel}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-extrabold tracking-tight">{value}</p>
      {helper ? (
        <p className="mt-0.5 text-[11px] font-medium text-white/80">{helper}</p>
      ) : null}
      {sparkline ? (
        <div className="mt-2 -mb-1">
          <Sparkline color="rgba(255,255,255,0.75)" points={sparkline} />
        </div>
      ) : null}
    </Card>
  );
}

function QuantityTable({
  title,
  subtitle,
  items,
  qtyById,
  onQtyChange,
  sectionTotal,
  totalLabel,
  headerGradient,
  headerIcon: HeaderIcon,
}: {
  title: string;
  subtitle: string;
  items: EstimateLineItem[];
  qtyById: Record<string, string>;
  onQtyChange: (id: string, value: string) => void;
  sectionTotal: number;
  totalLabel: string;
  headerGradient: string;
  headerIcon: LucideIcon;
}) {
  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 shadow-sm">
      <div
        className={`flex items-center gap-3 px-4 py-3 text-white ${headerGradient}`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
          <HeaderIcon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold leading-snug">{title}</h2>
          <p className="mt-0.5 text-[11px] text-white/75">{subtitle}</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/40 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
              <th className="px-3 py-2">Item</th>
              <th className="w-16 px-1 py-2 text-center sm:w-20">Qty</th>
              <th className="w-[4.5rem] px-1 py-2 text-right sm:w-24">Unit</th>
              <th className="w-[4.75rem] px-3 py-2 text-right sm:w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const qty = parseQty(qtyById[item.id] ?? "");
              const lineTotal = qty * item.unitCost;
              const ItemIcon = item.icon;
              return (
                <tr
                  key={item.id}
                  className="border-b border-border/40 last:border-0 transition hover:bg-muted/20"
                >
                  <td className="px-3 py-1.5 font-medium leading-snug text-foreground">
                    <span className="flex items-center gap-2">
                      {ItemIcon ? (
                        <ItemIcon className="h-4 w-4 shrink-0 text-primary" />
                      ) : null}
                      {item.name}
                    </span>
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
                  <td className="px-3 py-1.5 text-right font-semibold text-foreground">
                    {formatCurrency(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 bg-muted/40 px-4 py-3">
        <span className="text-xs font-semibold text-foreground">{totalLabel}</span>
        <span className="shrink-0 text-sm font-bold text-primary">
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
      <div className="border-b border-border/40 bg-muted/30 px-4 py-2.5">
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
              className="flex cursor-pointer items-center justify-between gap-2 px-4 py-2.5 transition hover:bg-muted/20"
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

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 bg-muted/40 px-4 py-3">
        <span className="text-xs font-semibold text-foreground">{totalLabel}</span>
        <span className="shrink-0 text-sm font-bold text-primary">
          {formatCurrency(sectionTotal)}
        </span>
      </div>
    </Card>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-extrabold text-white">{value}</p>
      <p className="text-[10px] font-medium text-white/60">{label}</p>
    </div>
  );
}

type SavedEstimate = {
  constructionQty: Record<string, string>;
  additionalQty: Record<string, string>;
  selectedUtilities: string[];
  selectedExpenses: string[];
  makeupSalon: typeof MAKEUP_SALON_DEFAULTS;
  receptionist: typeof RECEPTIONIST_DEFAULTS;
};

function loadSavedEstimate(): SavedEstimate | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedEstimate;
  } catch {
    return null;
  }
}

export default function EstimateCalculatorPage() {
  const saved = useMemo(loadSavedEstimate, []);

  const [constructionQty, setConstructionQty] = useState(() => ({
    ...emptyQtyMap(CONSTRUCTION_ITEMS),
    ...(saved?.constructionQty ?? {}),
  }));
  const [additionalQty, setAdditionalQty] = useState(() => ({
    ...emptyQtyMap(ADDITIONAL_ITEMS),
    ...(saved?.additionalQty ?? {}),
  }));
  const [selectedUtilities, setSelectedUtilities] = useState<Set<string>>(
    () => new Set(saved?.selectedUtilities ?? []),
  );
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(
    () => new Set(saved?.selectedExpenses ?? []),
  );
  const [makeupSalon, setMakeupSalon] = useState(
    saved?.makeupSalon ?? MAKEUP_SALON_DEFAULTS,
  );
  const [receptionist, setReceptionist] = useState(
    saved?.receptionist ?? RECEPTIONIST_DEFAULTS,
  );
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    document.title = "Calculate Your Estimate • iFuntology Teacher";
  }, []);

  const constructionTotal = useMemo(
    () => sumLineItems(CONSTRUCTION_ITEMS, constructionQty),
    [constructionQty],
  );
  const additionalTotal = useMemo(
    () => sumLineItems(ADDITIONAL_ITEMS, additionalQty),
    [additionalQty],
  );
  const utilitiesTotal = useMemo(
    () => sumSelectedMonthlyItems(UTILITY_ITEMS, selectedUtilities),
    [selectedUtilities],
  );
  const expensesTotal = useMemo(
    () => sumSelectedMonthlyItems(EXPENSE_ITEMS, selectedExpenses),
    [selectedExpenses],
  );
  const makeupSalonMonthly = useMemo(
    () => calcMakeupSalonMonthly(makeupSalon),
    [makeupSalon],
  );
  const receptionistMonthly = useMemo(
    () => calcReceptionistMonthly(receptionist),
    [receptionist],
  );
  const receptionistWeeklyGross =
    parseAmount(receptionist.payRate) * parseAmount(receptionist.hoursPerWeek);
  const makeupSalonWeekly =
    parseQty(makeupSalon.stations) * parseAmount(makeupSalon.boothRentalRate);

  const setupTotal = constructionTotal + additionalTotal;
  const monthlyExpenses =
    utilitiesTotal + expensesTotal + makeupSalonMonthly + receptionistMonthly;
  const grandTotal = setupTotal + monthlyExpenses;

  useEffect(() => {
    setLastUpdated(new Date());
  }, [grandTotal]);

  const filledLineItems =
    CONSTRUCTION_ITEMS.filter((i) => parseQty(constructionQty[i.id] ?? "") > 0)
      .length +
    ADDITIONAL_ITEMS.filter((i) => parseQty(additionalQty[i.id] ?? "") > 0)
      .length;
  const totalItems =
    filledLineItems +
    selectedUtilities.size +
    selectedExpenses.size +
    (makeupSalonMonthly > 0 ? 1 : 0) +
    (receptionistMonthly > 0 ? 1 : 0);
  const categories = [
    constructionTotal,
    additionalTotal,
    utilitiesTotal,
    expensesTotal,
    makeupSalonMonthly,
    receptionistMonthly,
  ].filter((v) => v > 0).length;
  const setupShare = grandTotal > 0 ? (setupTotal / grandTotal) * 100 : 0;

  const toggleInSet = (
    setter: Dispatch<SetStateAction<Set<string>>>,
    id: string,
    checked: boolean,
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSaveEstimate = () => {
    try {
      const payload: SavedEstimate = {
        constructionQty,
        additionalQty,
        selectedUtilities: Array.from(selectedUtilities),
        selectedExpenses: Array.from(selectedExpenses),
        makeupSalon,
        receptionist,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setLastUpdated(new Date());
      toast.success("Estimate saved.");
    } catch {
      toast.error("Failed to save estimate.");
    }
  };

  const handleGeneratePdf = () => {
    if (grandTotal <= 0) {
      toast.error("Add at least one cost before exporting a report.");
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
      toast.success("Report exported.");
    } catch {
      toast.error("Failed to export report. Please try again.");
    }
  };

  const lastUpdatedDate = lastUpdated.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const lastUpdatedTime = lastUpdated.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

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

          <div className="mb-2 flex items-center gap-2 text-lime-500">
            <Calculator className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Estimate
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Calculate Your{" "}
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              Estimate
            </span>
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Enter quantities, staff costs, and select utilities and expenses.
            Final total includes construction, additional materials, utilities,
            expenses, make up salon, and receptionist costs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Estimated Total"
            sublabel="All Categories"
            value={formatCurrency(grandTotal)}
            icon={DollarSign}
            gradient="bg-gradient-to-br from-violet-600 to-indigo-700"
            sparkline={[4, 8, 6, 12, 9, 15, 13, 18]}
          />
          <KpiCard
            label="Setup Investment"
            sublabel="Construction & Equipment"
            value={formatCurrency(setupTotal)}
            helper={
              grandTotal > 0 ? `${setupShare.toFixed(1)}% of Total` : undefined
            }
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-emerald-500 to-green-700"
            sparkline={[3, 5, 4, 7, 6, 9, 8, 11]}
          />
          <KpiCard
            label="Monthly Expenses"
            sublabel="Utilities, Staff & Ongoing"
            value={formatCurrency(monthlyExpenses)}
            icon={PieChart}
            gradient="bg-gradient-to-br from-sky-500 to-blue-700"
            sparkline={[6, 5, 8, 7, 10, 9, 12, 11]}
          />
          <KpiCard
            label="Last Updated"
            sublabel={lastUpdatedTime}
            value={lastUpdatedDate}
            icon={CalendarDays}
            gradient="bg-gradient-to-br from-orange-500 to-rose-600"
          />
        </div>

        <ProfitBreakdownCharts />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
          <QuantityTable
            title="Estimated Construction Material Cost"
            subtitle="Qty × unit cost = line total"
            items={CONSTRUCTION_ITEMS}
            qtyById={constructionQty}
            onQtyChange={(id, value) =>
              setConstructionQty((prev) => ({ ...prev, [id]: value }))
            }
            sectionTotal={constructionTotal}
            totalLabel="Construction Total"
            headerGradient="bg-gradient-to-r from-violet-600 to-fuchsia-600"
            headerIcon={HardHat}
          />
          <QuantityTable
            title="Additional Material & Equipment"
            subtitle="Qty × unit cost = line total"
            items={ADDITIONAL_ITEMS}
            qtyById={additionalQty}
            onQtyChange={(id, value) =>
              setAdditionalQty((prev) => ({ ...prev, [id]: value }))
            }
            sectionTotal={additionalTotal}
            totalLabel="Additional Total"
            headerGradient="bg-gradient-to-r from-sky-500 to-blue-600"
            headerIcon={ShoppingCart}
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
            <div className="border-b border-border/40 bg-emerald-50/80 px-4 py-2.5 dark:bg-emerald-950/30">
              <h2 className="text-sm font-bold text-foreground">
                Make Up Salon Cost
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Stations × booth rental × {WEEKS_PER_MONTH} weeks = monthly
              </p>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-3 p-4 sm:grid-cols-3">
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
            <div className="space-y-1 border-t border-border/50 bg-emerald-50/50 px-4 py-2.5 dark:bg-emerald-950/20">
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
            <div className="border-b border-border/40 bg-sky-50/80 px-4 py-2.5 dark:bg-sky-950/30">
              <h2 className="text-sm font-bold text-foreground">Receptionist</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Pay rate × hours/week × {WEEKS_PER_MONTH} weeks = monthly gross
              </p>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-3 p-4 sm:grid-cols-2">
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
            <div className="space-y-1 border-t border-border/50 bg-sky-50/50 px-4 py-2.5 dark:bg-sky-950/20">
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

        <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 shadow-lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md">
                <Calculator className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-fuchsia-300">
                  Grand Total
                </p>
                <p className="text-3xl font-extrabold text-white">
                  {formatCurrency(grandTotal)}
                </p>
                <p className="text-[11px] font-medium text-white/60">
                  All costs included
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <SummaryStat
                icon={TrendingUp}
                label="Setup Share"
                value={`${setupShare.toFixed(1)}%`}
              />
              <SummaryStat
                icon={Package}
                label="Total Items"
                value={String(totalItems)}
              />
              <SummaryStat
                icon={LayoutGrid}
                label="Categories"
                value={String(categories)}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="gap-2 rounded-xl border-0 bg-gradient-to-r from-fuchsia-500 to-pink-500 font-semibold text-white hover:from-fuchsia-600 hover:to-pink-600"
                onClick={handleSaveEstimate}
              >
                <Save className="h-4 w-4" />
                Save Estimate
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-xl border-white/20 bg-white/5 font-semibold text-white hover:bg-white/10 hover:text-white"
                onClick={handleGeneratePdf}
              >
                <FileDown className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
