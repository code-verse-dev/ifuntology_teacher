import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import QuoteSubmittedDialog from "@/components/quotes/QuoteSubmittedDialog";
import QuoteShell from "@/pages/dashboard/quotes/QuoteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  serviceType: z.literal("Learning Management System"),
  organizationName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  address: z.string().trim().min(1).max(255),
  kits: z.coerce.number().int().min(0).max(9999),
  students: z.coerce.number().int().min(0).max(999999),
  webSubscriptions: z.coerce.number().int().min(0).max(999999),
});

export default function QuoteLmsPage() {
  const navigate = useNavigate();
  const [submittedOpen, setSubmittedOpen] = useState(false);
  const [values, setValues] = useState({
    serviceType: "Learning Management System" as const,
    organizationName: "",
    email: "",
    address: "",
    kits: 0,
    students: 0,
    webSubscriptions: 0,
  });

  useEffect(() => {
    document.title = "Request a Quote (LMS) • iFuntology Teacher";
  }, []);

  const totals = useMemo(() => {
    // UI-only demo: keep $0.00 as in the design until pricing rules are provided.
    return {
      kits: 0,
      tax: 0,
      total: 0,
    };
  }, [values.kits, values.students, values.webSubscriptions]);

  return (
    <>
      <QuoteShell title="Request A Quote">
        <form
          className="grid grid-cols-1 gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            const parsed = schema.safeParse(values);
            if (!parsed.success) return;
            setSubmittedOpen(true);
          }}
        >
          <div className="space-y-2">
            <Label>Service Type *</Label>
            <Select
              value={values.serviceType}
              onValueChange={(v) => setValues((s) => ({ ...s, serviceType: v as typeof s.serviceType }))}
            >
              <SelectTrigger className="h-11 rounded-full">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Learning Management System">Learning Management System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org">Organization Name *</Label>
              <Input
                id="org"
                className="h-11 rounded-full"
                placeholder="Enter Name"
                value={values.organizationName}
                onChange={(e) => setValues((s) => ({ ...s, organizationName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                className="h-11 rounded-full"
                placeholder="Enter Email"
                value={values.email}
                onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              className="h-11 rounded-full"
              placeholder="Enter Address"
              value={values.address}
              onChange={(e) => setValues((s) => ({ ...s, address: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="kits">Number of kits *</Label>
              <Input
                id="kits"
                inputMode="numeric"
                className="h-11 rounded-full"
                value={String(values.kits)}
                onChange={(e) => setValues((s) => ({ ...s, kits: Number(e.target.value || 0) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="students">Number of Students *</Label>
              <Input
                id="students"
                inputMode="numeric"
                className="h-11 rounded-full"
                value={String(values.students)}
                onChange={(e) => setValues((s) => ({ ...s, students: Number(e.target.value || 0) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subs">Web Subscriptions *</Label>
              <Input
                id="subs"
                inputMode="numeric"
                className="h-11 rounded-full"
                value={String(values.webSubscriptions)}
                onChange={(e) => setValues((s) => ({ ...s, webSubscriptions: Number(e.target.value || 0) }))}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-secondary/10 p-5">
            <div className="text-sm font-semibold text-primary">Live Price Calculator</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Physical Kits</span>
                <span className="font-semibold">${totals.kits.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-semibold">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-secondary/20 px-4 py-3">
                <span className="font-semibold">Estimated Total:</span>
                <span className="font-extrabold text-primary">${totals.total.toFixed(2)}</span>
              </div>
              <div className="text-center text-xs text-destructive">✓ Price updates automatically as you enter quantities</div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="glass" size="pill" type="button" onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="brand" size="pill" type="submit" className="w-full sm:w-auto">
              Submit &amp; Download
            </Button>
          </div>
        </form>
      </QuoteShell>

      <QuoteSubmittedDialog
        open={submittedOpen}
        onOpenChange={setSubmittedOpen}
        onDownload={() => {
          setSubmittedOpen(false);
          navigate("/quotation-document");
        }}
      />
    </>
  );
}
