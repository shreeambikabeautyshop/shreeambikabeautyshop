import Link from "next/link";

const trendingLooks = [
  { name: "Glass Skin Routine", icon: "✨", tag: "Trending" },
  { name: "Korean Makeup Look", icon: "🌸", tag: "Hot" },
  { name: "Peptide Serums Are In", icon: "💧", tag: "New" },
  { name: "Lip Oils", icon: "💄", tag: "Viral" },
  { name: "Hair Gloss Treatment", icon: "💫", tag: "Popular" },
  { name: "Minimal Makeup", icon: "🌿", tag: "Trending" },
];

export default function TodayTipAndTrending() {
  return (
    <section className="py-10 bg-brand-light" aria-label="Beauty Tips and Trending">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">

          {/* Today's Beauty Tip */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-pink-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">☀️</span>
              <h2 className="text-lg font-bold text-brand-primary font-serif">
                TODAY&apos;S BEAUTY TIP
              </h2>
            </div>
            <div className="flex gap-5 items-start">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700 mb-2 leading-relaxed">
                  Never skip sunscreen! It prevents more than 80% of ageing, pigmentation & sun damage.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Use SPF 30 or higher every day, even indoors.
                </p>
                <Link
                  href="/beauty-tips"
                  className="inline-block mt-4 bg-brand-primary text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-brand-dark transition-colors"
                >
                  Explore Beauty Tips →
                </Link>
              </div>
              <div className="w-20 h-20 flex-shrink-0 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center text-4xl shadow-sm">
                🧴
              </div>
            </div>
          </div>

          {/* What's Trending Today */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-pink-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <h2 className="text-lg font-bold text-brand-primary font-serif">
                  WHAT&apos;S TRENDING TODAY?
                </h2>
              </div>
              <Link href="/trending" className="text-xs font-semibold text-brand-secondary hover:underline">
                Show All →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {trendingLooks.map((item, idx) => (
                <Link
                  key={idx}
                  href="/trending"
                  className="group flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-brand-light hover:bg-pink-100 transition-colors"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-[10px] font-semibold text-gray-700 leading-tight">{item.name}</span>
                  <span className="text-[9px] bg-brand-primary text-white px-2 py-0.5 rounded-full font-bold">
                    {item.tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
