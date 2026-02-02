import {
  BadgeDollarSign,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  MessagesSquare,
  Package,
  Receipt,
  Store,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

import IfuntologyMark from "@/components/branding/IfuntologyMark";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type Item = {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
};

function MenuLink({ item }: { item: Item }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  if (item.url) {
    return (
      <SidebarMenuButton asChild tooltip={item.title}>
        <NavLink
          to={item.url}
          end
          className="w-full"
          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
        >
          <item.icon className="h-4 w-4" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuButton tooltip={item.title} onClick={() => toast.message(`${item.title} (coming soon)`)}>
      <item.icon className="h-4 w-4" />
      {!collapsed && <span>{item.title}</span>}
    </SidebarMenuButton>
  );
}

export default function DashboardSidebar() {
  const main: Item[] = [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }];

  const booking: Item[] = [
    { title: "Book Session", url: "/book-a-session", icon: ClipboardList },
    { title: "Quotes", url: "/quotes", icon: Receipt },
    { title: "Purchase Orders", url: "/purchase-orders", icon: Package },
    { title: "Pay Invoice", icon: BadgeDollarSign },
  ];

  const ecommerce: Item[] = [
    { title: "Enrichment Store", url: "/enrichment-store", icon: Store },
    { title: "My Orders", url: "/my-orders", icon: BookOpen },
  ];

  const support: Item[] = [
    { title: "Support Tickets", icon: Ticket },
    { title: "Chat", icon: MessagesSquare },
  ];

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="p-3">
        <div
          className="overflow-hidden rounded-2xl border-sidebar-border p-2">
          <div className="px-1">
            <IfuntologyMark />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>MAIN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <MenuLink item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>BOOKING & QUOTES</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {booking.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <MenuLink item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>E-COMMERCE</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ecommerce.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <MenuLink item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>SUPPORT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {support.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <MenuLink item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
