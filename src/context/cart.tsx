import React, { useEffect, useState } from "react";
import { CartContext, CartItem } from "./cart.store";

const STORAGE_KEY = "ifuntology_cart";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // If writing to localStorage fails (quota, disabled, etc.) keep app functional and log the error for debugging
      console.warn("Failed to persist cart to localStorage:", e);
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  const clear = () => setItems([]);

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));
  };

  const totalCount = items.reduce((s, it) => s + it.qty, 0);
  const totalAmount = items.reduce((s, it) => s + it.qty * it.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, updateQty, totalCount, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
