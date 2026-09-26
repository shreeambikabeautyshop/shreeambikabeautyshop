"use client";
import { useEffect, useState } from "react";
import {
  FiSettings, FiSave, FiToggleLeft, FiToggleRight,
  FiEye, FiEyeOff, FiGlobe, FiShoppingBag, FiMessageSquare,
  FiStar, FiTruck, FiPhone,
} from "react-icons/fi";
import { MdVerified, MdStorefront, MdNotifications } from "react-icons/md";

// ── Types ──────────────────────────────────────────────────────────────────
interface Settings {
  // Visibility
  show_price:        string; // show selling price
  site_mode:         string; // "full" | "home_only"
  // Store
  store_open:        string; // show "Open Now" badge
  show_whatsapp:     string; // show floating WhatsApp button
  show_call_button:  string; // show call button on mobile
  // Orders
  cod_available:     string; // show COD badge on products
  same_day_delivery: string; // show "Same Day Delivery" badge
  // Social proof
  show_reviews:      string; // show reviews section
  // Announcements
  announcement_text: string; // top banner text (empty = hidden)
}

const DEFAULT: Settings = {
  show_price:        "true",
  site_mode:         "full",
  store_open:        "true",
  show_whatsapp:     "true",
  show_call_button:  "true",
  cod_available:     "true",
  same_day_delivery: "true",
  show_reviews:      "true",
  announcement_text: "",
};

// ── Toggle Component ───────────────────────────────────────────────────────
function Toggle({
  label, desc, value, onChange, color = "green",
}: {
  label: string; desc: string; value: boolean;
  onChange: (v: boolean) => void; color?: "green" | "blue" | "orange" | "red";
}) {
  const colors = {
    green:  "bg-green-500 hover:bg-green-600",
    blue:   "bg-blue-500 hover:bg-blue-600",
    orange: "bg-orange-500 hover:bg-orange-600",
    red:    "bg-red-500 hover:bg-red-600",
  };
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex-1 mr-4">
        <p className="font-semibold text-gray-800 text-sm">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
          value ? `${colors[color]} text-white` : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
      >
        {value ? <><FiToggleRight size={15} /> ON</> : <><FiToggleLeft size={15} /> OFF</>}
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) setSettings((prev) => ({ ...prev, ...data }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (key: keyof Settings) => (v: boolean) =>
    setSettings((prev) => ({ ...prev, [key]: v ? "true" : "false" }));

  const save = async () => {
    setSaving(true);
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value }),
        })
      )
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const bool = (key: keyof Settings) => settings[key] === "true";

  if (loading) {
    return (
      <div className="max-w-2xl space-y-3">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center">
          <FiSettings size={20} className="text-brand-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Site Settings</h1>
          <p className="text-gray-500 text-sm">Control what customers see on the website</p>
        </div>
      </div>

      <div className="space-y-6 mb-8">

        {/* ── 1. Price Display ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FiShoppingBag size={15} className="text-brand-primary" />
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Price Display</h2>
          </div>
          <div className="space-y-2">
            <Toggle
              label="Show Selling Price"
              desc="Display ₹299 on product cards and pages. Turn OFF to hide prices (customers WhatsApp to ask)"
              value={bool("show_price")}
              onChange={toggle("show_price")}
              color="green"
            />
            {!bool("show_price") && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-xs text-orange-700">
                ⚠️ Prices are hidden. Customers will see <strong>&quot;WhatsApp for Price&quot;</strong> on all products.
              </div>
            )}
          </div>
        </section>

        {/* ── 2. Store Status ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <MdStorefront size={15} className="text-brand-primary" />
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Store Status</h2>
          </div>
          <div className="space-y-2">
            <Toggle
              label="Store Open Badge"
              desc='Show green "Open Now" badge on homepage. Turn OFF on holidays.'
              value={bool("store_open")}
              onChange={toggle("store_open")}
              color="green"
            />
            <Toggle
              label="Same Day Delivery Badge"
              desc='Show "Same Day Delivery" badge on product cards'
              value={bool("same_day_delivery")}
              onChange={toggle("same_day_delivery")}
              color="blue"
            />
            <Toggle
              label="COD Available Badge"
              desc='Show "Cash on Delivery" badge on product pages'
              value={bool("cod_available")}
              onChange={toggle("cod_available")}
              color="blue"
            />
          </div>
        </section>

        {/* ── 3. Contact Buttons ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FiPhone size={15} className="text-brand-primary" />
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Contact Buttons</h2>
          </div>
          <div className="space-y-2">
            <Toggle
              label="Floating WhatsApp Button"
              desc='Show the green floating "Order on WhatsApp" button on all pages'
              value={bool("show_whatsapp")}
              onChange={toggle("show_whatsapp")}
              color="green"
            />
            <Toggle
              label="Call Button (Mobile)"
              desc='Show "Call Now" button on mobile devices'
              value={bool("show_call_button")}
              onChange={toggle("show_call_button")}
              color="green"
            />
          </div>
        </section>

        {/* ── 4. Social Proof ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FiStar size={15} className="text-brand-primary" />
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Social Proof</h2>
          </div>
          <div className="space-y-2">
            <Toggle
              label="Show Customer Reviews"
              desc='Display reviews section on homepage and product pages'
              value={bool("show_reviews")}
              onChange={toggle("show_reviews")}
              color="blue"
            />
          </div>
        </section>

        {/* ── 5. Announcement Banner ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <MdNotifications size={15} className="text-brand-primary" />
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Announcement Banner</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-800 mb-1">Top Banner Text</p>
            <p className="text-xs text-gray-400 mb-3">Shows a scrolling banner at top of site. Leave empty to hide.</p>
            <input
              type="text"
              value={settings.announcement_text}
              onChange={(e) => setSettings((p) => ({ ...p, announcement_text: e.target.value }))}
              placeholder="e.g. 🎉 Diwali Sale — 20% OFF all orders above ₹999! WhatsApp: +91 82914 55297"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary transition-colors"
            />
            {settings.announcement_text && (
              <div className="mt-3 bg-brand-primary text-white text-xs font-semibold px-4 py-2 rounded-xl">
                Preview: {settings.announcement_text}
              </div>
            )}
          </div>
        </section>

        {/* ── 6. Site Mode ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FiGlobe size={15} className="text-brand-primary" />
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Site Mode</h2>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
            <p className="text-xs text-gray-500 mb-3">
              <strong className="text-red-600">Home Only mode</strong> — only homepage is accessible. All other pages redirect to home. Use while setting up or during maintenance.
            </p>
            <Toggle
              label="Full Site (All pages visible)"
              desc={
                settings.site_mode === "home_only"
                  ? "⚠️ MAINTENANCE MODE — only homepage is live"
                  : "All pages accessible normally"
              }
              value={settings.site_mode !== "home_only"}
              onChange={(v) => setSettings((p) => ({ ...p, site_mode: v ? "full" : "home_only" }))}
              color={settings.site_mode === "home_only" ? "red" : "green"}
            />
          </div>
        </section>

      </div>

      {/* Save Button */}
      <button
        onClick={save}
        disabled={saving}
        className={`flex items-center gap-2 font-bold px-8 py-3.5 rounded-xl transition-all text-sm shadow-sm ${
          saved
            ? "bg-green-500 text-white"
            : "bg-brand-primary hover:bg-brand-dark text-white"
        } disabled:opacity-60`}
      >
        {saving ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
        ) : saved ? (
          <><MdVerified size={16} /> Settings Saved!</>
        ) : (
          <><FiSave size={15} /> Save Settings</>
        )}
      </button>

    </div>
  );
}
