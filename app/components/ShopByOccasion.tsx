import Link from "next/link";
import Image from "next/image";

const occasions = [
  {
    name: "Wedding",
    href: "/occasions/wedding",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221445/wedding_ro6df3.png",
  },
  {
    name: "Party",
    href: "/occasions/party",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221436/party_feyaq1.png",
  },
  {
    name: "Office",
    href: "/occasions/office",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221435/office_c55njk.png",
  },
  {
    name: "Daily Use",
    href: "/occasions/daily",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221435/daily_use_csbkl7.png",
  },
  {
    name: "Date Night",
    href: "/occasions/date-night",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221435/Date-night_gr0fui.png",
  },
  {
    name: "Festival",
    href: "/occasions/festival",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221437/festival_vh2wqu.png",
  },
  {
    name: "Travel",
    href: "/occasions/travel",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221444/travel_qsaz0d.png",
  },
  {
    name: "Gifting",
    href: "/occasions/gifting",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221435/birthday-anniversary_v0546l.png",
  },
];

export default function ShopByOccasion() {
  return (
    <section
      className="py-8"
      style={{ background: "linear-gradient(135deg, #fff0f3 0%, #fce8ee 50%, #fff0f3 100%)" }}
      aria-labelledby="occasion-heading"
    >
      <div className="max-w-[1400px] mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-brand-gold text-xl" style={{ fontFamily: "serif" }}>❧</span>
            <div className="h-px w-14 bg-gradient-to-r from-transparent to-brand-gold/50" />
          </div>
          <h2
            id="occasion-heading"
            className="text-sm font-bold tracking-[0.3em] uppercase text-brand-primary whitespace-nowrap"
          >
            SHOP BY OCCASION
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-px w-14 bg-gradient-to-l from-transparent to-brand-gold/50" />
            <span className="text-brand-gold text-xl" style={{ fontFamily: "serif" }}>❧</span>
          </div>
        </div>

        {/* 8 Occasion Cards */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 mb-7">
          {occasions.map((occ) => (
            <Link
              key={occ.name}
              href={occ.href}
              className="group flex flex-col items-center gap-2.5"
            >
              {/* Card */}
              <div
                className="w-full rounded-2xl bg-white border border-pink-100 shadow-sm 
                  group-hover:shadow-lg group-hover:-translate-y-1.5 
                  transition-all duration-300 overflow-hidden relative"
                style={{ aspectRatio: "3/4" }}
              >
                <Image
                  src={occ.img}
                  alt={occ.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 25vw, 12.5vw"
                />
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
