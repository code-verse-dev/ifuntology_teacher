import { CalendarDays, Building2, User } from "lucide-react";
import { Card } from "@/components/ui/card";
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
  BUSINESS_TYPES,
  type IntroFormData,
} from "./introFormData";

type IntroFormStepProps = {
  value: IntroFormData;
  onChange: (next: IntroFormData) => void;
};

export default function IntroFormStep({ value, onChange }: IntroFormStepProps) {
  const setField = <K extends keyof IntroFormData>(
    field: K,
    next: IntroFormData[K]
  ) => {
    onChange({ ...value, [field]: next });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Building2 className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">
            Business Profile
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Get Started
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Tell us about your salon business. This information carries through
          your construction estimate and student budget.
        </p>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-border/60 shadow-sm">
        <div className="border-b border-border/40 bg-muted/30 px-4 py-3 sm:px-5">
          <h3 className="text-sm font-bold text-foreground">
            Introductory Details
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            All fields are required before continuing to the estimate.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div className="space-y-1.5">
            <Label htmlFor="intro-date" className="text-xs">
              Date
            </Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="intro-date"
                type="date"
                className="h-11 pl-9"
                value={value.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="intro-name" className="text-xs">
              Name
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="intro-name"
                className="h-11 pl-9"
                placeholder="Your full name"
                value={value.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="intro-business-name" className="text-xs">
              Business Name
            </Label>
            <Input
              id="intro-business-name"
              className="h-11"
              placeholder="e.g. Funtology Salon"
              value={value.businessName}
              onChange={(e) => setField("businessName", e.target.value)}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Business Type</Label>
            <Select
              value={value.businessType || undefined}
              onValueChange={(next) => setField("businessType", next)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Hair Salon, Nail Salon, Spa, Barber Shop, Beauty Salon, or Other
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="intro-budget" className="text-xs">
              Budget Amount ($)
            </Label>
            <Input
              id="intro-budget"
              type="number"
              min={0}
              step="0.01"
              className="h-11"
              placeholder="60000"
              value={value.budgetAmount}
              onChange={(e) => setField("budgetAmount", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="intro-sqft" className="text-xs">
              Square Footage
            </Label>
            <Input
              id="intro-sqft"
              type="number"
              min={1}
              className="h-11"
              placeholder="1200"
              value={value.squareFootage}
              onChange={(e) => setField("squareFootage", e.target.value)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
