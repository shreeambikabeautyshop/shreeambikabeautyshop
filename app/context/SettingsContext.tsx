"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface SiteSettings {
  show_price:        boolean;
  site_mode:         string;
  store_open:        boolean;
  show_whatsapp:     boolean;
  show_call_button:  boolean;
  cod_available:     boolean;
  same_day_delivery: boolean;
  show_reviews:      boolean;
  announcement_text: string;
}

const DEFAULT: SiteSettings = {
  show_price:        true,
  site_mode:         "full",
  store_open:        true,
  show_whatsapp:     true,
  show_call_button:  true,
  cod_available:     true,
  same_day_delivery: true,
  show_reviews:      true,
  announcement_text: "",
};

const SettingsContext = createContext<SiteSettings | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setSettings({
            show_price:        data.show_price        !== "false",
            site_mode:         data.site_mode         || "full",
            store_open:        data.store_open        !== "false",
            show_whatsapp:     data.show_whatsapp     !== "false",
            show_call_button:  data.show_call_button  !== "false",
            cod_available:     data.cod_available     !== "false",
            same_day_delivery: data.same_day_delivery !== "false",
            show_reviews:      data.show_reviews      !== "false",
            announcement_text: data.announcement_text || "",
          });
        }
      })
      .catch(() => setSettings(DEFAULT));
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SiteSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) return DEFAULT;
  return ctx;
}
