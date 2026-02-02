import * as React from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";

export default function QuoteShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        <Card className="surface-glass mt-5 rounded-3xl border border-border/60 p-6 shadow-elev sm:p-8">{children}</Card>
      </div>
    </DashboardLayout>
  );
}
