import { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import HeroSlider from "@/app/components/HeroSlider";
import AIRecommender from "@/app/components/AIRecommender";
import ShopByOccasion from "@/app/components/ShopByOccasion";
import BeautyMythVsTruth from "@/app/components/BeautyMythVsTruth";
import TodayTipAndTrending from "@/app/components/TodayTipAndTrending";
import BuyingGuides from "@/app/components/BuyingGuides";
import TrendingProducts from "@/app/components/TrendingProducts";
import BestsellerProducts from "@/app/components/BestsellerProducts";
import CategoryGrid from "@/app/components/CategoryGrid";
import BrandsMarquee from "@/app/components/BrandsMarquee";
import TrustBadges from "@/app/components/TrustBadges";
import WhyChooseUs from "@/app/components/WhyChooseUs";
import SocialConnect from "@/app/components/SocialConnect";
import InstagramFeed from "@/app/components/InstagramFeed";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import Link from "next/link";
import { FiShield, FiStar, FiPackage, FiTruck } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Shree Ambika Beauty Shop Dahisar Mumbai | 500+ Brands | Same Day Delivery",
  description:
    "Dahisar East Mumbai ka #1 beauty shop since 2001. Lakme, SUGAR, Maybelline, L'Oréal — 500+ original brands. ⚡ Same-day delivery Dahisar, Borivali, Kandivali, Mira Road. 📦 COD. 💬 WhatsApp: +91 82914 55297",
  alternates: {
    canonical: "https://www.shreeambikabeauty.com",
  },
};

const trustFeatures = [
  { icon: <MdVerified size={18} />, label: "100% ORIGINAL PRODUCTS" },
  { icon: <FiStar size={18} />, label: "TOP PREMIUM BRANDS" },
  { icon: <FiPackage size={18} />, label: "BEST PRICES" },
  { icon: <FaWhatsapp size={18} />, label: "WHATSAPP ORDERING" },
  { icon: <FiTruck size={18} />, label: "FAST & SAFE DELIVERY" },
  { icon: <FiShield size={18} />, label: "SAFE TO CARE PRODUCTS" },
  { icon: <MdVerified size={18} />, label: "DEDICATED SUPPORT" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* 1. Hero Slider */}
        <HeroSlider />

        {/* 2. AI Product Recommender */}
        <AIRecommender />

        {/* 3. Shop By Occasion */}
        <ShopByOccasion />

        {/* 3. Quick Trust Strip */}
        <section className="bg-white border-b border-gray-100 py-3 px-4">
          <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {trustFeatures.map((f) => (
              <div key={f.label} className="flex items-center gap-1.5 text-gray-600">
                <span className="text-brand-primary">{f.icon}</span>
                <span className="text-xs font-semibold">{f.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Shop By Category */}
        <CategoryGrid />

        {/* 5. Top Brands Marquee */}
        <BrandsMarquee />

        {/* 7. Beauty Myth vs Truth + Why Choose */}
        <BeautyMythVsTruth />

        {/* 8. Today's Beauty Tip + What's Trending */}
        <TodayTipAndTrending />

        {/* 9. Buying Guides */}
        <BuyingGuides />

        {/* 10. Trending Products */}
        <TrendingProducts />

        {/* 10b. Bestseller Products */}
        <BestsellerProducts />

        {/* 12. Social Connect + Legacy */}
        <SocialConnect />

        {/* 13. Instagram Feed */}
        <InstagramFeed />

        {/* 14. SEO Text Block — static, crawlable by Google */}
        <section className="bg-white border-t border-gray-100 py-14 px-4">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Mumbai&apos;s Most Trusted Beauty Shop — Shree Ambika, Dahisar East
            </h2>
            <p className="text-gray-500 text-sm mb-8 max-w-3xl">
              Established in 2001, Shree Ambika Beauty Shop is your go-to destination for 100% original beauty products in Mumbai.
              Shop No. 8, Ashapura Shopping Centre, C S Complex, Road No. 2, Near Shanji Hotel, Anand Nagar, Dahisar East, Mumbai 400068.
              Owner: Vinod Goswami · WhatsApp: +91 82914 55297 · Open daily 9 AM – 10 PM.
            </p>

            {/* Shop by Category — keyword-rich internal links */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Shop by Category</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { href: "/categories/makeup",         label: "Makeup" },
                  { href: "/categories/skincare",        label: "Skin Care" },
                  { href: "/categories/haircare",        label: "Hair Care" },
                  { href: "/categories/cosmetics",       label: "Cosmetics" },
                  { href: "/categories/bodycare",        label: "Body Care" },
                  { href: "/categories/perfumes",        label: "Perfumes" },
                  { href: "/categories/nail-art",        label: "Nail Art" },
                  { href: "/categories/wax-accessories", label: "Wax & Accessories" },
                  { href: "/categories/purses-bags",     label: "Purses & Bags" },
                ].map(c => (
                  <Link key={c.href} href={c.href}
                    className="text-xs font-semibold bg-brand-light text-brand-primary px-3 py-1.5 rounded-full border border-brand-accent/30 hover:bg-brand-primary hover:text-white transition-colors">
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Delivery Locations — hyperlocal internal links */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Delivery Locations</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { href: "/dahisar-beauty-shop",       area: "Dahisar East",   note: "Store location" },
                  { href: "/borivali-beauty-shop",      area: "Borivali",       note: "5–8 km · Same day" },
                  { href: "/kandivali-beauty-shop",     area: "Kandivali",      note: "8–10 km · Same day" },
                  { href: "/malad-beauty-shop",         area: "Malad",          note: "12 km · Same day" },
                  { href: "/mira-road-beauty-delivery", area: "Mira Road",      note: "10 km · Same day" },
                  { href: "/cosmetic-shop-mumbai",      area: "All Mumbai",     note: "Pan Mumbai delivery" },
                ].map(d => (
                  <Link key={d.href} href={d.href}
                    className="bg-gray-50 hover:bg-brand-light rounded-xl p-3 border border-gray-100 hover:border-brand-accent/40 transition-colors group">
                    <p className="font-bold text-gray-800 text-xs group-hover:text-brand-primary">{d.area}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{d.note}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Brands — keyword-rich text */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Top Brands Available</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                <Link href="/products?brand=Lakme" className="text-brand-primary hover:underline font-medium">Lakme</Link>,{" "}
                <Link href="/products?brand=Maybelline" className="text-brand-primary hover:underline font-medium">Maybelline</Link>,{" "}
                <Link href="/products?brand=L%27Oreal+Professionnel" className="text-brand-primary hover:underline font-medium">L&apos;Oréal Professionnel</Link>,{" "}
                <Link href="/products?brand=SUGAR+Cosmetics" className="text-brand-primary hover:underline font-medium">SUGAR Cosmetics</Link>,{" "}
                <Link href="/products?brand=Wella" className="text-brand-primary hover:underline font-medium">Wella</Link>,{" "}
                <Link href="/products?brand=Pilgrim" className="text-brand-primary hover:underline font-medium">Pilgrim</Link>,{" "}
                <Link href="/products?brand=Insight+Professional" className="text-brand-primary hover:underline font-medium">Insight Professional</Link>,{" "}
                <Link href="/products?brand=Swiss+Beauty" className="text-brand-primary hover:underline font-medium">Swiss Beauty</Link>,{" "}
                <Link href="/products?brand=Streax+Professional" className="text-brand-primary hover:underline font-medium">Streax Professional</Link>,{" "}
                <Link href="/products?brand=Matrix" className="text-brand-primary hover:underline font-medium">Matrix</Link>,{" "}
                <Link href="/products?brand=Garnier" className="text-brand-primary hover:underline font-medium">Garnier</Link>,{" "}
                <Link href="/products?brand=Mamaearth" className="text-brand-primary hover:underline font-medium">Mamaearth</Link>,{" "}
                <Link href="/products?brand=Minimalist" className="text-brand-primary hover:underline font-medium">Minimalist</Link>,{" "}
                <Link href="/products?brand=Cetaphil" className="text-brand-primary hover:underline font-medium">Cetaphil</Link>
                {" "}and 486+ more brands — all 100% original, guaranteed.
              </p>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <Link href="/about" className="hover:text-brand-primary">About Us</Link>
              <Link href="/blog" className="hover:text-brand-primary">Beauty Blog</Link>
              <Link href="/faq" className="hover:text-brand-primary">FAQs</Link>
              <Link href="/how-to-order" className="hover:text-brand-primary">How to Order</Link>
              <Link href="/delivery" className="hover:text-brand-primary">Delivery Info</Link>
              <Link href="/wholesale" className="hover:text-brand-primary">Wholesale</Link>
              <Link href="/contact" className="hover:text-brand-primary">Contact</Link>
              <Link href="/reviews" className="hover:text-brand-primary">Customer Reviews</Link>
              <Link href="/track-order" className="hover:text-brand-primary">Track Order</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating WhatsApp button */}
      <WhatsAppFloat />
    </>
  );
}
