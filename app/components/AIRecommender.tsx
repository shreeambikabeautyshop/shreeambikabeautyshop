"use client";
import { useState } from "react";
import Image from "next/image";

export default function AIRecommender() {
  const [concern, setConcern] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!concern.trim()) return;
    setLoading(true);
    const waMsg = encodeURIComponent(
      `Hi! I need beauty product recommendations for: "${concern}"\n\nPlease suggest the best products for me. - Shree Ambika Beauty Shop`
    );
    setTimeout(() => {
      window.open(`https://wa.me/918291455297?text=${waMsg}`, "_blank");
      setLoading(false);
    }, 800);
  };

  return (
    <section
      className="relative overflow-hidden py-5"
      style={{
        background: "linear-gradient(135deg, #fff0f3 0%, #ffe4ec 40%, #fff0f3 100%)",
      }}
      aria-label="AI Beauty Product Recommender"
    >
      {/* Decorative flowers left */}
      <div className="absolute left-0 top-0 bottom-0 w-28 opacity-60 pointer-events-none select-none">
        <div className="absolute top-0 left-0 text-5xl rotate-[-20deg] translate-x-[-10px] translate-y-[-5px]">🌸</div>
        <div className="absolute top-6 left-6 text-3xl rotate-[10deg]">🌺</div>
        <div className="absolute bottom-2 left-2 text-4xl rotate-[-10deg]">🌸</div>
        <div className="absolute bottom-8 left-10 text-2xl rotate-[20deg]">🌼</div>
        <div className="absolute top-1/2 left-0 text-3xl rotate-[-5deg]">🌸</div>
      </div>

      {/* Decorative flowers right */}
      <div className="absolute right-0 top-0 bottom-0 w-28 opacity-60 pointer-events-none select-none">
        <div className="absolute top-0 right-2 text-5xl rotate-[20deg] translate-y-[-5px]">🌸</div>
        <div className="absolute top-6 right-8 text-3xl rotate-[-10deg]">🌺</div>
        <div className="absolute bottom-2 right-2 text-4xl rotate-[10deg]">🌸</div>
        <div className="absolute bottom-8 right-10 text-2xl rotate-[-20deg]">🌼</div>
        <div className="absolute top-1/2 right-0 text-3xl rotate-[5deg]">🌸</div>
      </div>

      {/* Main content */}
      <div className="max-w-[1100px] mx-auto px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-6">

          {/* LEFT — Robot + Text */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Robot image */}
            <div className="relative w-28 h-28 flex-shrink-0 drop-shadow-lg">
              <Image
                src="https://res.cloudinary.com/zjlchjal/image/upload/v1784216154/AI-model_q5uqog.png"
                alt="AI Beauty Bot"
                fill
                className="object-contain"
              />
            </div>

            {/* Text */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none mb-0.5">
                AI POWERED
              </p>
              <h2 className="text-xl font-black text-brand-primary leading-tight">
                SMART PRODUCT<br />RECOMMENDER
              </h2>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-[200px]">
                Tell us your beauty issue and get the perfect
                product recommendations for you! ✨
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-20 bg-pink-200 flex-shrink-0 mx-2" />

          {/* RIGHT — Input */}
          <div className="flex-1 w-full max-w-lg">
            <p className="text-base font-bold text-brand-primary mb-3">
              What is your beauty concern?
            </p>

            <input
              type="text"
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="E.g. Acne, Hair Fall, Dark Spots, Dry Skin..."
              className="w-full border border-pink-200 rounded-full px-5 py-3 text-sm outline-none focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(196,30,58,0.08)] transition-all bg-white mb-3"
            />

            <button
              onClick={handleSubmit}
              disabled={loading || !concern.trim()}
              className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full transition-all text-sm"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Finding best products...</>
              ) : (
                <>Get My Recommendations ✨</>
              )}
            </button>

            <p className="text-center text-xs text-brand-primary mt-2 font-medium">
              ♥ 100% Personalised • Smart • Trusted ♥
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
