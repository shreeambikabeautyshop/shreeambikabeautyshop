import Link from "next/link";
import Image from "next/image";

const occasions = [
  {
    name: "Wedding",
    href: "/occasions/wedding",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221445/wedding_ro6df3.png",
    tag: "Bridal & Lehenga Looks",
  },
  {
    name: "Party",
    href: "/occasions/party",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221436/party_feyaq1.png",
    tag: "Bold & Glam",
  },
  {
    name: "Office",
    href: "/occasions/office",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221435/office_c55njk.png",
    tag: "Clean & Professional",
  },
  {
    name: "Daily Use",
    href: "/occasions/daily",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221435/daily_use_csbkl7.png",
    tag: "Natural & Minimal",
  },
  {
    name: "Date Night",
    href: "/occasions/date-night",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221435/Date-night_gr0fui.png",
    tag: "Romantic & Sultry",
  },
  {
    name: "Festival",
    href: "/occasions/festival",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221437/festival_vh2wqu.png",
    tag: "Traditional & Vibrant",
  },
  {
    name: "Travel",
    href: "/occasions/travel",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221444/travel_qsaz0d.png",
    tag: "Light & Fuss-free",
  },
  {
    name: "Gifting",
    href: "/occasions/gifting",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221435/birthday-anniversary_v0546l.png",
    tag: "For Her & Him",
  },
];

export default function ShopByOccasion() {
  return (
    <section
      className="py-14"
      style={{ background: "linear-gradient(135deg, #fff0f3 0%, #fce8ee 50%, #fff0f3 100%)" }}
      aria-labelledby="occasion-heading"
    >
      <div className="max-w-[1400px] mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="flex items-center gap-2">
            <span className="text-brand-gold text-xl" style={{ fontFamily: "serif" }}>❧</span>
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-brand-gold/50" />
          </div>
          <div className="text-center">
            <h2
              id="occasion-heading"
              className="text-base font-bold tracking-[0.3em] uppercase text-brand-primary whitespace-nowrap"
            >
              SHOP BY OCCASION
            </h2>
            <p className="text-xs text-gray-400 mt-1 tracking-wide">Find the perfect look for every moment</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-brand-gold/50" />
            <span className="text-brand-gold text-xl" style={{ fontFamily: "serif" }}>❧</span>
          </div>
        </div>

        {/* 8 Occasion Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-5 mb-10">
          {occasions.map((occ) => (
            <Link
              key={occ.name}
              href={occ.href}
              className="group flex flex-col items-center gap-3"
            >
              {/* Image Card */}
              <div
                className="w-full rounded-2xl overflow-hidden relative shadow-md
                  group-hover:shadow-xl group-hover:-translate-y-2
                  transition-all duration-300 border-2 border-transparent group-hover:border-brand-primary/40"
                style={{ aspectRatio: "3/4" }}
              >
                <Image
                  src={occ.img}
                  alt={occ.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 12.5vw"
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Tag chip on hover */}
                <div className="absolute bottom-2 left-0 right-0 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="block text-center text-[9px] font-semibold text-white leading-tight truncate">
                    {occ.tag}
                  </span>
                </div>
              </div>

              {/* Label */}
              <span className="text-xs font-bold text-gray-700 group-hover:text-brand-primary transition-colors text-center leading-tight">
                {occ.name}
              </span>
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/occasions"
            className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-semibold px-12 py-3 rounded-full transition-all text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5"
          >
            Explore All Occasions →
          </Link>
        </div>

      </div>
    </section>
  );
}
