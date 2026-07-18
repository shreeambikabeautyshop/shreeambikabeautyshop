"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface Customer {
  id?: string;
  full_name: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface UserContextType {
  customer: Customer | null;
  isLoggedIn: boolean;
  saveCustomer: (c: Customer) => void;
  clearCustomer: () => void;
  showLoginModal: boolean;
  pendingAction: "wishlist" | "order" | null;
  triggerLogin: (action: "wishlist" | "order") => void;
  cancelLogin: () => void;
}

const UserContext = createContext<UserContextType>({
  customer: null, isLoggedIn: false,
  saveCustomer: () => {}, clearCustomer: () => {},
  showLoginModal: false, pendingAction: null,
  triggerLogin: () => {}, cancelLogin: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"wishlist" | "order" | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sabs_customer");
      if (saved) setCustomer(JSON.parse(saved));
    } catch {}
  }, []);

  const saveCustomer = useCallback((c: Customer) => {
    setCustomer(c);
    localStorage.setItem("sabs_customer", JSON.stringify(c));
    setShowLoginModal(false);
    setPendingAction(null);
  }, []);

  const clearCustomer = useCallback(() => {
    setCustomer(null);
    localStorage.removeItem("sabs_customer");
  }, []);

  const triggerLogin = useCallback((action: "wishlist" | "order") => {
    setPendingAction(action);
    setShowLoginModal(true);
  }, []);

  const cancelLogin = useCallback(() => {
    setShowLoginModal(false);
    setPendingAction(null);
  }, []);

  return (
    <UserContext.Provider value={{
      customer, isLoggedIn: !!customer,
      saveCustomer, clearCustomer,
      showLoginModal, pendingAction,
      triggerLogin, cancelLogin,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
