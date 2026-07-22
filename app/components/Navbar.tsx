"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FiSearch, FiUser, FiMenu, FiX, FiChevronDown, FiHeart, FiMessageCircle } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useWishlist } from "@/app/context/WishlistContext";
import { useUser } from "@/app/context/UserContext";

/* ─── Wishlist badge ─── */
function WishlistIcon() {
  const { count } = useWishlist();
  return (
    <Link href="/wishlist" aria-label="Wishlist"
      className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-brand-light text-gray-600 hover:text-brand-primary transition-all">
      <FiHeart size={19} className={count > 0 ? "text-brand-primary fill-brand-primary" : ""} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-brand-primary text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

/* ─── Nav data ─── */
const NAV = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Find My Product",
    href: "/products",
    dropdown: [
      { section: "Discover", items: [
        { label: "🤖 AI Recommender",       href: "/#ai-recommender",      desc: "Get personalised picks" },
        { label: "🔍 All Products",          href: "/products",             desc: "Browse everything" },
        { label: "🔥 Trending Now",          href: "/products?filter=trending", desc: "What's hot right now" },
        { label: "⭐ Bestsellers",           href: "/products?filter=featured", desc: "Most loved by customers" },
      ]},
      { section: "Shop by Concern", items: [
        { label: "💧 Hair Fall",             href: "/products?concern=hair-fall" },
        { label: "🌿 Dry Skin",              href: "/products?concern=dry-skin" },
        { label: "✨ Dark Spots",            href: "/products?concern=dark-spots" },
        { label: "🌸 Oily Skin",             href: "/products?concern=oily-skin" },
        { label: "⏳ Anti-Ageing",           href: "/products?concern=anti-ageing" },
        { label: "💫 Frizzy Hair",           href: "/products?concern=frizzy-hair" },
      ]},
    ],
  },
  {
    label: "Categories",
    href: "/categories",
    dropdown: [
      { section: "Shop by Category", items: [
        { label: "💄 Cosmetics",             href: "/categories/cosmetics" },
        { label: "🎨 Makeup",                href: "/categories/makeup" },
        { label: "✨ Skin Care",             href: "/categories/skincare" },
        { label: "💆 Hair Care",             href: "/categories/haircare" },
        { label: "🧴 Body Care",             href: "/categories/bodycare" },
        { label: "🌸 Perfumes",              href: "/categories/perfumes" },
        { label: "💅 Electronics",           href: "/categories/electronics" },
        { label: "👜 Purses & Bags",         href: "/categories/purses-bags" },
        { label: "🪮 Wax & Accessories",     href: "/categories/wax-accessories" },
      ]},
    ],
  },
  {
    label: "Shop by Occasion",
    href: "/occasions",
    dropdown: [
      { section: "Find Your Look", items: [
        { label: "👰 Wedding",               href: "/occasions/wedding",    desc: "Bridal & lehenga looks" },
        { label: "🎉 Party",                 href: "/occasions/party",      desc: "Bold & glam" },
        { label: "💼 Office",                href: "/occasions/office",     desc: "Clean & professional" },
        { label: "☀️ Daily Use",             href: "/occasions/daily",      desc: "Natural & minimal" },
        { label: "🌙 Date Night",            href: "/occasions/date-night", desc: "Romantic & sultry" },
        { label: "🪔 Festival",              href: "/occasions/festival",   desc: "Traditional & vibrant" },
        { label: "✈️ Travel",               href: "/occasions/travel",     desc: "Light & fuss-free" },
        { label: "🎁 Gifting",              href: "/occasions/gifting",    desc: "For her & him" },
      ]},
    ],
  },
  {
    label: "Beauty Tips",
    href: "/beauty-tips",
    dropdown: [
      { section: "Learn & Glow", items: [
        { label: "💡 Today's Beauty Tip",    href: "/#beauty-tip",          desc: "Daily AI-powered tip" },
        { label: "🧴 Skin Care Tips",        href: "/beauty-tips/skin-care", desc: "Glow from within" },
        { label: "💆 Hair Care Tips",        href: "/beauty-tips/hair-care", desc: "Strong & shiny hair" },
        { label: "💄 Makeup Guides",         href: "/beauty-tips/makeup",   desc: "Step-by-step tutorials" },
        { label: "📖 Buying Guides",         href: "/beauty-tips/buying",   desc: "How to choose right" },
      ]},
    ],
  },
  {
    label: "Order Now",
    href: "/order",
    badge: "Quick",
    dropdown: [
      { section: "Place Your Order", items: [
        { label: "💬 WhatsApp Order",        href: "https://wa.me/918291455297?text=Hi Vinod! I want to order.", desc: "Fastest way to order", external: true },
        { label: "📋 How to Order",          href: "/how-to-order",         desc: "Step-by-step guide" },
        { label: "🚚 Pan India Delivery",    href: "/delivery",             desc: "We deliver everywhere" },
        { label: "📦 Track Your Order",      href: "/track-order",          desc: "Know your order status" },
        { label: "↩️ Returns & Exchange",    href: "/returns",              desc: "Hassle-free returns" },
      ]},
    ],
  },
  {
    label: "About Us",
    href: "/about",
    dropdown: [
      { section: "Know Us Better", items: [
        { label: "🏪 Our Story",             href: "/about",                desc: "Since 2001, Mumbai" },
        { label: "🌟 Legacy Since 2001",     href: "/about#legacy",         desc: "24+ years of trust" },
        { label: "💬 Customer Reviews",      href: "/about#reviews",        desc: "Real customer stories" },
        { label: "📝 Beauty Blog",           href: "/blog",                 desc: "Tips, guides & more" },
        { label: "📍 Visit Our Store",       href: "/contact",              desc: "Dahisar, Mumbai" },
        { label: "📞 Contact Us",            href: "/contact",              desc: "We're here to help" },
        { label: "❓ FAQ",                   href: "/faq",                  desc: "Common questions" },
      ]},
    ],
  },
];

/* ─── Dropdown panel ─── */
function DropdownMenu({ sections, onClose }: {
  sections: { section: string; items: { label: string; href: string; desc?: string; external?: boolean }[] }[];
  onClose: () => void;
}) {
  const colCount = sections.length === 1 && sections[0].items.length > 5 ? 2 : sections.length;
  return (
    <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 min-w-[260px] grid gap-6 animate-fade-in`}
      style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)`, width: colCount === 1 ? "260px" : colCount === 2 ? "480px" : "640px" }}>
      {sections.map((sec) => (
        <div key={sec.section}>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">{sec.section}</p>
          <div className="space-y-0.5">
            {sec.items.map((item) => (
              item.external ? (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-start gap-3 px-3 py-2 rounded-xl hover:bg-brand-light group transition-colors">
                  <span className="text-sm leading-none mt-0.5">{item.label.split(" ")[0]}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-brand-primary leading-tight">
                      {item.label.split(" ").slice(1).join(" ")}
                    </p>
                    {item.desc && <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{item.desc}</p>}
                  </div>
                </a>
              ) : (
                <Link key={item.label} href={item.href} onClick={onClose}
                  className="flex items-start gap-3 px-3 py-2 rounded-xl hover:bg-brand-light group transition-colors">
                  <span className="text-sm leading-none mt-0.5">{item.label.split(" ")[0]}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-brand-primary leading-tight">
                      {item.label.split(" ").slice(1).join(" ")}
                    </p>
                    {item.desc && <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{item.desc}</p>}
                  </div>
                </Link>
              )
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [activeNav, setActiveNav]   = useState<string | null>(null);
  const [scrolled, setScrolled]     = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname                    = usePathname();
  const router                      = useRouter();
  const { customer, isLoggedIn, triggerLogin } = useUser();
  const searchRef                   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setActiveNav(null); }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "shadow-md bg-white/95 backdrop-blur-sm" : "bg-white"}`}>

      {/* ── Announcement bar ── */}
      <div className="bg-brand-primary text-white text-[11px] py-1.5 text-center font-medium overflow-hidden">
        <div className="flex items-center justify-center gap-6 flex-wrap px-4">
          <span>⚡ Same Day Delivery in Mumbai</span>
          <span className="hidden sm:inline">🚚 Pan India 4–7 Days</span>
          <span className="hidden md:inline">🌍 Worldwide Shipping</span>
          <span className="hidden lg:inline">📦 100% Original Products</span>
          <a href="https://wa.me/918291455297" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-0.5 rounded-full transition-colors font-bold">
            <FaWhatsapp size={11} /> Order: +91-8291455297
          </a>
        </div>
      </div>

      {/* ── Main bar ── */}
      <div className="max-w-[1400px] mx-auto px-4 flex items-stretch min-h-[64px]">

        {/* LEFT 25% — Logo full height, no padding waste */}
        <div className="w-[25%] flex-shrink-0 flex items-center border-r border-gray-100">
          <Link href="/" className="block w-full h-full flex items-center pl-0">
            <div className="relative w-full h-full min-h-[64px]">
              <Image
                src="https://res.cloudinary.com/zjlchjal/image/upload/v1784563982/shree-ambika-beauty-shop-logo_wdds5i.png"
                alt="Shree Ambika Beauty Shop"
                fill
                className="object-contain object-left py-1"
                sizes="280px"
                priority
              />
            </div>
          </Link>
        </div>

        {/* RIGHT 75% — Single row: nav links + search icon + profile + wishlist */}
        <div className="flex-1 flex items-center px-4 gap-1">

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {NAV.map((item) => (
              <div key={item.label} className="relative"
                onMouseEnter={() => setActiveNav(item.label)}
                onMouseLeave={() => setActiveNav(null)}>
                <Link href={item.href}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap
                    ${pathname === item.href
                      ? "text-brand-primary bg-brand-light"
                      : "text-gray-700 hover:text-brand-primary hover:bg-brand-light"
                    }`}>
                  {item.label}
                  {item.badge && (
                    <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{item.badge}</span>
                  )}
                  {item.dropdown && (
                    <FiChevronDown size={12} className={`transition-transform duration-200 ${activeNav === item.label ? "rotate-180" : ""}`} />
                  )}
                </Link>
                {item.dropdown && activeNav === item.label && (
                  <DropdownMenu sections={item.dropdown} onClose={() => setActiveNav(null)} />
                )}
              </div>
            ))}
          </nav>

          {/* Right icons — search, profile, wishlist, mobile toggle */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
            {/* Search icon — click opens dropdown search bar below */}
            <button onClick={() => setSearchOpen(!searchOpen)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${searchOpen ? "bg-brand-light text-brand-primary" : "text-gray-600 hover:text-brand-primary hover:bg-brand-light"}`}>
              {searchOpen ? <FiX size={18} /> : <FiSearch size={18} />}
            </button>

            {/* Profile */}
            <button
              onClick={() => isLoggedIn ? router.push("/profile") : triggerLogin("wishlist")}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:text-brand-primary hover:bg-brand-light transition-all"
              aria-label="Account">
              {isLoggedIn ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">
                      {customer?.full_name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <MdVerified size={10} className="absolute -bottom-0.5 -right-0.5 text-green-500 bg-white rounded-full" />
                </>
              ) : (
                <FiUser size={18} />
              )}
            </button>

            {/* Wishlist */}
            <WishlistIcon />

            {/* Mobile toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all">
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Search dropdown — slides below header on icon click ── */}
      {searchOpen && (
        <div className="border-t border-gray-100 bg-white shadow-lg animate-fade-in">
          <div className="max-w-[1400px] mx-auto px-4 py-3">
            <form onSubmit={handleSearch}
              className="flex items-center bg-gray-100 rounded-2xl px-5 py-3 gap-3">
              <FiSearch size={18} className="text-gray-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-base text-gray-700 w-full placeholder-gray-400"
                autoFocus
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                  <FiX size={16} />
                </button>
              )}
              <button type="submit"
                className="bg-brand-primary text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-brand-dark transition-colors whitespace-nowrap">
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl max-h-[80vh] overflow-y-auto">
          {/* Mobile search */}
          <div className="px-4 pt-4 pb-2">
            <form onSubmit={handleSearch}
              className="flex items-center bg-gray-100 rounded-xl px-4 py-2.5 gap-2">
              <FiSearch size={15} className="text-gray-400" />
              <input type="text" placeholder="Search products..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm text-gray-700 w-full" />
            </form>
          </div>

          <div className="px-4 pb-4 space-y-1">
            {NAV.map((item) => (
              <div key={item.label}>
                <Link href={item.href} onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between py-3 px-3 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === item.href ? "text-brand-primary bg-brand-light" : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  <span className="flex items-center gap-2">
                    {item.label}
                    {item.badge && <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                  </span>
                  {item.dropdown && <FiChevronDown size={14} className="text-gray-400" />}
                </Link>
                {/* Mobile dropdown items */}
                {item.dropdown && (
                  <div className="pl-4 pb-1">
                    {item.dropdown.flatMap((sec) => sec.items).slice(0, 5).map((subItem) => {
                      const si = subItem as { label: string; href: string; desc?: string; external?: boolean };
                      return si.external ? (
                        <a key={si.label} href={si.href} target="_blank" rel="noopener noreferrer"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 py-1.5 px-3 text-xs text-gray-500 hover:text-brand-primary rounded-lg hover:bg-brand-light transition-colors">
                          <span>{si.label.split(" ")[0]}</span>
                          <span>{si.label.split(" ").slice(1).join(" ")}</span>
                        </a>
                      ) : (
                        <Link key={si.label} href={si.href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 py-1.5 px-3 text-xs text-gray-500 hover:text-brand-primary rounded-lg hover:bg-brand-light transition-colors">
                          <span>{si.label.split(" ")[0]}</span>
                          <span>{si.label.split(" ").slice(1).join(" ")}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile WhatsApp */}
            <a href="https://wa.me/918291455297?text=Hi Vinod! I want to order."
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold mt-3 text-sm">
              <FaWhatsapp size={18} /> SHOP ON WHATSAPP
            </a>

            {/* Login / Profile */}
            {!isLoggedIn && (
              <button onClick={() => { triggerLogin("wishlist"); setMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 border-2 border-brand-primary text-brand-primary py-2.5 rounded-xl font-bold text-sm mt-2">
                <FiUser size={16} /> Login / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
