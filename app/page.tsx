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
import { FiShield, FiStar, FiPackage, FiTruck } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

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

        {/* 11. Why Choose Us (full section with comparison) */}
        <WhyChooseUs />

        {/* 12. Social Connect + Legacy */}
        <SocialConnect />

        {/* 13. Trust Badges / Stats Bar */}
        <TrustBadges />

        {/* 14. Instagram Feed */}
        <InstagramFeed />
      </main>

      <Footer />

      {/* Floating WhatsApp button */}
      <WhatsAppFloat />
    </>
  );
}
