import { createContext, useContext } from "react";

export type CartItem = {
  id: string;
  title: string;
  price: number; // store as number for calculations
  qty: number;
  image?: string;
};

export type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  updateQty: (id: string, qty: number) => void;
  totalCount: number;
  totalAmount: number;
};

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
