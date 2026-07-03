import { ChevronRight, Package, Receipt, ShoppingBag, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

const subItems = [
  { title: "Shop", url: "/shop", icon: ShoppingBag },
  { title: "Quotes", url: "/quotes", icon: Receipt },
  { title: "Purchase Orders", url: "/purchase-orders", icon: Package },
];

function isPurchaseNowActive(pathname: string) {
  return subItems.some(
    (item) => pathname === item.url || pathname.startsWith(`${item.url}/`)
  );
}

export default function PurchaseNowSidebarGroup() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActiveSection = isPurchaseNowActive(pathname);

  if (collapsed) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip="Purchase Now" isActive={isActiveSection}>
              <ShoppingCart className="h-4 w-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="min-w-48">
            {subItems.map((item) => (
              <DropdownMenuItem key={item.url} asChild>
                <Link
                  to={item.url}
                  className={
                    pathname === item.url || pathname.startsWith(`${item.url}/`)
                      ? "bg-accent font-medium"
                      : ""
                  }
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible defaultOpen={isActiveSection} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip="Purchase Now" isActive={isActiveSection}>
            <ShoppingCart className="h-4 w-4" />
            <span>Purchase Now</span>
            <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {subItems.map((item) => (
              <SidebarMenuSubItem key={item.url}>
                <SidebarMenuSubButton asChild>
                  <NavLink
                    to={item.url}
                    end
                    className="w-full"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
