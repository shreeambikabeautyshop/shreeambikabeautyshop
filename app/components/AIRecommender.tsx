"use client";
import { useState } from "react";
import { FiSend } from "react-icons/fi";

export default function AIRecommender() {
  const [concern, setConcern] = useState("");

  return (
    <section className="py-10 bg-white border-y border-pink-100" aria-labelledby="ai-heading">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-brand-light via-white to-brand-light rounded-3xl p-8 shadow-sm border border-pink-100">
          {/* Robot mascot */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center shadow-lg">
              <span className="text-4xl">🤖</span>
            </div>
            <span className="text-xs text-gray-400 mt-2 font-medium">AI Beauty Bot</span>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block bg-brand-primary text-white text-xs font-bold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider">
              ✨ AI Powered Smart Product Recommender
            </div>
            <h2 id="ai-heading" className="text-xl md:text-2xl font-bold text-gray-800 mb-1 font-serif">
              What is your beauty concern?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Tell us your issue and get the perfect product recommendations for you!
            </p>

            {/* Input */}
            <div className="flex gap-2 max-w-xl">
              <input
                type="text"
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="E.g. Acne, Hair Fall, Dark Spots, Dry Skin..."
                className="flex-1 border-2 border-pink-200 focus:border-brand-primary rounded-full px-5 py-3 text-sm outline-none transition-colors"
              />
              <button
                className="bg-brand-primary hover:bg-brand-dark text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 transition-colors text-sm whitespace-nowrap"
                aria-label="Get recommendations"
              >
                <FiSend size={14} />
                Get My Recommendations →
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-3 italic">
              ❤️ 100% Personalised • Smart • Trusted ❤️
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
