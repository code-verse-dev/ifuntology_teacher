import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
  IFUNTOLOGY_FROM_SHOP_KEY,
  IFUNTOLOGY_NAV_ITEMS,
  isIfuntologySectionActive,
} from "@/pages/ifuntology/constants/navItems";

export default function IfuntologySidebarGroup() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActiveSection = isIfuntologySectionActive(pathname);
  const [fromShop, setFromShop] = useState(false);

  useEffect(() => {
    setFromShop(sessionStorage.getItem(IFUNTOLOGY_FROM_SHOP_KEY) === "1");
  }, [pathname]);

  const showBackToShop = fromShop && isActiveSection;

  const handleBackToShop = () => {
    sessionStorage.removeItem(IFUNTOLOGY_FROM_SHOP_KEY);
    setFromShop(false);
  };

  return (
    <Collapsible defaultOpen={isActiveSection} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip="iFuntology" isActive={isActiveSection}>
            <Sparkles className="h-4 w-4" />
            {!collapsed && <span>iFuntology</span>}
            {!collapsed && (
              <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {!collapsed && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {showBackToShop && (
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link
                      to="/shop"
                      onClick={handleBackToShop}
                      className="w-full text-sidebar-foreground/90"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                      <span>Back to Shop</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )}
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
