import {
  BookOpen,
  Box,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessagesSquare,
  PenTool,
  Store,
  Ticket,
  UserCog,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import IfuntologyMark from "@/components/branding/IfuntologyMark";
import BookSessionSidebarGroup from "@/components/layout/BookSessionSidebarGroup";
import PurchaseNowSidebarGroup from "@/components/layout/PurchaseNowSidebarGroup";
import FuntologyBusinessBuilderSidebarItem from "@/components/layout/FuntologyBusinessBuilderSidebarItem";
import FuntologyGlobalInstituteSidebarItem from "@/components/layout/FuntologyGlobalInstituteSidebarItem";
import IfuntologySidebarGroup from "@/components/layout/IfuntologySidebarGroup";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUrl } from "@/utils/Functions";

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
          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-normal"
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
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  const main: Item[] = [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }];

  const ecommerce: Item[] = [
    { title: "Enrichment Store", url: "/enrichment-store", icon: Store },
    { title: "My Orders", url: "/my-orders", icon: Box },
  ];

  const learningManagement: Item[] = [
    { title: "Learning Management", url: "/subscribe-to-lms", icon: GraduationCap },
    { title: "My Courses", url: "/my-courses", icon: BookOpen },
    { title: "My Students", url: "/my-students", icon: Users },
    { title: "Practical Sheets", url: "/practical-sheets", icon: ClipboardList },
    { title: "Video Library", url: "/video-library", icon: Video },
  ];

  const readToWrite: Item[] = [
    { title: "Write to Read", url: "/write-to-read", icon: PenTool },
  ];

  const affiliateProgram: Item[] = [
    // { title: "Affiliate Program", url: "/affiliate-program", icon: Gift },
    { title: "Surveys", url: "/surveys", icon: FileText },
  ];

  const communication: Item[] = [
    { title: "Chat", url: "/messages", icon: MessagesSquare },
  ];

  const support: Item[] = [
    { title: "Support Tickets", url: "/support-tickets", icon: Ticket },

  ];

  const account: Item[] = [
    { title: "Settings / Account", url: "/my-profile", icon: UserCog },
  ];

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="p-3">
        <div className="overflow-hidden rounded-2xl border-sidebar-border p-2 group-data-[collapsible=icon]:p-1">
          <a
            href="https://ifuntology.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              collapsed ? "justify-center px-0 py-1" : "block px-1"
            }`}
            aria-label="Open iFuntology ERP website"
          >
            {collapsed ? (
              <img
                src={ImageUrl("logo.png")}
                alt="iFuntology"
                className="h-8 w-8 object-contain"
              />
            ) : (
              <IfuntologyMark logoOnly size="medium" />
            )}
          </a>
        </div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar">
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
          <SidebarGroupLabel>BOOKING</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <BookSessionSidebarGroup />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>PURCHASE NOW</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <PurchaseNowSidebarGroup />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>IFUNTOLOGY</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <IfuntologySidebarGroup />
              <FuntologyGlobalInstituteSidebarItem />
              <FuntologyBusinessBuilderSidebarItem />
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
          <SidebarGroupLabel>LEARNING MANAGEMENT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {learningManagement.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <MenuLink item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>READ TO WRITE</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {readToWrite.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <MenuLink item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>ADDITIONAL</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {affiliateProgram.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <MenuLink item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        <SidebarGroup>
          <SidebarGroupLabel>COMMUNICATION</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communication.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>ACCOUNT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {account.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <MenuLink item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>



      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center gap-2 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
