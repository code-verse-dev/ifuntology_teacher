import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "./estimateData";

/** Sample chart data for UI display only (from Business Builder sheet). */
const WEEKLY_PROFIT_DATA = [
  { name: "Nail Salon", value: 48.5, color: "#22c55e" },
  { name: "Make Up Salon", value: 30.3, color: "#3b82f6" },
  { name: "Utilities", value: 17.9, color: "#ef4444" },
  { name: "Receptionist", value: 3.3, color: "#f59e0b" },
];

const WEEKLY_CENTER_PROFIT = 371.41;

const MONTHLY_PROFIT_DATA = [
  { name: "Gross Profit", value: 7482.8, fill: "#22c55e" },
  { name: "Utilities", value: -5411.2, fill: "#ef4444" },
  { name: "Receptionist", value: -450, fill: "#f97316" },
  { name: "Net Profit", value: 1621.6, fill: "#3b82f6" },
];

function PeriodSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[130px] rounded-lg text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option} className="text-xs">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function WeeklyProfitChart() {
  const [period, setPeriod] = useState("This Week");
  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 shadow-sm">
      <div className="flex items-start justify-between gap-2 border-b border-border/40 bg-muted/30 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">
            Weekly Profit Breakdown
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Sample distribution for UI preview
          </p>
        </div>
        <PeriodSelect
          value={period}
          onChange={setPeriod}
          options={["This Week", "Last Week", "This Month"]}
        />
      </div>
      <div className="px-2 pb-3 pt-2">
        <div className="relative mx-auto h-[220px] w-full max-w-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={WEEKLY_PROFIT_DATA}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={2}
                strokeWidth={0}
              >
                {WEEKLY_PROFIT_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name,
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="max-w-[100px] text-center">
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(WEEKLY_CENTER_PROFIT)}
              </p>
              <p className="text-[10px] font-medium leading-tight text-muted-foreground">
                Profit for the Week
              </p>
            </div>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 px-2">
          {WEEKLY_PROFIT_DATA.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-[11px]">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">
                {item.name}{" "}
                <span className="font-semibold text-foreground">
                  {item.value}%
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function MonthlyProfitChart() {
  const [period, setPeriod] = useState("This Month");
  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 shadow-sm">
      <div className="flex items-start justify-between gap-2 border-b border-border/40 bg-muted/30 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">
            Profit Breakdown (Monthly)
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Sample monthly profit vs expenses for UI preview
          </p>
        </div>
        <PeriodSelect
          value={period}
          onChange={setPeriod}
          options={["This Month", "Last Month", "This Quarter"]}
        />
      </div>
      <div className="h-[260px] w-full px-2 py-3 sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={MONTHLY_PROFIT_DATA}
            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
          >
            <XAxis
              type="number"
              tickFormatter={(v) =>
                `${v < 0 ? "-" : ""}$${Math.abs(v / 1000).toFixed(1)}k`
              }
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={88}
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine x={0} stroke="hsl(var(--border))" />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={18}>
              {MONTHLY_PROFIT_DATA.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function ProfitBreakdownCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <WeeklyProfitChart />
      <MonthlyProfitChart />
    </div>
  );
}
