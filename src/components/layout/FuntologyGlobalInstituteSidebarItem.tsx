import { useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const FUNTOLOGY_GLOBAL_INSTITUTE_URL = "https://funtologyglobalinstitute.com/";

export default function FuntologyGlobalInstituteSidebarItem() {
  const [open, setOpen] = useState(false);
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleContinue = () => {
    window.open(
      FUNTOLOGY_GLOBAL_INSTITUTE_URL,
      "_blank",
      "noopener,noreferrer",
    );
    setOpen(false);
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Funtology Global Institute"
          onClick={() => setOpen(true)}
        >
          <Globe className="h-4 w-4" />
          {!collapsed && <span>Funtology Global Institute</span>}
        </SidebarMenuButton>
      </SidebarMenuItem>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave iFuntology Teacher?</DialogTitle>
            <DialogDescription>
              You are about to navigate to Funtology Global Institute. You will
              leave this site and be taken to an external website.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleContinue}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
