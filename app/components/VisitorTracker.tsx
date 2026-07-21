"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return "mobile";
  return "desktop";
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  return "Other";
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  return "Other";
}

function getSessionId(): string {
  let sid = sessionStorage.getItem("sabs_sid");
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem("sabs_sid", sid);
  }
  return sid;
}

function isReturning(): boolean {
  const visited = localStorage.getItem("sabs_visited");
  if (!visited) {
    localStorage.setItem("sabs_visited", "1");
    return false;
  }
  return true;
}

// Parse UTM params
function getUTM() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source:   params.get("utm_source")   || null,
    utm_medium:   params.get("utm_medium")   || null,
    utm_campaign: params.get("utm_campaign") || null,
  };
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const sessionId = useRef<string>("");
  const startTime = useRef<number>(Date.now());
  const pagesVisited = useRef<string[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Skip admin pages
    if (pathname?.startsWith("/sabs-controller")) return;

    sessionId.current = getSessionId();
    startTime.current = Date.now();
    pagesVisited.current = [pathname || "/"];

    const utm = getUTM();

    // Fire start event — get geo from ipapi.co (free, no key needed)
    const initVisitor = async () => {
      let geoData = {};
      try {
        const geo = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
        if (geo.ok) {
          const g = await geo.json();
          geoData = {
            country:      g.country_name,
            country_code: g.country_code,
            region:       g.region,
            city:         g.city,
            latitude:     g.latitude,
            longitude:    g.longitude,
            timezone:     g.timezone,
            isp:          g.org,
          };
        }
      } catch { /* geo failed, still track without it */ }

      await fetch("/api/track/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action:       "start",
          session_id:   sessionId.current,
          device_type:  getDeviceType(),
          os:           getOS(),
          browser:      getBrowser(),
          screen_width: window.screen.width,
          screen_height: window.screen.height,
          referrer:     document.referrer || null,
          landing_page: pathname || "/",
          is_returning: isReturning(),
          ...utm,
          ...geoData,
        }),
      });
    };

    initVisitor();

    // Update on unload
    const handleUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      navigator.sendBeacon("/api/track/visit", JSON.stringify({
        action:             "update",
        session_id:         sessionId.current,
        pages_visited:      pagesVisited.current,
        time_spent_seconds: timeSpent,
      }));
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track page changes
  useEffect(() => {
    if (!initialized.current || !sessionId.current) return;
    if (pathname?.startsWith("/sabs-controller")) return;
    if (pathname && !pagesVisited.current.includes(pathname)) {
      pagesVisited.current = [...pagesVisited.current, pathname];
    }
  }, [pathname]);

  return null;
}
