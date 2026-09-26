"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  images: string[];
  category: string;
  weight?: number; // kg, for shipping calc
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  has: (id: string) => boolean;
  count: number;
  totalItems: number;
  subtotal: number;
  totalWeight: number; // kg
}

const CartContext = createContext<CartContextType>({
  items: [], add: () => {}, remove: () => {}, updateQty: () => {}, clear: () => {},
  has: () => false, count: 0, totalItems: 0, subtotal: 0, totalWeight: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sabs_cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  const persist = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("sabs_cart", JSON.stringify(newItems));
  };

  const add = useCallback((item: Omit<CartItem, "qty">) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      const updated = existing
        ? prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }];
      localStorage.setItem("sabs_cart", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem("sabs_cart", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    setItems(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty } : i);
      localStorage.setItem("sabs_cart", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    localStorage.removeItem("sabs_cart");
  }, []);

  const has = useCallback((id: string) => items.some(i => i.id === id), [items]);

  const count      = items.length;
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const subtotal   = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalWeight = items.reduce((s, i) => s + (i.weight || 0.3) * i.qty, 0);

  return (
    <CartContext.Provider value={{
      items, add, remove, updateQty, clear,
      has, count, totalItems, subtotal, totalWeight,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
