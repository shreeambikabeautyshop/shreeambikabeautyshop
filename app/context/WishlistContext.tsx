"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  mrp: number;
  images: string[];
  rating: number;
  category: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (id: string) => void;
  toggle: (item: WishlistItem) => void;
  has: (id: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [], add: () => {}, remove: () => {}, toggle: () => {}, has: () => false, count: 0,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sabs_wishlist");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (newItems: WishlistItem[]) => {
    setItems(newItems);
    localStorage.setItem("sabs_wishlist", JSON.stringify(newItems));
  };

  const add = useCallback((item: WishlistItem) => {
    setItems(prev => {
      if (prev.find(i => i.id === item.id)) return prev;
      const updated = [...prev, item];
      localStorage.setItem("sabs_wishlist", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem("sabs_wishlist", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      const updated = exists ? prev.filter(i => i.id !== item.id) : [...prev, item];
      localStorage.setItem("sabs_wishlist", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const has = useCallback((id: string) => items.some(i => i.id === id), [items]);

  return (
    <WishlistContext.Provider value={{ items, add, remove, toggle, has, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
