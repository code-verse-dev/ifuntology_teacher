import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  ShoppingCart,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { buildCartItems, ImageUrl } from "@/utils/Functions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebarOptional, SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLogoutMutation } from "@/redux/services/apiSlices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "@/redux/services/Slices/userSlice";
import { RootState } from "@/redux/store";
import {
  useGetCartQuery,
  useClearCartMutation,
  useCreateCartMutation,
} from "@/redux/services/apiSlices/cartSlice";
import { UPLOADS_URL } from "@/constants/api";
import { useGetAllNotificationsQuery } from "@/redux/services/apiSlices/notificationSlice";
import socket from "@/config/socket";
import { useEffect, useState } from "react";

export default function Topbar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const sidebar = useSidebarOptional();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const user = useSelector((state: RootState) => state?.user?.userData);
  const dispatch = useDispatch();

  const { data: notificationsData, refetch } = useGetAllNotificationsQuery({ isRead: false, limit: 3 });
  const unreadCount: number = notificationsData?.data?.unreadCount ?? 0;
  const topNotifs: any[] = notificationsData?.data?.notifications?.docs?.slice(0, 3) ?? [];

  const onLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(removeUser());
      setLogoutDialogOpen(false);
      navigate("/login", { replace: true });
    } catch {
      toast.error("Could not log out. Please try again.");
    }
  };
  
  useEffect(() => {
    socket.on("notification", (data) => {
      refetch();
    });
    return () => {
      socket.off("notification");
    };
    // eslint-disable-next-line
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6">
        <div className="flex items-center gap-2">
          {sidebar && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border border-border bg-background md:hidden"
                aria-label="Open menu"
                onClick={sidebar.toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <SidebarTrigger
                className="hidden h-10 w-10 rounded-full border border-border bg-background md:inline-flex"
                aria-label="Toggle sidebar"
              />
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          {/* Theme toggle — minimal */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-border bg-background"
            aria-label={(theme ?? "dark") === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme((theme ?? "dark") === "dark" ? "light" : "dark")}
          >
            {(theme ?? "dark") === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Cart — circular white/background with thin border + red badge */}
          <Sheet>
            <SheetTrigger asChild>
              <div className="relative cursor-pointer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-border bg-background"
                  aria-label="Cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <CartBadge />
              </div>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
              </SheetHeader>
              <CartSheet />
            </SheetContent>
          </Sheet>

          {/* Notifications — circular with thin border + red dot */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-border bg-background"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <span
                  className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500"
                  aria-hidden
                />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white" aria-hidden>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="z-50 w-80 bg-popover p-2 shadow-elev">
              <div className="flex items-center justify-between px-2 pb-1">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-red-500">{unreadCount} unread</span>
                )}
              </div>
              <DropdownMenuSeparator />
              {topNotifs.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No new notifications.
                </div>
              ) : (
                topNotifs.map((n) => (
                  <DropdownMenuItem key={n._id} className="flex flex-col items-start gap-1 rounded-md py-2 cursor-default focus:bg-accent/50">
                    <div className="text-sm font-semibold leading-snug">{n.title}</div>
                    <div className="text-xs text-muted-foreground leading-snug line-clamp-2">{n.content}</div>
                    <div className="text-[10px] text-muted-foreground/60">{new Date(n.createdAt).toLocaleString()}</div>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-md">
                <Link to="/notifications" className="w-full text-center text-xs font-semibold text-orange-500 hover:text-orange-600 cursor-pointer">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile — avatar + Hi, name! + role in green (no dropdown chevron) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full outline-none ring-ring focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Profile menu"
              >
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={
                    user?.image ? `${UPLOADS_URL}${user.image}` : undefined
                  } />
                  <AvatarFallback className="bg-muted text-foreground text-sm">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-semibold leading-none text-foreground">
                    Hi, {user?.firstName}!
                  </div>
                  <div className="mt-0.5 text-xs leading-none text-primary">
                    {user?.role[0]?.toUpperCase() + user?.role?.slice(1)}
                  </div>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-50 min-w-56 bg-popover shadow-elev"
            >
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/my-profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Link to="/my-profile" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setLogoutDialogOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout — visible orange button with icon + text */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-accent hover:bg-accent/10 hover:text-accent"
            onClick={() => setLogoutDialogOpen(true)}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You will need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setLogoutDialogOpen(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-full"
              onClick={() => void onLogout()}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out…" : "Log out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

function CartBadge() {
  // const { totalCount } = useCart();
  const { data: cartData, isLoading } = useGetCartQuery();
  if (isLoading || !cartData?.data?.items?.length) return null;

  // Sum all quantities
  const totalQty = cartData.data.items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );
  return (
    <div className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
      {totalQty}
    </div>
  );
}

function CartSheet() {
  const [createCart, { isLoading: updatingCart }] = useCreateCartMutation();
  const navigate = useNavigate();
  const { data: cartData, isLoading } = useGetCartQuery();
  const items = cartData?.data?.items || [];

  const [clearCartMutation, { isLoading: clearingCart }] =
    useClearCartMutation();

  const updateQty = async (
    productId: string,
    action: "increment" | "decrement"
  ) => {
    const updatedItems = buildCartItems(productId, cartData, action);
    try {
      await createCart({ items: updatedItems }).unwrap();
    } catch (err: any) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      await clearCartMutation().unwrap();
      toast.success("Cart cleared successfully");
    } catch (err: any) {
      console.error("Failed to clear cart:", err);
    }
  };

  return (
    // make sure the sheet content can shrink and the inner list can scroll
    <div className="mt-4 flex h-full flex-col min-h-0">
      <div className="flex-1 space-y-3 overflow-auto min-h-0 pb-6">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Your cart is empty.
          </div>
        ) : (
          items.map((it: any) => (
            <div
              key={it.product._id}
              className="flex items-center gap-3 rounded-md border border-border/60 p-3"
            >
              <img
                src={UPLOADS_URL + it.product.image}
                alt={it.product.name}
                className="h-14 w-14 rounded-md object-cover"
              />
              <div className="flex-1">
                <div className="font-medium">{it.product.name}</div>
                <div className="text-sm text-muted-foreground">
                  {it?.quantity} × ${it?.product?.price.toFixed(2)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-sm font-semibold">
                  ${it.total.toFixed(2)}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateQty(it.product._id, "decrement")}
                  >
                    -
                  </Button>
                  <div className="text-sm">{it.quantity}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateQty(it.product._id, "increment")}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="sticky bottom-0 bg-background border-t border-border/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Total</div>
          {/* <div className="text-lg font-semibold">${totalAmount.toFixed(2)}</div> */}
          <div className="text-lg font-semibold">${cartData?.data?.total}</div>
        </div>
        <div className="flex gap-2">
          <SheetClose asChild>
            <Button
              className="flex-1"
              variant="accent"
              onClick={() => navigate("/enrichment-store/checkout")}
            >
              Checkout
            </Button>
          </SheetClose>
          <Button
            variant="outline"
            onClick={clearCart}
            disabled={updatingCart || isLoading || clearingCart}
          >
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
