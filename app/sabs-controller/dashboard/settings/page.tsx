"use client";
import { useEffect, useState } from "react";
import { FiToggleLeft, FiToggleRight, FiSettings, FiSave } from "react-icons/fi";

interface Settings {
  show_price: string;
  show_mrp: string;
}

function Toggle({ label, desc, value, onChange }: {
  label: string; desc: string;
  value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div>
        <p className="font-bold text-gray-800">{label}</p>
        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
          value
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        }`}
      >
        {value
          ? <><FiToggleRight size={18} /> ON</>
          : <><FiToggleLeft size={18} /> OFF</>
        }
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings]   = useState<Settings>({ show_price: "true", show_mrp: "true" });
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(({ data }) => { if (data) setSettings(data as Settings); setLoading(false); });
  }, []);

  const update = (key: keyof Settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value ? "true" : "false" }));
  };

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

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <FiSettings size={22} className="text-brand-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Site Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Control what customers see on the website</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          <div className="bg-brand-light rounded-2xl p-4 border border-brand-accent/30 mb-6">
            <p className="text-sm font-semibold text-brand-primary">💡 Price Display Settings</p>
            <p className="text-xs text-gray-500 mt-1">
              Turn off prices if you want customers to contact you for pricing (e.g. during a sale or when prices change).
            </p>
          </div>

          <Toggle
            label="Show Selling Price"
            desc="Display the selling price (₹599) on product cards and product pages"
            value={settings.show_price === "true"}
            onChange={(v) => update("show_price", v)}
          />

          <Toggle
            label="Show MRP / Original Price"
            desc="Display the MRP with strikethrough (₹799) and discount % to show savings"
            value={settings.show_mrp === "true"}
            onChange={(v) => update("show_mrp", v)}
          />
        </div>
      )}

      <button
        onClick={save}
        disabled={saving || loading}
        className={`flex items-center gap-2 font-bold px-8 py-3 rounded-xl transition-all text-sm ${
          saved
            ? "bg-green-500 text-white"
            : "bg-brand-primary hover:bg-brand-dark text-white"
        } disabled:opacity-60`}
      >
        {saving ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
        ) : saved ? (
          <>✓ Settings Saved!</>
        ) : (
          <><FiSave size={15} /> Save Settings</>
        )}
      </button>
    </div>
  );
}
