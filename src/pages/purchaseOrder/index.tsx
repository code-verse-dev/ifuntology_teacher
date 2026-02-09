import { useEffect } from "react";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PO = {
  id: string;
  quote?: string;
  organization: string;
  contact: string;
  items: number;
  amount: string;
  status: string;
  payment: string;
  date: string;
};

const samplePOs: PO[] = [
  {
    id: "PO-2024-001",
    quote: "QT-2024-001",
    organization: "Springfield Elementary School",
    contact: "John Smith",
    items: 3,
    amount: "$9,060",
    status: "Approved",
    payment: "Partial",
    date: "12/8/2024",
  },
  {
    id: "PO-2024-002",
    quote: "QT-2024-002",
    organization: "Riverside Academy",
    contact: "Sarah Johnson",
    items: 2,
    amount: "$4,150",
    status: "Pending",
    payment: "Paid",
    date: "12/14/2024",
  },
  {
    id: "PO-2024-003",
    quote: "QT-2024-003",
    organization: "Greenwood School",
    contact: "Mike Davis",
    items: 2,
    amount: "$4,872",
    status: "Revision",
    payment: "Partial",
    date: "12/15/2024",
  },
  {
    id: "PO-2024-007",
    quote: "QT-2024-007",
    organization: "Central Academy",
    contact: "Robert Chen",
    items: 4,
    amount: "$7,890",
    status: "Rejected",
    payment: "Paid",
    date: "12/11/2024",
  },
];

export default function PurchaseOrder() {
  useEffect(() => {
    document.title = "Purchase Orders • iFuntology Teacher";
  }, []);

  return (
    <DashboardWithSidebarLayout>
      <section className="mx-auto w-full  space-y-6">
        <h1 className="text-2xl font-extrabold">Purchase Orders</h1>

        <Card className="rounded-2xl border border-border/60 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 w-full md:w-1/2">
              <div className="flex-1">
                <Input placeholder="Search by PO number, organization, or service..." />
              </div>
              <Button variant="outline">Filter By</Button>
            </div>
          </div>
        </Card>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Orders</div>
            <div className="mt-2 text-2xl font-semibold">
              {samplePOs.length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">
              Pending Approval
            </div>
            <div className="mt-2 text-2xl font-semibold">1</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Approved Orders</div>
            <div className="mt-2 text-2xl font-semibold">1</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Spend</div>
            <div className="mt-2 text-2xl font-semibold">$39,028</div>
          </Card>
        </div>

        {/* Table list */}
        <Card className="rounded-xl border border-border/60 p-4">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2">PO Number</th>
                  <th className="pb-2">Organization</th>
                  <th className="pb-2">Contact</th>
                  <th className="pb-2">Items</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Payment</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {samplePOs.map((po) => (
                  <tr key={po.id} className="align-top">
                    <td className="py-3">
                      <div className="font-medium">{po.id}</div>
                      {po.quote && (
                        <div className="text-xs text-muted-foreground">
                          Quote: {po.quote}
                        </div>
                      )}
                    </td>
                    <td className="py-3">{po.organization}</td>
                    <td className="py-3">{po.contact}</td>
                    <td className="py-3">{po.items}</td>
                    <td className="py-3">{po.amount}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3">{po.payment}</td>
                    <td className="py-3">{po.date}</td>
                    <td className="py-3">
                      <NavLink
                        to={`/purchase-orders/${po.id}`}
                        className="inline-block"
                      >
                        <Button variant="ghost">View</Button>
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </DashboardWithSidebarLayout>
  );
}
