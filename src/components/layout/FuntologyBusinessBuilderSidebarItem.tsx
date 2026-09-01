import { Briefcase } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export default function FuntologyBusinessBuilderSidebarItem() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip="Funtology Business Builder">
        <NavLink
          to="/funtology-business-builder"
          className="w-full"
          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        >
          <Briefcase className="h-4 w-4" />
          {!collapsed && <span>Funtology Business Builder</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
