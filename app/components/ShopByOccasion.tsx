import Link from "next/link";

const occasions = [
  { name: "Wedding", icon: "💍", href: "/occasions/wedding" },
  { name: "Party", icon: "🎉", href: "/occasions/party" },
  { name: "Office", icon: "💼", href: "/occasions/office" },
  { name: "Daily Use", icon: "☀️", href: "/occasions/daily" },
  { name: "Date Night", icon: "🌹", href: "/occasions/date-night" },
  { name: "Festival", icon: "🪔", href: "/occasions/festival" },
  { name: "Travel", icon: "✈️", href: "/occasions/travel" },
  { name: "Gifting", icon: "🎁", href: "/occasions/gifting" },
];

export default function ShopByOccasion() {
  return (
    <section className="py-10 bg-brand-light" aria-labelledby="occasion-heading">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-px flex-1 bg-brand-primary/20" />
          <h2 id="occasion-heading" className="text-xl md:text-2xl font-bold text-brand-primary font-serif text-center whitespace-nowrap">
            ✦ SHOP BY OCCASION ✦
          </h2>
          <div className="h-px flex-1 bg-brand-primary/20" />
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mt-6">
          {occasions.map((occ) => (
            <Link
              key={occ.name}
              href={occ.href}
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-md flex items-center justify-center text-2xl group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 border-2 border-transparent group-hover:border-brand-accent">
                {occ.icon}
              </div>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-brand-primary transition-colors text-center">
                {occ.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/occasions"
            className="inline-block border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-semibold px-8 py-2.5 rounded-full transition-all text-sm"
          >
            Explore All Occasions →
          </Link>
        </div>
      </div>
    </section>
  );
}
