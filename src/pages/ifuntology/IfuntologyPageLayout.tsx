import { useEffect } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import IfuntologyMarketingShell from "./components/IfuntologyMarketingShell";

export default function IfuntologyPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.title = `${title} • iFuntology Teacher`;
  }, [title]);

  return (
    <DashboardWithSidebarLayout>
      <IfuntologyMarketingShell>{children}</IfuntologyMarketingShell>
    </DashboardWithSidebarLayout>
  );
}
