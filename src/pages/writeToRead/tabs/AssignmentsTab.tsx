import { TabsContent } from "@/components/ui/tabs";
import WriteToReadAssignmentsPanel from "../components/WriteToReadAssignmentsPanel";

export function AssignmentsTab() {
  return (
    <TabsContent value="assignments" className="mt-0 space-y-6 outline-none text-left">
      <WriteToReadAssignmentsPanel />
    </TabsContent>
  );
}
