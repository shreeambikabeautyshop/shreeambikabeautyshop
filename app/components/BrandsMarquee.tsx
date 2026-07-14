"use client";

const brands = [
  { name: "MAYBELLINE", subtitle: "New York" },
  { name: "LAKMĒ", subtitle: "" },
  { name: "SUGAR", subtitle: "Cosmetics" },
  { name: "RENÉE", subtitle: "Cosmetics" },
  { name: "INSIGHT", subtitle: "Make-up Essentials" },
  { name: "6MARS", subtitle: "Cosmetics" },
  { name: "SWISS BEAUTY", subtitle: "" },
  { name: "HILARY RHODA", subtitle: "" },
  { name: "NYKAA", subtitle: "The Luxury Store" },
  { name: "plum", subtitle: "goodness that delivers" },
];

export default function BrandsMarquee() {
  return (
    <section className="py-6 bg-white border-y border-gray-100" aria-label="Top Brands">
      <div className="max-w-[1400px] mx-auto px-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex-shrink-0">
            TOP BRANDS<br />YOU TRUST
          </div>
          <div className="overflow-hidden flex-1">
            <div className="marquee-content gap-10 flex">
              {[...brands, ...brands].map((brand, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center min-w-[90px] text-center group cursor-pointer"
                >
                  <span className="font-black text-sm md:text-base text-gray-800 group-hover:text-brand-primary transition-colors leading-tight">
                    {brand.name}
                  </span>
                  {brand.subtitle && (
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest">
                      {brand.subtitle}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
