"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface SiteSettings {
  show_price: boolean;
  show_mrp: boolean;
  site_mode: string;
}

// Default to null so components wait for real value instead of assuming true
const SettingsContext = createContext<SiteSettings | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    // Cache-bust with timestamp so browser never serves stale settings
    fetch(`/api/settings?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {
        // On error, default to showing prices
        setSettings({ show_price: true, show_mrp: true, site_mode: "full" });
      });
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SiteSettings {
  const ctx = useContext(SettingsContext);
  // While loading, return null-safe defaults (don't assume true — wait)
  if (!ctx) return { show_price: true, show_mrp: true, site_mode: "full" };
  return ctx;
}
