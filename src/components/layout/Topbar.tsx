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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebarOptional } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function Topbar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const sidebar = useSidebarOptional();
  const [logout] = useLogoutMutation();
  const user = useSelector((state: RootState) => state.user.userData);
  const dispatch = useDispatch();
  const onLogout = async () => {
    const res = await logout().unwrap();
    dispatch(removeUser());
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6">
        {/* Hamburger — mobile only, toggles sidebar (only when inside SidebarProvider) */}
        {sidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full border border-border bg-background md:hidden"
            aria-label="Open menu"
            onClick={sidebar.toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          {/* Theme toggle — minimal */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-border bg-background"
            aria-label={
              (theme ?? "dark") === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            onClick={() =>
              setTheme((theme ?? "dark") === "dark" ? "light" : "dark")
            }
          >
            {(theme ?? "dark") === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
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
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-50 w-80 bg-popover p-2 shadow-elev"
            >
              <DropdownMenuLabel className="px-2">
                Notifications
              </DropdownMenuLabel>
              <div className="px-2 pb-2 text-xs text-muted-foreground">
                Latest updates and reminders.
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 rounded-md py-2">
                <div className="text-sm font-semibold">New booking request</div>
                <div className="text-xs text-muted-foreground">
                  A student requested a session for next week.
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 rounded-md py-2">
                <div className="text-sm font-semibold">Calendar updated</div>
                <div className="text-xs text-muted-foreground">
                  Availability synced successfully.
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-md">
                <Link to="/book-session" className="w-full">
                  View all
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
                  <AvatarFallback className="bg-muted text-foreground text-sm">
                    TF
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-semibold leading-none text-foreground">
                    Hi, {user?.firstName}!
                  </div>
                  <div className="mt-0.5 text-xs leading-none text-primary">
                    {user?.role}
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
                <Link to="/dashboard" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={onLogout}
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
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
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
