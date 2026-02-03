import { useEffect } from "react";
import { NavLink } from "@/components/NavLink";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Quote = {
  id: string;
  title: string;
  status: "Pending" | "Approved" | "Rejected" | "Draft" | "Revision";
  price: string;
  note?: string;
};

const sampleQuotes: Quote[] = [
  { id: "QT-2026-001", title: "LMS Annual Subscription", status: "Pending", price: "$2,400" },
  { id: "QT-2026-002", title: "Write To Read + Enrichment Bundle", status: "Approved", price: "$1,800" },
  { id: "QT-2026-003", title: "STEM Learning", status: "Draft", price: "$450" },
  { id: "QT-2026-004", title: "Monthly LMS Subscription", status: "Rejected", price: "$250", note: "Pricing needs to be revised for monthly plan" },
  { id: "QT-2026-005", title: "Write To Read Individual", status: "Revision", price: "$1,200", note: "Please add ISBN generation service" },
];

export default function QutationTracking() {
  useEffect(() => {
    document.title = "Quotations Tracking • iFuntology Teacher";
  }, []);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full  space-y-6">
        <h1 className="text-2xl font-extrabold">Quotations Tracking</h1>

        <Card className="rounded-2xl border border-border/60 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 w-full md:w-1/2">
              <div className="flex-1">
                <Input placeholder="Search quotations..." />
              </div>
              <Button variant="outline">Filter By</Button>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <NavLink to="/quotes/request" className="w-max">
                <Button variant="brand">+ Request Quotation</Button>
              </NavLink>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {sampleQuotes.map((q) => (
            <Card key={q.id} className="rounded-xl border border-border/60 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold">{q.title}</div>
                    <div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${q.status === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : q.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : q.status === "Pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-muted-foreground"
                          }`}
                      >
                        {q.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    {q.id} • Created: 2025-12-28 • Valid until: 2026-01-28
                  </div>

                  {q.note && (
                    <div className="mt-3 rounded-md border border-red-100 bg-red-50 p-2 text-sm text-red-700">{q.note}</div>
                  )}
                </div>

                <div className="ml-4 flex w-40 flex-col items-end justify-between">
                  <div className="text-lg font-semibold">{q.price}</div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline">View Details</Button>
                    <Button variant="ghost">Download</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </DashboardWithSidebarLayout>
  );
}
