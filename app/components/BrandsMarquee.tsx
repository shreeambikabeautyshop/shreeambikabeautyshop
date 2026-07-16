"use client";

const brands = [
  { name: "MAYBELLINE", sub: "NEW YORK", style: "font-black tracking-tight text-gray-800" },
  { name: "LAKMĒ", sub: "", style: "font-black tracking-wider text-gray-800 italic" },
  { name: "SUGAR", sub: "COSMETICS", style: "font-black text-gray-800" },
  { name: "RENÉE", sub: "COSMETICS", style: "font-black italic text-gray-800" },
  { name: "INSIGHT", sub: "Make-up Essentials", style: "font-black text-gray-800" },
  { name: "6MARS", sub: "Cosmetics", style: "font-black text-gray-800" },
  { name: "SWISS BEAUTY", sub: "", style: "font-black tracking-wide text-gray-700" },
  { name: "HILARY", sub: "RHODA", style: "font-black text-gray-800" },
  { name: "NYKAA", sub: "THE LUXURY STORE", style: "font-black text-pink-600" },
  { name: "plum", sub: "goodness that delivers", style: "font-black text-green-700 italic" },
];

export default function BrandsMarquee() {
  const doubled = [...brands, ...brands, ...brands];

  return (
    <section
      className="py-6 border-t border-pink-100"
      style={{ background: "linear-gradient(135deg, #fff8f9 0%, #fff0f3 100%)" }}
      aria-label="Top Brands"
    >
      <div className="max-w-[1400px] mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-brand-primary/30" />
            <span className="text-brand-primary/40 text-sm">❧</span>
          </div>
          <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-brand-primary">
            TOP BRANDS YOU LOVE
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-brand-primary/40 text-sm">❧</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-brand-primary/30" />
          </div>
        </div>

        {/* Marquee */}
        <div className="overflow-hidden">
          <div
            className="flex items-center gap-12"
            style={{
              animation: "marquee-brands 30s linear infinite",
              width: "max-content",
            }}
          >
            {doubled.map((brand, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center min-w-[100px] group cursor-pointer select-none"
              >
                <span
                  className={`text-sm ${brand.style} group-hover:text-brand-primary transition-colors leading-tight`}
                >
                  {brand.name}
                </span>
                {brand.sub && (
                  <span className="text-[9px] tracking-widest text-gray-400 uppercase leading-none mt-0.5">
                    {brand.sub}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-brands {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}
