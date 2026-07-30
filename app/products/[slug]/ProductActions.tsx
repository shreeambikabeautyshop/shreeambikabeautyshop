"use client";
import { useState } from "react";
import { FaWhatsapp, FaVideo } from "react-icons/fa";
import { FiMinus, FiPlus, FiShield, FiCamera, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { MdVerified, MdPayment } from "react-icons/md";
import { useUser } from "@/app/context/UserContext";
import { useSettings } from "@/app/context/SettingsContext";

interface Props {
  productName: string;
  price: number;
  mrp: number;
  slug: string;
}

export default function ProductActions({ productName, price, mrp, slug }: Props) {
  const [qty, setQty]               = useState(1);
  const [showHowItWorks, setShow]   = useState(false);
  const { customer, isLoggedIn, triggerLogin } = useUser();
  const { show_price, show_mrp }    = useSettings();

  // WhatsApp message — clear order intent with product URL
  const orderMsg = encodeURIComponent(
    `Hi Vinod! 🛍️ I want to order:\n\n` +
    `*Product:* ${productName}\n` +
    `*Qty:* ${qty}\n` +
    `*Link:* https://www.shreeambikabeauty.com/products/${slug}\n\n` +
    `Please confirm availability, final price & payment details.`
  );

  // Video call request message
  const videoCallMsg = encodeURIComponent(
    `Hi Vinod! 📹 I want to see *${productName}* on a video call before ordering.\n\nAre you available for a quick call?`
  );

  const trackClick = () => {
    if (!isLoggedIn) return;
    const data = JSON.stringify({
      product_id: slug, product_name: productName,
      product_price: price,
      customer_name: customer?.full_name || null,
      customer_phone: customer?.phone || null,
      source: "product_detail", page_url: window.location.href,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track/whatsapp", new Blob([data], { type: "application/json" }));
    }
  };

  return (
    <div className="flex flex-col gap-3">

      {/* ── Price block ─────────────────────────────────── */}
      <div className="flex items-end gap-3 bg-gray-50 rounded-xl px-4 py-3">
        {show_price ? (
          <div>
            <p className="text-xs text-gray-500 font-medium">Our Price</p>
            <p className="text-4xl font-black text-gray-900 leading-none">
              <span className="text-xl font-normal">₹</span>{price.toLocaleString("en-IN")}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-500 font-medium">Price</p>
            <span className="text-sm text-brand-primary font-semibold bg-brand-light px-3 py-1.5 rounded-full inline-block mt-1">
              WhatsApp for Price
            </span>
          </div>
        )}
        {show_price && show_mrp && mrp > price && (
          <div className="pb-1">
            <p className="text-xs text-gray-400">MRP</p>
            <p className="text-sm text-gray-400 line-through">₹{mrp.toLocaleString("en-IN")}</p>
          </div>
        )}
        {show_price && mrp > price && (
          <div className="ml-auto pb-1">
            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Save ₹{(mrp - price).toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      {/* ── Quantity ─────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-700">Quantity</span>
        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <FiMinus size={14} />
          </button>
          <span className="w-10 text-center text-sm font-black text-gray-800">{qty}</span>
          <button onClick={() => setQty(q => q + 1)}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <FiPlus size={14} />
          </button>
        </div>
        {qty > 1 && show_price && (
          <span className="text-xs text-gray-500">
            Total: <span className="font-bold text-gray-900">₹{(price * qty).toLocaleString("en-IN")}</span>
          </span>
        )}
      </div>

      {/* ── How it works — collapsible trust box ─────────── */}
      <button
        onClick={() => setShow(p => !p)}
        className="flex items-center justify-between w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-left"
      >
        <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
          <FiShield size={13} className="text-amber-600" />
          How ordering works — 100% safe, no advance risk
        </span>
        {showHowItWorks
          ? <FiChevronUp size={14} className="text-amber-600 flex-shrink-0" />
          : <FiChevronDown size={14} className="text-amber-600 flex-shrink-0" />}
      </button>

      {showHowItWorks && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 -mt-1 space-y-2.5">
          {/* Step 1 */}
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">1</span>
            <div>
              <p className="text-xs font-bold text-gray-800">WhatsApp karo — order confirm karo</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">Vinod product availability & final price confirm karega. Koi advance nahi — pehle confirm, phir payment.</p>
            </div>
          </div>
          {/* Step 2 */}
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">2</span>
            <div>
              <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                <MdPayment size={12} className="text-amber-600" />
                Payment karo — screenshot bhejo
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                UPI / GPay / PhonePe / NEFT se payment karo.<br />
                <strong className="text-gray-700">Payment ka screenshot Vinod ko WhatsApp pe bhejo</strong> — tabhi order confirm hoga. Screenshot = proof of payment.
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {["GPay", "PhonePe", "Paytm", "UPI", "NEFT", "COD"].map(m => (
                  <span key={m} className="text-[10px] bg-white border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-medium">{m}</span>
                ))}
              </div>
            </div>
          </div>
          {/* Step 3 */}
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">3</span>
            <div>
              <p className="text-xs font-bold text-gray-800">Order dispatch — tracking link milega</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">Mumbai — same day. Pan India — 4–7 days. Shiprocket se ship hoga, WhatsApp pe tracking milega.</p>
            </div>
          </div>
          {/* Payment proof note */}
          <div className="bg-white border border-amber-300 rounded-lg px-3 py-2 flex gap-2 items-start mt-1">
            <FiCamera size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Important:</strong> Order confirm hone ke liye payment screenshot WhatsApp pe bhejना zaruri hai. Bina screenshot ke order dispatch nahi hoga.
            </p>
          </div>
          {/* Video call offer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex gap-2 items-start">
            <FaVideo size={12} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-800 leading-relaxed">
              <strong>Doubt hai product ke baare mein?</strong> Vinod se video call pe physically store mein product dikhwao — bilkul free. Neeche &quot;Video Call Request&quot; button click karo.
            </p>
          </div>
        </div>
      )}

      {/* ── Buy on WhatsApp — Primary CTA ───────────────── */}
      <a href={`https://wa.me/918291455297?text=${orderMsg}`}
        onClick={trackClick}
        target="_blank" rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-3 text-white font-bold py-4 rounded-2xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
        <span className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
          animation: "shine-sweep 2.5s ease-in-out infinite",
          backgroundSize: "200% 100%",
        }} />
        <FaWhatsapp size={22} className="relative z-10" />
        <div className="relative z-10 text-left">
          <p className="font-black text-base leading-tight">Order on WhatsApp</p>
          <p className="text-xs opacity-80">Vinod confirms → You pay → Done ✓</p>
        </div>
      </a>

      {/* ── Secondary CTAs row ───────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        {/* Video Call */}
        <a href={`https://wa.me/918291455297?text=${videoCallMsg}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 border-2 border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100 font-semibold py-3 rounded-xl transition-colors text-xs">
          <FaVideo size={14} />
          <span>Video Call<br /><span className="font-normal opacity-70">See store live</span></span>
        </a>

        {/* Wishlist */}
        <button
          onClick={() => triggerLogin("wishlist")}
          className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 font-semibold py-3 rounded-xl transition-colors text-xs">
          <span className="text-base">🤍</span>
          <span>Save to<br /><span className="font-normal opacity-70">Wishlist</span></span>
        </button>
      </div>

      {/* ── India-only trust strip ───────────────────────── */}
      <div className="flex items-center justify-center gap-4 pt-1">
        <span className="flex items-center gap-1 text-[10px] text-gray-400">
          <MdVerified size={11} className="text-green-500" /> 100% Original
        </span>
        <span className="flex items-center gap-1 text-[10px] text-gray-400">
          🇮🇳 Pan India Delivery
        </span>
        <span className="flex items-center gap-1 text-[10px] text-gray-400">
          💰 COD Available
        </span>
      </div>
    </div>
  );
}
