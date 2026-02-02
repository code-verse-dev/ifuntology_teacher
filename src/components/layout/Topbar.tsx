import { Bell, ChevronDown, LogOut, Settings, User, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import IfuntologyMark from "@/components/branding/IfuntologyMark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useCart } from "@/context/cart.store";
import { ImageUrl } from "@/utils/Functions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Topbar({
  userName = "Tom Felix",
  role = "Teacher",
  showSidebarTrigger = false,
}: {
  userName?: string;
  role?: string;
  showSidebarTrigger?: boolean;
}) {
  const navigate = useNavigate();

  const onLogout = () => {
    toast.message("Logged out (demo)");
    navigate("/login", { replace: true });
  };

  return (
    <header className="surface-glass sticky top-0 z-10 border-b border-border/60">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          {showSidebarTrigger && (
            <div className="block">
              <SidebarTrigger />
            </div>
          )}
          <IfuntologyMark compact />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <div className="relative">
                <Button variant="glass" size="icon" aria-label="Cart">
                  <ShoppingCart />
                </Button>
                {/* badge */}
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
          {/* Notifications dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="icon" aria-label="Notifications">
                <Bell />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 w-80 bg-popover p-2 shadow-elev">
              <DropdownMenuLabel className="px-2">Notifications</DropdownMenuLabel>
              <div className="px-2 pb-2 text-xs text-muted-foreground">Latest updates and reminders.</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 rounded-md py-2">
                <div className="text-sm font-semibold">New booking request</div>
                <div className="text-xs text-muted-foreground">A student requested a session for next week.</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 rounded-md py-2">
                <div className="text-sm font-semibold">Calendar updated</div>
                <div className="text-xs text-muted-foreground">Availability synced successfully.</div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-md">
                <Link to="/book-session" className="w-full">
                  View all
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" className="h-10 gap-2 rounded-full px-2.5" aria-label="Profile menu">
                <Avatar className="h-8 w-8 ring-1 ring-border/60">
                  <AvatarFallback className="bg-secondary text-foreground">TF</AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-semibold leading-none">Hi, {userName}!</div>
                  <div className="mt-1 text-xs leading-none text-primary">{role}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 min-w-56 bg-popover shadow-elev">
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
              <DropdownMenuItem onSelect={onLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function CartBadge() {
  const { totalCount } = useCart();
  if (!totalCount) return null;
  return (
    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-foreground">
      {totalCount}
    </div>
  );
}

function CartSheet() {
  const { items, totalAmount, updateQty, removeItem, clear } = useCart();
  const navigate = useNavigate();

  return (
    // make sure the sheet content can shrink and the inner list can scroll
    <div className="mt-4 flex h-full flex-col min-h-0">
      <div className="flex-1 space-y-3 overflow-auto min-h-0 pb-6">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Your cart is empty.</div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 rounded-md border border-border/60 p-3">
              <img src={ImageUrl(it.image ?? "product-1.png")} alt={it.title} className="h-14 w-14 rounded-md object-cover" />
              <div className="flex-1">
                <div className="font-medium">{it.title}</div>
                <div className="text-sm text-muted-foreground">{it.qty} × ${it.price.toFixed(2)}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-sm font-semibold">${(it.qty * it.price).toFixed(2)}</div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => updateQty(it.id, it.qty - 1)}>-</Button>
                  <div className="text-sm">{it.qty}</div>
                  <Button size="sm" variant="ghost" onClick={() => updateQty(it.id, it.qty + 1)}>+</Button>
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeItem(it.id)}>Remove</Button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="sticky bottom-0 bg-background border-t border-border/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-lg font-semibold">${totalAmount.toFixed(2)}</div>
        </div>
        <div className="flex gap-2">
          <SheetClose asChild>
            <Button className="flex-1" variant="accent" onClick={() => navigate("/enrichment-store/checkout")}>Checkout</Button>
          </SheetClose>
          <Button variant="outline" onClick={() => clear()}>Clear</Button>
        </div>
      </div>
    </div>
  );
}
