"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const categories = [
  { name: "Cosmetics", href: "/categories/cosmetics" },
  { name: "Makeup", href: "/categories/makeup" },
  { name: "Skin Care", href: "/categories/skincare" },
  { name: "Hair Care", href: "/categories/haircare" },
  { name: "Body Care", href: "/categories/bodycare" },
  { name: "Perfumes", href: "/categories/perfumes" },
  { name: "Electronics", href: "/categories/electronics" },
  { name: "Purses & Bags", href: "/categories/purses-bags" },
  { name: "Wax & Accessories", href: "/categories/wax-accessories" },
];

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Brands", href: "/brands" },
  { name: "Offers", href: "/offers", badge: "Hot" },
  { name: "Beauty Tips", href: "/beauty-tips" },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "shadow-lg bg-white" : "bg-white"
      }`}
    >
      {/* Top announcement bar */}
      <div className="bg-brand-primary text-white text-xs py-1.5 text-center font-medium tracking-wide">
        🎉 Free Delivery on Orders Above ₹499 | 100% Original Products Guaranteed
      </div>

      {/* Main navbar */}
      <nav className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 relative">
              <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs font-serif">SA</span>
              </div>
            </div>
            <div className="hidden sm:block leading-none">
              <p className="text-brand-primary font-bold text-sm font-serif">श्री अम्बिका</p>
              <p className="text-xs text-gray-500 tracking-widest">BEAUTY SHOP</p>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-5 text-sm font-medium">
          {navLinks.map((link) =>
            link.name === "Home" ? (
              <Link
                key={link.name}
                href={link.href}
                className="text-brand-primary border-b-2 border-brand-primary pb-0.5"
              >
                {link.name}
              </Link>
            ) : (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-700 hover:text-brand-primary transition-colors relative group"
              >
                {link.name}
                {link.badge && (
                  <span className="absolute -top-2 -right-6 bg-red-500 text-white text-[9px] px-1 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          )}

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-1 text-gray-700 hover:text-brand-primary transition-colors"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              Categories <FiChevronDown className={`transition-transform ${catOpen ? "rotate-180" : ""}`} />
            </button>
            {catOpen && (
              <div
                className="absolute top-full left-0 bg-white shadow-xl border border-gray-100 rounded-lg py-2 w-52 z-50"
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
              >
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-light hover:text-brand-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xs xl:max-w-sm items-center bg-gray-100 rounded-full px-4 py-2 gap-2">
          <FiSearch className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700 w-full placeholder-gray-400"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20order%20beauty%20products"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
          >
            <FaWhatsapp className="text-base" />
            SHOP ON WHATSAPP
          </a>

          <button aria-label="Account" className="p-2 text-gray-600 hover:text-brand-primary transition-colors">
            <FiUser size={20} />
          </button>
          <button aria-label="Cart" className="p-2 text-gray-600 hover:text-brand-primary transition-colors relative">
            <FiShoppingCart size={20} />
            <span className="absolute top-0 right-0 bg-brand-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </button>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3 text-sm font-medium shadow-lg">
          {/* Mobile search */}
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2 mb-2">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search for products..."
              className="bg-transparent outline-none text-sm text-gray-700 w-full"
            />
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-700 hover:text-brand-primary py-1 border-b border-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
              {link.badge && (
                <span className="ml-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}

          <div className="mt-1">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Categories</p>
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="block text-gray-700 hover:text-brand-primary py-1.5 pl-2 border-b border-gray-50 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-brand-primary text-white py-3 rounded-full font-semibold mt-2"
          >
            <FaWhatsapp className="text-lg" />
            SHOP ON WHATSAPP
          </a>
        </div>
      )}
    </header>
  );
}
