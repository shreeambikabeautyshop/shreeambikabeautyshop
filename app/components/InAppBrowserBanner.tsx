"use client";
import { useEffect, useState } from "react";
import { FiExternalLink, FiX } from "react-icons/fi";

/**
 * InAppBrowserBanner
 * Shows a banner when user opens the site inside Facebook/Instagram in-app browser.
 * These browsers are slow, restricted, and cause 99% bounce rate.
 * Guides user to open in real Chrome/Safari.
 */
export default function InAppBrowserBanner() {
  const [show, setShow] = useState(false);
  const [url, setUrl]   = useState("");

  useEffect(() => {
    const ua = navigator.userAgent || "";
    // Detect Facebook, Instagram, Threads in-app browsers
    const isInApp =
      ua.includes("FBAN") ||   // Facebook app
      ua.includes("FBAV") ||   // Facebook app
      ua.includes("Instagram") ||
      ua.includes("FB_IAB") ||
      ua.includes("FB4A") ||
      ua.includes("FBIOS") ||
      ua.includes("musical_ly") || // TikTok
      ua.includes("BytedanceWebview");

    if (isInApp) {
      setShow(true);
      setUrl(window.location.href);
    }
  }, []);

  if (!show) return null;

  const copyAndOpen = () => {
    navigator.clipboard?.writeText(url).catch(() => {});
    // On Android, this opens in Chrome
    window.location.href = "intent://" + url.replace(/^https?:\/\//, "") + "#Intent;scheme=https;package=com.android.chrome;end";
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-brand-primary text-white px-4 py-3 shadow-xl">
      <div className="max-w-[600px] mx-auto flex items-center gap-3">
        <FiExternalLink size={18} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold leading-tight">
            For best experience, open in Chrome browser
          </p>
          <p className="text-white/70 text-[10px]">
            In-app browsers may load slowly
          </p>
        </div>
        <button
          onClick={copyAndOpen}
          className="bg-white text-brand-primary text-xs font-black px-3 py-1.5 rounded-lg flex-shrink-0">
          Open →
        </button>
        <button onClick={() => setShow(false)} className="text-white/60 flex-shrink-0">
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
}
