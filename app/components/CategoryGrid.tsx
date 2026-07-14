"use client";
import Link from "next/link";

const categories = [
  {
    name: "Cosmetics",
    desc: "Lipsticks, Foundation, Compact, Kajal, Nail Care & More",
    icon: "💄",
    href: "/categories/cosmetics",
    bg: "from-pink-100 to-rose-50",
  },
  {
    name: "Makeup",
    desc: "Makeup Kits, Brushes, Sponges, Eyeliner & More",
    icon: "🎨",
    href: "/categories/makeup",
    bg: "from-purple-100 to-pink-50",
  },
  {
    name: "Skin Care",
    desc: "Cleansers, Serums, Moisturizers, Sunscreen & More",
    icon: "✨",
    href: "/categories/skincare",
    bg: "from-green-50 to-emerald-50",
  },
  {
    name: "Hair Care",
    desc: "Shampoo, Conditioner, Hair Oil, Hair Mask & More",
    icon: "💆",
    href: "/categories/haircare",
    bg: "from-yellow-50 to-amber-50",
  },
  {
    name: "Body Care",
    desc: "Lotions, Body Wash, Scrub, Deodorant & More",
    icon: "🧴",
    href: "/categories/bodycare",
    bg: "from-blue-50 to-cyan-50",
  },
  {
    name: "Perfumes",
    desc: "Luxury, Premium & Long Lasting Scents",
    icon: "🌸",
    href: "/categories/perfumes",
    bg: "from-rose-100 to-pink-50",
  },
  {
    name: "Electronics",
    desc: "Hair Dryer, Straightener, Trimmer, Steamer & More",
    icon: "💅",
    href: "/categories/electronics",
    bg: "from-slate-100 to-gray-50",
  },
  {
    name: "Purses & Bags",
    desc: "Stylish Purses, Clutches, Wallets & More",
    icon: "👜",
    href: "/categories/purses-bags",
    bg: "from-orange-50 to-amber-50",
  },
  {
    name: "Wax & Accessories",
    desc: "Waxing, Strips, Accessories & More",
    icon: "🪮",
    href: "/categories/wax-accessories",
    bg: "from-indigo-50 to-purple-50",
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-10 px-4 max-w-[1400px] mx-auto" aria-labelledby="category-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="category-heading" className="text-2xl md:text-3xl font-bold text-brand-primary font-serif">
          Shop By Category
        </h2>
        <Link
          href="/categories"
          className="text-sm font-semibold text-brand-secondary hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className={`group flex flex-col items-center text-center p-3 rounded-2xl bg-gradient-to-b ${cat.bg} hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-white`}
          >
            <span
              className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            >
              {cat.icon}
            </span>
            <p className="text-xs font-bold text-gray-800 leading-tight">{cat.name}</p>
            <p className="text-[9px] text-gray-500 mt-1 leading-tight hidden md:block">{cat.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
