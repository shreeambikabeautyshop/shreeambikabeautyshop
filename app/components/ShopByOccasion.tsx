import Link from "next/link";

const occasions = [
  { name: "Wedding", href: "/occasions/wedding", emoji: "👰", bg: "from-rose-100 to-pink-50", shadow: "shadow-rose-100" },
  { name: "Party", href: "/occasions/party", emoji: "💃", bg: "from-purple-100 to-pink-50", shadow: "shadow-purple-100" },
  { name: "Office", href: "/occasions/office", emoji: "👩‍💼", bg: "from-blue-50 to-indigo-50", shadow: "shadow-blue-100" },
  { name: "Daily Use", href: "/occasions/daily", emoji: "☀️", bg: "from-amber-50 to-yellow-50", shadow: "shadow-yellow-100" },
  { name: "Date Night", href: "/occasions/date-night", emoji: "🌹", bg: "from-red-50 to-rose-50", shadow: "shadow-red-100" },
  { name: "Festival", href: "/occasions/festival", emoji: "🪔", bg: "from-orange-100 to-amber-50", shadow: "shadow-orange-100" },
  { name: "Travel", href: "/occasions/travel", emoji: "✈️", bg: "from-slate-100 to-gray-50", shadow: "shadow-slate-100" },
  { name: "Gifting", href: "/occasions/gifting", emoji: "🎁", bg: "from-pink-100 to-fuchsia-50", shadow: "shadow-pink-100" },
];

export default function ShopByOccasion() {
  return (
    <section
      className="py-8"
      style={{ background: "linear-gradient(135deg, #fff0f3 0%, #fce8ee 50%, #fff0f3 100%)" }}
      aria-labelledby="occasion-heading"
    >
      <div className="max-w-[1400px] mx-auto px-6">

        {/* Header — exact match with decorative lines */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-brand-gold text-xl" style={{ fontFamily: "serif" }}>❧</span>
            <div className="h-px w-14 bg-gradient-to-r from-transparent to-brand-gold/40" />
          </div>
          <h2
            id="occasion-heading"
            className="text-base font-bold tracking-[0.3em] uppercase text-brand-primary whitespace-nowrap"
          >
            SHOP BY OCCASION
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-px w-14 bg-gradient-to-l from-transparent to-brand-gold/40" />
            <span className="text-brand-gold text-xl" style={{ fontFamily: "serif" }}>❧</span>
          </div>
        </div>

        {/* 8 Occasion Cards */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-7">
          {occasions.map((occ) => (
            <Link
              key={occ.name}
              href={occ.href}
              className="group flex flex-col items-center gap-2"
            >
              {/* Card — portrait aspect ratio like reference */}
              <div
                className={`w-full rounded-2xl bg-gradient-to-b ${occ.bg} border border-white 
                  shadow-md ${occ.shadow} group-hover:shadow-xl group-hover:-translate-y-1.5 
                  transition-all duration-300 flex items-center justify-center overflow-hidden`}
                style={{ aspectRatio: "3/4" }}
              >
                <span
                  className="text-5xl group-hover:scale-110 transition-transform duration-300 select-none"
                  role="img"
                  aria-label={occ.name}
                >
                  {occ.emoji}
                </span>
              </div>
              {/* Label */}
              <span className="text-xs font-semibold text-gray-600 group-hover:text-brand-primary transition-colors text-center leading-tight">
                {occ.name}
              </span>
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/occasions"
            className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-semibold px-10 py-2.5 rounded-full transition-all text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Explore All Occasions →
          </Link>
        </div>
      </div>
    </section>
  );
}
