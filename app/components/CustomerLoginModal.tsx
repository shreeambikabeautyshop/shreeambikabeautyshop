"use client";
import { useState } from "react";
import { useUser, Customer } from "@/app/context/UserContext";
import { FiX, FiUser, FiPhone, FiMail, FiMapPin, FiShield, FiCheck } from "react-icons/fi";
import { FaWhatsapp, FaHeart } from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";

type Step = "phone" | "details" | "success";

export default function CustomerLoginModal() {
  const { showLoginModal, cancelLogin, saveCustomer, pendingAction } = useUser();
  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedCustomer, setSavedCustomer] = useState<Customer | null>(null);

  const [phone, setPhone] = useState("");
  const [form, setForm] = useState({
    full_name: "", email: "", address: "", city: "", state: "", pincode: "",
  });

  if (!showLoginModal) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) { setError("Enter valid 10-digit phone number"); return; }
    setLoading(true); setError("");
    try {
      const { data } = await supabase.from("customers").select("*").eq("phone", phone).maybeSingle();
      if (data) {
        // Returning customer — show success then close
        setSavedCustomer(data as Customer);
        setStep("success");
        saveCustomer(data as Customer);
      } else {
        setStep("details");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) { setError("Please enter your full name"); return; }
    if (!form.address.trim()) { setError("Please enter your address"); return; }
    setLoading(true); setError("");
    try {
      const customer: Customer = {
        full_name: form.full_name.trim(),
        phone,
        email: form.email.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
      };
      const { data, error: dbErr } = await supabase
        .from("customers").insert([customer]).select().single();
      if (dbErr) throw dbErr;
      const saved = { ...customer, id: data?.id };
      setSavedCustomer(saved);
      saveCustomer(saved);
      setStep("success");
    } catch {
      setError("Could not save details. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    // Reset for next time
    setStep("phone");
    setPhone("");
    setForm({ full_name: "", email: "", address: "", city: "", state: "", pincode: "" });
    setSavedCustomer(null);
    cancelLogin();
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* ── SUCCESS SCREEN ─────────────────────────────── */}
        {step === "success" && (
          <div className="p-8 text-center">
            {/* Green check animation */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                <FiCheck size={28} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Welcome, {savedCustomer?.full_name?.split(" ")[0]}! 🎉
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Your account is ready.
            </p>

            {/* Info box */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 text-left space-y-1.5">
              <p className="text-xs font-bold text-green-800 mb-2">Your order will include:</p>
              {[
                `Name: ${savedCustomer?.full_name}`,
                `Phone: ${savedCustomer?.phone}`,
                savedCustomer?.address ? `Address: ${savedCustomer.address}${savedCustomer.city ? `, ${savedCustomer.city}` : ""}` : null,
              ].filter(Boolean).map((line) => (
                <div key={line} className="flex items-start gap-2">
                  <FiCheck size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-green-700">{line}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mb-5">
              No need to fill this again — your details auto-save for every future order.
            </p>

            <button
              onClick={handleSuccessClose}
              className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FaWhatsapp size={16} />
              Continue to Place Order
            </button>
          </div>
        )}

        {/* ── LOGIN / DETAILS SCREENS ─────────────────────── */}
        {step !== "success" && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 pt-6 pb-5 relative">
              <button onClick={cancelLogin}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
                <FiX size={16} />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  {pendingAction === "wishlist"
                    ? <FaHeart size={18} className="text-white" />
                    : <FaWhatsapp size={18} className="text-white" />}
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">
                    {step === "phone" ? "Quick Login" : "Your Details"}
                  </h2>
                  <p className="text-white/70 text-xs">
                    {pendingAction === "wishlist" ? "Save favourites across devices" : "For faster WhatsApp orders"}
                  </p>
                </div>
              </div>
              <div className="bg-white/15 rounded-xl px-4 py-2.5 flex items-start gap-2">
                <FiShield size={14} className="text-white/80 flex-shrink-0 mt-0.5" />
                <p className="text-white/90 text-xs leading-relaxed">
                  {pendingAction === "order"
                    ? <>Login once so Vinod knows <strong>who you are</strong> — name, address & phone auto-fill in every WhatsApp order. No more typing! ⚡</>
                    : <>Your details are <strong>100% safe & private</strong>. Never used for promotions.</>
                  }
                </p>
              </div>
            </div>

            <div className="px-6 py-5">
              {/* Step 1 — Phone */}
              {step === "phone" && (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <span className="flex items-center bg-gray-100 border border-gray-200 rounded-xl px-3 text-sm font-medium text-gray-600">+91</span>
                      <div className="relative flex-1">
                        <FiPhone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="tel" maxLength={10} value={phone}
                          onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                          placeholder="Enter 10-digit number"
                          className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary transition-colors"
                          autoFocus required />
                      </div>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                  </div>
                  <button type="submit" disabled={loading || phone.length < 10}
                    className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                    {loading ? "Checking..." : "Continue →"}
                  </button>
                  <p className="text-center text-xs text-gray-400">
                    New user? We&apos;ll ask for your details once.
                  </p>
                </form>
              )}

              {/* Step 2 — Details */}
              {step === "details" && (
                <form onSubmit={handleDetailsSubmit} className="space-y-3">
                  <p className="text-xs text-gray-500 bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <FiCheck size={12} className="text-green-500" />
                    Phone +91 {phone} — Fill details once, auto-save forever
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FiUser size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={form.full_name}
                        onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                        placeholder="Your full name"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                    <div className="relative">
                      <FiMail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FiMapPin size={13} className="absolute left-3 top-3 text-gray-400" />
                      <textarea value={form.address}
                        onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                        placeholder="Flat/House No, Street, Area..."
                        rows={2}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-primary resize-none" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                      placeholder="City" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-primary" />
                    <input type="text" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                      placeholder="State" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-primary" />
                    <input type="text" maxLength={6} value={form.pincode}
                      onChange={e => setForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, "") }))}
                      placeholder="Pincode" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-primary" />
                  </div>
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setStep("phone")}
                      className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                      ← Back
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 bg-brand-primary hover:bg-brand-dark text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm">
                      {loading ? "Saving..." : "Save & Continue ✓"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
