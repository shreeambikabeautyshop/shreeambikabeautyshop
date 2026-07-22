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

function getUTM() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source:   params.get("utm_source")   || null,
    utm_medium:   params.get("utm_medium")   || null,
    utm_campaign: params.get("utm_campaign") || null,
  };
}

// Extract product info from product detail pages
function getProductFromPath(path: string): { product_slug: string | null; category_viewed: string | null } {
  const productMatch = path.match(/^\/products\/([^/]+)/);
  const categoryMatch = path.match(/^\/categories\/([^/]+)/);
  return {
    product_slug:    productMatch  ? productMatch[1]  : null,
    category_viewed: categoryMatch ? categoryMatch[1] : null,
  };
}

// Extract search query from URL
function getSearchQuery(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("search") || params.get("q") || null;
}

// Max scroll depth tracker
function trackScrollDepth(onUpdate: (depth: number) => void) {
  let maxDepth = 0;
  const handler = () => {
    const scrolled = window.scrollY + window.innerHeight;
    const total    = document.documentElement.scrollHeight;
    const depth    = Math.round((scrolled / total) * 100);
    if (depth > maxDepth) {
      maxDepth = depth;
      onUpdate(maxDepth);
    }
  };
  window.addEventListener("scroll", handler, { passive: true });
  return () => window.removeEventListener("scroll", handler);
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const sessionId      = useRef<string>("");
  const startTime      = useRef<number>(Date.now());
  const pagesVisited   = useRef<string[]>([]);
  const productsViewed = useRef<string[]>([]);
  const categoriesViewed = useRef<string[]>([]);
  const maxScrollDepth = useRef<number>(0);
  const initialized    = useRef(false);

  useEffect(() => {
    // Skip admin pages FIRST — before setting initialized
    if (pathname?.startsWith("/sabs-controller")) return;
    if (initialized.current) return;
    initialized.current = true;

    sessionId.current  = getSessionId();
    startTime.current  = Date.now();
    pagesVisited.current = [pathname || "/"];

    // Track product/category from first page
    const { product_slug, category_viewed } = getProductFromPath(pathname || "/");
    if (product_slug)    productsViewed.current   = [product_slug];
    if (category_viewed) categoriesViewed.current = [category_viewed];

    const utm = getUTM();
    const searchQuery = getSearchQuery();

    // Scroll depth tracking
    const removeScrollTracker = trackScrollDepth((depth) => {
      maxScrollDepth.current = depth;
    });

    const initVisitor = async () => {
      let geoData = {};
      try {
        const geo = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
        if (geo.ok) {
          const g = await geo.json();
          if (!g.error) {
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
        }
      } catch { /* geo failed */ }

      await fetch("/api/track/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action:           "start",
          session_id:       sessionId.current,
          device_type:      getDeviceType(),
          os:               getOS(),
          browser:          getBrowser(),
          screen_width:     window.screen.width,
          screen_height:    window.screen.height,
          referrer:         document.referrer || null,
          landing_page:     pathname || "/",
          is_returning:     isReturning(),
          search_query:     searchQuery,
          hour_of_visit:    new Date().getHours(),
          day_of_week:      new Date().getDay(), // 0=Sun, 6=Sat
          ...utm,
          ...geoData,
        }),
      });
    };

    initVisitor();

    // Send full data on page leave
    const handleUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      navigator.sendBeacon("/api/track/visit", JSON.stringify({
        action:             "update",
        session_id:         sessionId.current,
        pages_visited:      pagesVisited.current,
        products_viewed:    productsViewed.current,
        categories_viewed:  categoriesViewed.current,
        time_spent_seconds: timeSpent,
        max_scroll_depth:   maxScrollDepth.current,
      }));
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      removeScrollTracker();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track page navigation — capture products & categories viewed
  useEffect(() => {
    if (!initialized.current || !sessionId.current) return;
    if (pathname?.startsWith("/sabs-controller")) return;

    if (pathname && !pagesVisited.current.includes(pathname)) {
      pagesVisited.current = [...pagesVisited.current, pathname];
    }

    const { product_slug, category_viewed } = getProductFromPath(pathname || "/");
    if (product_slug && !productsViewed.current.includes(product_slug)) {
      productsViewed.current = [...productsViewed.current, product_slug];
    }
    if (category_viewed && !categoriesViewed.current.includes(category_viewed)) {
      categoriesViewed.current = [...categoriesViewed.current, category_viewed];
    }
  }, [pathname]);

  return null;
}
