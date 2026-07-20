"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface SiteSettings {
  show_price: boolean;
  show_mrp: boolean;
}

const SettingsContext = createContext<SiteSettings>({ show_price: true, show_mrp: true });

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({ show_price: true, show_mrp: true });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
