import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Download, Printer } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import IfuntologyMark from "@/components/branding/IfuntologyMark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function QuotationDocumentPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Quotation Document • iFuntology Teacher";
  }, []);

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Quotation Document</h1>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="accent" size="pill" type="button" onClick={() => {}}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="glass" size="pill" type="button" onClick={() => window.print?.()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <Card className="surface-glass mt-5 rounded-3xl border border-border/60 p-6 shadow-elev sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <IfuntologyMark />
              <div className="text-xs text-muted-foreground">
                iFuntology Education Services<br />
                123 Education Blvd, Suite 100<br />
                City, State 12345<br />
                Email: info@ifuntology.com<br />
                Phone: (555) 123-4567
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-border/60 bg-secondary/10 p-4 text-sm">
              <div className="flex items-center justify-between gap-8">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" /> Quotation Date
                </span>
                <span className="font-semibold">25 Dec 2025</span>
              </div>
              <div className="flex items-center justify-between gap-8">
                <span className="text-muted-foreground">Quotation Number</span>
                <span className="font-semibold">25 Dec 2025</span>
              </div>
              <div className="flex items-center justify-between gap-8">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-accent">Pending</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <div className="text-sm font-semibold">Bill To</div>
            <div className="mt-3 rounded-2xl border border-border/60 bg-secondary/10 p-4 text-sm text-muted-foreground">
              Lorem ipsum<br />
              Address…<br />
              Organization details…
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <div className="text-sm font-semibold">Service Details</div>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/20">
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="font-semibold">Funtology Physical Kits</div>
                      <div className="text-xs text-muted-foreground">Complete hands-on learning materials</div>
                    </TableCell>
                    <TableCell className="text-right">1</TableCell>
                    <TableCell className="text-right">$49.99</TableCell>
                    <TableCell className="text-right">$49.99</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-semibold">Funtology Web-Based Subscriptions</div>
                      <div className="text-xs text-muted-foreground">Annual access to online learning platform</div>
                    </TableCell>
                    <TableCell className="text-right">1</TableCell>
                    <TableCell className="text-right">$24.99</TableCell>
                    <TableCell className="text-right">$24.99</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border/60 bg-secondary/10 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">$74.99</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax (0%):</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Total Amount:</span>
              <span className="text-xl font-extrabold text-primary">$74.99</span>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <div className="text-sm font-semibold">Terms &amp; Conditions</div>
            <div className="mt-3 rounded-2xl border border-border/60 bg-secondary/10 p-4 text-sm text-muted-foreground">
              <ul className="list-disc space-y-2 pl-5">
                <li>This quotation is valid for 30 days from the date of issue</li>
                <li>Payment is required before service activation</li>
                <li>Purchase Order approval required from admin before processing</li>
              </ul>
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="glass" size="pill" type="button" onClick={() => navigate(-1)}>
              Close
            </Button>
            <Button variant="brand" size="pill" type="button" onClick={() => navigate("/dashboard")}>
              Save &amp; Close
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
