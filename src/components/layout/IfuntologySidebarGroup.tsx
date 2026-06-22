import { ChevronRight, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  IFUNTOLOGY_NAV_ITEMS,
  isIfuntologySectionActive,
} from "@/pages/ifuntology/constants/navItems";

export default function IfuntologySidebarGroup() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActiveSection = isIfuntologySectionActive(pathname);

  return (
    <Collapsible defaultOpen={isActiveSection} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip="iFuntology" isActive={isActiveSection}>
            <Sparkles className="h-4 w-4" />
            {!collapsed && <span>iFuntology Courses </span>}
            {!collapsed && (
              <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {!collapsed && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {IFUNTOLOGY_NAV_ITEMS.map((item) => (
                <SidebarMenuSubItem key={item.url}>
                  <SidebarMenuSubButton asChild>
                    <NavLink
                      to={item.url}
                      end={"end" in item && item.end}
                      className="w-full"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
}
