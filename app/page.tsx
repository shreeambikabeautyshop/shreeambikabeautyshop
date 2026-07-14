import Navbar from "@/app/components/Navbar";
import HeroSlider from "@/app/components/HeroSlider";
import CategoryGrid from "@/app/components/CategoryGrid";
import BrandsMarquee from "@/app/components/BrandsMarquee";
import TrustBadges from "@/app/components/TrustBadges";
import WhyChooseUs from "@/app/components/WhyChooseUs";
import SocialConnect from "@/app/components/SocialConnect";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import { FiShield, FiStar, FiPackage, FiTruck } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

const trustFeatures = [
  { icon: <MdVerified size={20} />, label: "100% ORIGINAL PRODUCTS" },
  { icon: <FiStar size={20} />, label: "TOP PREMIUM BRANDS" },
  { icon: <FiPackage size={20} />, label: "BEST PRICES" },
  { icon: <FaWhatsapp size={20} />, label: "WHATSAPP ORDERING" },
  { icon: <FiTruck size={20} />, label: "FAST & SAFE DELIVERY" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* 1. Hero Slider */}
        <HeroSlider />

        {/* 2. Quick Trust Strip */}
        <section className="bg-white border-b border-gray-100 py-3 px-4">
          <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-center gap-6">
            {trustFeatures.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-gray-600">
                <span className="text-brand-primary">{f.icon}</span>
                <span className="text-xs font-semibold">{f.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Category Grid */}
        <CategoryGrid />

        {/* 4. Brands Marquee */}
        <BrandsMarquee />

        {/* 5. Why Choose Us */}
        <WhyChooseUs />

        {/* 6. Social Connect + Legacy */}
        <SocialConnect />

        {/* 7. Trust Badges / Stats Bar */}
        <TrustBadges />
      </main>

      <Footer />

      {/* Floating WhatsApp button */}
      <WhatsAppFloat />
    </>
  );
}
