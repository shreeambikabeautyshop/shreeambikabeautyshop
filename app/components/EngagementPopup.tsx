"use client";
import { useState, useEffect, useCallback } from "react";
import { FiX, FiUser, FiPhone, FiCheck, FiGift } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";

// ── Beauty tips rotation ─────────────────────────────────────────────────────
const BEAUTY_TIPS = [
  { emoji: "✨", tip: "Apply Vitamin C serum every morning before sunscreen — it fades dark spots 3x faster.", product: "Vitamin C Serums" },
  { emoji: "💄", tip: "Always set your lipstick with a thin tissue + light powder — it lasts 2x longer in Mumbai humidity.", product: "Setting Powder" },
  { emoji: "💆", tip: "Oil your hair 1 hour before washing — coconut or almond oil reduces breakage by 40%.", product: "Hair Oils" },
  { emoji: "🌟", tip: "Use a damp beauty sponge for foundation — gives a flawless, skin-like finish vs. brush.", product: "Beauty Sponges" },
  { emoji: "🧴", tip: "Never skip moisturiser even on oily skin — dehydrated skin produces MORE oil.", product: "Oil-Free Moisturiser" },
  { emoji: "👁️", tip: "Apply kajal on the waterline before mascara — eyes look bigger and more defined instantly.", product: "Waterproof Kajal" },
];

const STORAGE_KEY = "sabs_popup_seen";
const SUBMIT_KEY  = "sabs_popup_submitted";

export default function EngagementPopup() {
  const [visible,   setVisible]   = useState(false);
  const [step,      setStep]      = useState<"tip" | "form" | "success">("tip");
  const [tip,       setTip]       = useState(BEAUTY_TIPS[0]);
  const [seconds,   setSeconds]   = useState(10);
  const [name,      setName]      = useState("");
  const [phone,     setPhone]     = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // ── Pick random tip on mount ──────────────────────────
  useEffect(() => {
    setTip(BEAUTY_TIPS[Math.floor(Math.random() * BEAUTY_TIPS.length)]);
  }, []);

  // ── Show popup after 10s (only if not seen before) ───
  useEffect(() => {
    // Don't show if already submitted contact or dismissed today
    const submitted  = localStorage.getItem(SUBMIT_KEY);
    const lastSeen   = localStorage.getItem(STORAGE_KEY);
    const now        = Date.now();

    if (submitted) return; // Never show again after submitting
    if (lastSeen && now - parseInt(lastSeen) < 24 * 60 * 60 * 1000) return; // Once per day

    // Don't show on admin pages
    if (window.location.pathname.startsWith("/sabs-controller")) return;

    const timer = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  // ── Exit intent trigger ───────────────────────────────
  useEffect(() => {
    const submitted = localStorage.getItem(SUBMIT_KEY);
    if (submitted || visible || dismissed) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10) { // Mouse going to top (closing tab)
        const lastSeen = localStorage.getItem(STORAGE_KEY);
        if (!lastSeen || Date.now() - parseInt(lastSeen) > 5 * 60 * 1000) {
          setVisible(true);
          localStorage.setItem(STORAGE_KEY, String(Date.now()));
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [visible, dismissed]);

  // ── Countdown timer (shown on tip step) ──────────────
  useEffect(() => {
    if (!visible || step !== "tip") return;
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [visible, step, seconds]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setVisible(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim())         { setError("Please enter your name"); return; }
    if (phone.length < 10)    { setError("Enter valid 10-digit WhatsApp number"); return; }

    setLoading(true); setError("");

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Save lead to customers table
      await supabase.from("customers").upsert(
        { full_name: name.trim(), phone: phone.trim() },
        { onConflict: "phone", ignoreDuplicates: false }
      );

      // Also save to a leads/popup_leads table if exists
      await supabase.from("popup_leads").insert([{
        name:       name.trim(),
        phone:      phone.trim(),
        source:     "engagement_popup",
        page:       window.location.pathname,
        beauty_tip: tip.tip,
        created_at: new Date().toISOString(),
      }]).then(() => {}); // Ignore error if table doesn't exist

      // Mark as submitted — never show again
      localStorage.setItem(SUBMIT_KEY, "true");

      setStep("success");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9995] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">

        {/* ── SUCCESS ────────────────────────────────────── */}
        {step === "success" && (
          <div className="p-7 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <FiCheck size={24} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-1">
              Thank you, {name.split(" ")[0]}! 🎉
            </h3>
            <p className="text-gray-500 text-sm mb-5">
              Vinod will WhatsApp you with exclusive offers and beauty recommendations personally!
            </p>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-5 text-left">
              <p className="text-xs font-bold text-green-800 mb-2">What happens next:</p>
              <div className="space-y-1.5">
                {["Vinod will message you on WhatsApp shortly", "Get exclusive prices not listed on website", "Personal beauty recommendations for your skin"].map(t => (
                  <div key={t} className="flex items-start gap-2">
                    <FiCheck size={11} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-green-700">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleDismiss}
              className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl text-sm">
              Continue Browsing →
            </button>
          </div>
        )}

        {/* ── TIP STEP ───────────────────────────────────── */}
        {step === "tip" && (
          <>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-brand-primary via-[#C41E3A] to-[#8B0000] p-5 pb-4">
              <button onClick={handleDismiss}
                className="absolute top-3 right-3 w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
                <FiX size={14} />
              </button>

              {/* Gift badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <FiGift size={16} className="text-white" />
                </div>
                <span className="text-white/90 text-xs font-bold uppercase tracking-wider">
                  Today&apos;s Beauty Tip
                </span>
                {/* Countdown */}
                {seconds > 0 && (
                  <span className="ml-auto bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {seconds}s
                  </span>
                )}
              </div>

              <div className="text-4xl mb-2">{tip.emoji}</div>
              <p className="text-white font-semibold text-sm leading-relaxed mb-1">
                {tip.tip}
              </p>
              <p className="text-white/60 text-xs">
                — Vinod, Shree Ambika Beauty Shop Mumbai (Est. 2001)
              </p>
            </div>

            {/* Body */}
            <div className="p-5">
              {/* Product recommendation */}
              <div className="bg-brand-light border border-pink-100 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
                <span className="text-2xl">🛍</span>
                <div>
                  <p className="text-xs font-bold text-brand-primary">Recommended for you</p>
                  <p className="text-xs text-gray-600">{tip.product} — 100% original, best price</p>
                </div>
              </div>

              {/* CTA */}
              <p className="text-center text-xs text-gray-500 mb-3">
                Want <strong>personal recommendations</strong> from Vinod? Get exclusive prices not listed online!
              </p>

              <button
                onClick={() => setStep("form")}
                className="w-full bg-brand-primary hover:bg-brand-dark text-white font-black py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg">
                <FaWhatsapp size={18} />
                Get Personal Recommendations
              </button>

              <button onClick={handleDismiss}
                className="w-full text-gray-400 text-xs py-2 mt-1 hover:text-gray-600 transition-colors">
                No thanks, I&apos;ll browse on my own
              </button>
            </div>
          </>
        )}

        {/* ── FORM STEP ──────────────────────────────────── */}
        {step === "form" && (
          <>
            <div className="bg-gradient-to-r from-brand-primary to-[#C41E3A] p-5 relative">
              <button onClick={handleDismiss}
                className="absolute top-3 right-3 w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white">
                <FiX size={14} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FaWhatsapp size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-base">Quick Details</h3>
                  <p className="text-white/70 text-xs">Vinod will personally WhatsApp you</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              {/* Trust note */}
              <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 mb-4 flex items-start gap-2">
                <FiCheck size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-700">
                  <strong>100% private.</strong> Only Vinod will contact you — no spam, no sharing.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => { setName(e.target.value); setError(""); }}
                      placeholder="e.g. Priya Sharma"
                      autoFocus
                      className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center bg-gray-100 border border-gray-200 rounded-xl px-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                      +91
                    </span>
                    <div className="relative flex-1">
                      <FiPhone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                        placeholder="10-digit number"
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !name.trim() || phone.length < 10}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
                  <FaWhatsapp size={18} />
                  {loading ? "Saving..." : "Send My Details to Vinod ✓"}
                </button>

                <button type="button" onClick={() => setStep("tip")}
                  className="w-full text-gray-400 text-xs py-1 hover:text-gray-600 transition-colors">
                  ← Go back
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
