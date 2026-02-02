import { useEffect, useState } from "react";
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
  serviceType: z.literal("Write to Read"),
  bookPrintingRequests: z.enum(["Yes", "No"]),
  organizationName: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(255),
  subscriptions: z.coerce.number().int().min(0).max(999999),
  studentsInBatch: z.coerce.number().int().min(0).max(999999),
});

export default function QuoteWriteToReadPage() {
  const navigate = useNavigate();
  const [submittedOpen, setSubmittedOpen] = useState(false);
  const [values, setValues] = useState({
    serviceType: "Write to Read" as const,
    bookPrintingRequests: "Yes" as const,
    organizationName: "",
    address: "",
    subscriptions: 0,
    studentsInBatch: 0,
  });

  useEffect(() => {
    document.title = "Request a Quote (Write to Read) • iFuntology Teacher";
  }, []);

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
            <Select value={values.serviceType} onValueChange={() => {}}>
              <SelectTrigger className="h-11 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Write to Read">Write to Read</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Book Printing Requests *</Label>
              <Select
                value={values.bookPrintingRequests}
                onValueChange={(v) => setValues((s) => ({ ...s, bookPrintingRequests: v as typeof s.bookPrintingRequests }))}
              >
                <SelectTrigger className="h-11 rounded-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="org">Organization / Teacher Name *</Label>
              <Input
                id="org"
                className="h-11 rounded-full"
                placeholder="Enter Name"
                value={values.organizationName}
                onChange={(e) => setValues((s) => ({ ...s, organizationName: e.target.value }))}
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subs">Number of Subscriptions *</Label>
              <Input
                id="subs"
                inputMode="numeric"
                className="h-11 rounded-full"
                value={String(values.subscriptions)}
                onChange={(e) => setValues((s) => ({ ...s, subscriptions: Number(e.target.value || 0) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="students">Number of Students in Batch *</Label>
              <Input
                id="students"
                inputMode="numeric"
                className="h-11 rounded-full"
                value={String(values.studentsInBatch)}
                onChange={(e) => setValues((s) => ({ ...s, studentsInBatch: Number(e.target.value || 0) }))}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-secondary/10 p-5">
            <div className="text-sm font-semibold text-primary">Live Price Calculator</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Monthly Price</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-secondary/20 px-4 py-3">
                <span className="font-semibold">Estimated Total:</span>
                <span className="font-extrabold text-primary">$0.00</span>
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
