import { useEffect, type ReactNode } from "react";

import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";

import "./book-builder-student-theme.css";

type Props = {
  children: ReactNode;
};

export default function TeacherBookBuilderShell({ children }: Props) {
  useEffect(() => {
    document.body.classList.add("student-book-builder-active");
    return () => document.body.classList.remove("student-book-builder-active");
  }, []);

  return (
    <DashboardWithSidebarLayout fullWidth>
      <div className="student-book-builder flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
        <div className="student-book-builder__frame flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden border-y border-border/60 bg-transparent">
          {children}
        </div>
      </div>
    </DashboardWithSidebarLayout>
  );
}
