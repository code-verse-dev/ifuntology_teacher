import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText } from "lucide-react";
import {
  WTR_WEEKLY_ASSIGNMENTS,
  downloadWtrAssignmentPdf,
} from "@/constants/wtrWeeklyAssignments";

export default function WriteToReadAssignmentsPanel() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Weekly Assignments
        </h2>
        <p className="text-sm text-slate-500">
          Preview assignment PDFs in the flipbook viewer or download them for offline use.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50">
              <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Name
              </th>
              <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {WTR_WEEKLY_ASSIGNMENTS.map((assignment) => (
              <tr
                key={assignment.id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-orange-500" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {assignment.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-1.5 text-xs font-bold"
                      onClick={() =>
                        navigate(
                          `/write-to-read/assignment-preview/${encodeURIComponent(assignment.id)}`,
                        )
                      }
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-1.5 text-xs font-bold"
                      onClick={() =>
                        downloadWtrAssignmentPdf(assignment.url, assignment.filename)
                      }
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
