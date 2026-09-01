import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  CalendarDays,
  DollarSign,
  FileDown,
  LayoutGrid,
  Package,
  PieChart,
  Save,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ALL_ESTIMATE_ITEMS,
  ESTIMATE_CATEGORIES,
  FURNITURE_CATEGORIES,
  MATERIAL_CATEGORIES,
  emptyQtyMap,
  formatCurrency,
  parseQty,
  sumLineItems,
  type EstimateLineItem,
} from "./estimateData";
import type { IntroFormData } from "./introFormData";
import { generateEstimatePdf } from "./generateEstimatePdf";
import ProfitBreakdownCharts from "./ProfitBreakdownCharts";
import { clearBusinessBuilderDraft } from "./businessBuilderDraftStorage";

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
    <Card className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 shadow-sm">
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
                      <span>
                        {item.name}
                        {item.unitHint ? (
                          <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                            {item.unitHint}
                          </span>
                        ) : null}
                      </span>
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

type EstimateCalculatorPageProps = {
  /** When true, render step content only (no page chrome). */
  embedded?: boolean;
  /** Business profile from Step 1 — included in exported PDFs. */
  intro?: IntroFormData | null;
  /**
   * When provided (wizard mode), shows an extra action that navigates to the
   * loan form before generating a PDF that includes the loan application.
   */
  onGenerateWithLoan?: (payload: {
    itemQty: Record<string, string>;
    materialsTotal: number;
    furnitureTotal: number;
    grandTotal: number;
  }) => void;
  /**
   * Wizard mode: persist estimate + any registered budget draft together.
   * When omitted (standalone), only estimate quantities are saved.
   */
  onSaveEstimate?: (itemQty: Record<string, string>) => void;
  /** Called after a successful PDF export so the wizard can reset all steps. */
  onAfterPdfExport?: () => void;
  /** Lets the wizard read current quantities when saving from another step. */
  registerSnapshot?: (
    getter: (() => Record<string, string>) | null
  ) => void;
  /** Pre-fill quantities from a saved estimate. */
  initialItemQty?: Record<string, string>;
};

export default function EstimateCalculatorPage({
  embedded = false,
  intro = null,
  onGenerateWithLoan,
  onSaveEstimate,
  onAfterPdfExport,
  registerSnapshot,
  initialItemQty,
}: EstimateCalculatorPageProps) {
  const [itemQty, setItemQty] = useState(() => ({
    ...emptyQtyMap(ALL_ESTIMATE_ITEMS),
    ...(initialItemQty ?? {}),
  }));
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (!embedded) {
      document.title = "Calculate Your Estimate • iFuntology Teacher";
    }
  }, [embedded]);

  useEffect(() => {
    if (!registerSnapshot) return;
    registerSnapshot(() => itemQty);
    return () => registerSnapshot(null);
  }, [itemQty, registerSnapshot]);

  const materialsTotal = useMemo(
    () =>
      sumLineItems(
        MATERIAL_CATEGORIES.flatMap((c) => c.items),
        itemQty
      ),
    [itemQty]
  );
  const furnitureTotal = useMemo(
    () =>
      sumLineItems(
        FURNITURE_CATEGORIES.flatMap((c) => c.items),
        itemQty
      ),
    [itemQty]
  );

  const setupTotal = materialsTotal + furnitureTotal;
  const grandTotal = setupTotal;

  useEffect(() => {
    setLastUpdated(new Date());
  }, [grandTotal]);

  const filledLineItems = ALL_ESTIMATE_ITEMS.filter(
    (i) => parseQty(itemQty[i.id] ?? "") > 0
  ).length;
  const totalItems = filledLineItems;
  const categories = ESTIMATE_CATEGORIES.filter(
    (c) => sumLineItems(c.items, itemQty) > 0
  ).length;
  const materialsShare = grandTotal > 0 ? (materialsTotal / grandTotal) * 100 : 0;

  const resetEstimateForm = () => {
    setItemQty(emptyQtyMap(ALL_ESTIMATE_ITEMS));
    setLastUpdated(new Date());
  };

  const handleSaveEstimate = () => {
    if (onSaveEstimate) {
      onSaveEstimate(itemQty);
      return;
    }
    toast.error("Sign in to save this estimate to your account.");
  };

  const buildEstimatePayload = () => ({
    itemQty,
    materialsTotal,
    furnitureTotal,
    grandTotal,
  });

  const handleGeneratePdf = async () => {
    if (grandTotal <= 0) {
      toast.error("Add at least one cost before exporting a report.");
      return;
    }
    try {
      await generateEstimatePdf({
        ...buildEstimatePayload(),
        intro,
      });
      clearBusinessBuilderDraft();
      resetEstimateForm();
      onAfterPdfExport?.();
      toast.success("Report exported.");
    } catch {
      toast.error("Failed to export report. Please try again.");
    }
  };

  const handleGenerateWithLoan = () => {
    if (grandTotal <= 0) {
      toast.error("Add at least one cost before exporting a report.");
      return;
    }
    onGenerateWithLoan?.(buildEstimatePayload());
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

  // Stack shorter sections under Registration beside the tall Building card
  const besideBuildingIds = [
    "registration",
    "professional",
    "insurance",
    "utilities",
    "laundry",
    "barber",
    "reception",
  ] as const;
  const besideBuildingCategories = besideBuildingIds
    .map((id) => ESTIMATE_CATEGORIES.find((c) => c.id === id))
    .filter(
      (c): c is (typeof ESTIMATE_CATEGORIES)[number] => Boolean(c)
    );
  const buildingCategory = ESTIMATE_CATEGORIES.find((c) => c.id === "building");
  const remainingCategories = ESTIMATE_CATEGORIES.filter(
    (c) =>
      c.id !== "building" &&
      !(besideBuildingIds as readonly string[]).includes(c.id)
  );

  const renderCategory = (
    category: (typeof ESTIMATE_CATEGORIES)[number]
  ) => {
    const sectionTotal = sumLineItems(category.items, itemQty);
    return (
      <QuantityTable
        key={category.id}
        title={category.title}
        subtitle={category.subtitle}
        items={category.items}
        qtyById={itemQty}
        onQtyChange={(id, value) =>
          setItemQty((prev) => ({ ...prev, [id]: value }))
        }
        sectionTotal={sectionTotal}
        totalLabel="Section Total"
        headerGradient={category.headerGradient}
        headerIcon={category.headerIcon}
      />
    );
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

          <div className="mb-2 flex items-center gap-2 text-lime-500">
            <Calculator className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              {embedded ? "Step 2 · Salon Estimate" : "Estimate"}
            </span>
          </div>
          {embedded ? (
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Calculate Your{" "}
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                Estimate
              </span>
            </h2>
          ) : (
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Calculate Your{" "}
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                Estimate
              </span>
            </h1>
          )}
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Enter quantities for registration, build-out, furniture, equipment,
            and operating costs. Final total is the sum of all selected line
            items (unit price × quantity).
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
            label="Build & Setup"
            sublabel="Registration & Construction"
            value={formatCurrency(materialsTotal)}
            helper={
              grandTotal > 0
                ? `${materialsShare.toFixed(1)}% of Total`
                : undefined
            }
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-emerald-500 to-green-700"
            sparkline={[3, 5, 4, 7, 6, 9, 8, 11]}
          />
          <KpiCard
            label="Furniture & Ops"
            sublabel="Equipment, Tools & Services"
            value={formatCurrency(furnitureTotal)}
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

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
            <div className="flex flex-col gap-4">
              {besideBuildingCategories.map(renderCategory)}
            </div>
            {buildingCategory ? (
              <div>{renderCategory(buildingCategory)}</div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
            {remainingCategories.map(renderCategory)}
          </div>
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
                label="Materials Share"
                value={`${materialsShare.toFixed(1)}%`}
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

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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
              {embedded && onGenerateWithLoan ? (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 rounded-xl border-white/20 bg-white/5 font-semibold text-white hover:bg-white/10 hover:text-white"
                  onClick={handleGenerateWithLoan}
                >
                  <FileDown className="h-4 w-4" />
                  Export with Loan Application
                </Button>
              ) : null}
            </div>
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
