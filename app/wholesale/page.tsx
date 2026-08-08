import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import { FaWhatsapp } from "react-icons/fa";
import { FiCheck, FiTruck, FiPackage, FiPhone, FiStar } from "react-icons/fi";
import { MdVerified, MdLocalShipping } from "react-icons/md";

export const metadata: Metadata = {
  title: "Wholesale & Retail Beauty Products Mumbai | Bulk Orders | Shree Ambika Beauty Shop",
  description: "Buy wholesale & retail beauty products from Shree Ambika Beauty Shop Dahisar Mumbai. Bulk discounts on cosmetics, haircare, skincare. Free home delivery Pan India above ₹999. WhatsApp: +918291455297",
  alternates: { canonical: "https://www.shreeambikabeauty.com/wholesale" },
  openGraph: {
    title: "Wholesale & Retail Beauty Products | Shree Ambika Beauty Shop Mumbai",
    description: "Bulk orders & retail — Lakme, L'Oreal, SUGAR, Wella & 500+ brands. Free delivery Pan India. WhatsApp Vinod: +918291455297",
    url: "https://www.shreeambikabeauty.com/wholesale",
  },
};

const waRetail  = encodeURIComponent("Hi Vinod! I want to place a retail order. Please help me with product suggestions and pricing.");
const waWholesale = encodeURIComponent("Hi Vinod! I am interested in wholesale/bulk purchase. Please share the wholesale price list and minimum order details.");

const retailBenefits = [
  { icon: "🛍️", title: "Single Piece Available", desc: "No minimum order — buy even 1 product at retail price" },
  { icon: "🚚", title: "Free Delivery Pan India", desc: "Free home delivery on orders above ₹999. All India coverage" },
  { icon: "✅", title: "100% Original Products", desc: "All products sourced directly from authorized distributors" },
  { icon: "💰", title: "Best Retail Prices", desc: "Competitive pricing — you will not find cheaper original products" },
  { icon: "📦", title: "Same Day Mumbai Delivery", desc: "Order before 12 PM — delivered same evening in Mumbai" },
  { icon: "💬", title: "WhatsApp Ordering", desc: "Simply WhatsApp Vinod — no complicated checkout process" },
];

const wholesaleBenefits = [
  { icon: "📦", title: "Bulk Discounts", desc: "Buy 6+ units of any product and get special wholesale pricing" },
  { icon: "🏪", title: "For Salons & Shops", desc: "Professional pricing for beauty salons, parlours, and retailers" },
  { icon: "🔄", title: "Regular Supply", desc: "Consistent stock of all major brands — L'Oreal, Wella, Schwarzkopf" },
  { icon: "💳", title: "Credit Available", desc: "Regular wholesale customers get credit facility on request" },
  { icon: "🚚", title: "Bulk Delivery", desc: "Free delivery on bulk orders above ₹2000 anywhere in India" },
  { icon: "📋", title: "Custom Price List", desc: "Get a customized price list based on your product requirements" },
];

const deliveryInfo = [
  { zone: "Mumbai (Same Day)", time: "Order before 12 PM → Same evening", charge: "Free above ₹999 / ₹60 below", icon: "⚡" },
  { zone: "Thane / Navi Mumbai", time: "Next day delivery", charge: "Free above ₹999 / ₹80 below", icon: "📦" },
  { zone: "Maharashtra", time: "2–4 business days", charge: "Free above ₹999 / ₹90 below", icon: "🚚" },
  { zone: "Pan India", time: "4–7 business days", charge: "Free above ₹999 / ₹99 below", icon: "🇮🇳" },
  { zone: "Wholesale Bulk", time: "Negotiable with order", charge: "Free above ₹2000", icon: "🏪" },
];

export default function WholesalePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-brand-primary text-white py-12 px-4 relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="max-w-[900px] mx-auto text-center relative">
            <nav className="text-xs text-white/60 mb-5 text-left">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Wholesale & Retail</span>
            </nav>
            <div className="flex items-center justify-center gap-2 mb-3">
              <MdLocalShipping size={28} className="text-white/80" />
              <MdVerified size={22} className="text-green-300" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif mb-3">Wholesale & Retail</h1>
            <p className="text-white/80 text-base mb-2">Mumbai's trusted beauty distributor since 2001</p>
            <p className="text-white/70 text-sm mb-6">
              500+ brands · 100% Original · Free Home Delivery Pan India · Bulk Discounts Available
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={`https://wa.me/918291455297?text=${waRetail}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-7 py-3.5 rounded-full transition-colors">
                <FaWhatsapp size={18} /> Retail Order
              </a>
              <a href={`https://wa.me/918291455297?text=${waWholesale}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-7 py-3.5 rounded-full border border-white/30 transition-colors">
                <FiPackage size={18} /> Wholesale Enquiry
              </a>
            </div>
          </div>
        </div>

        {/* Free Delivery Banner */}
        <div className="bg-green-600 text-white py-3 px-4">
          <div className="max-w-[900px] mx-auto flex items-center justify-center gap-2 text-sm font-bold">
            <FiTruck size={16} />
            🎉 FREE HOME DELIVERY on orders above ₹999 — Pan India · All Brands · 100% Original
            <FiTruck size={16} />
          </div>
        </div>

        <div className="max-w-[900px] mx-auto px-4 py-10 space-y-10">

          {/* Retail vs Wholesale cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Retail */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-brand-primary to-[#e05a8a] px-6 py-5 text-white">
                <h2 className="text-xl font-bold mb-1">🛍️ Retail Customer</h2>
                <p className="text-white/80 text-sm">Single piece / small orders</p>
              </div>
              <div className="p-6 space-y-3">
                {retailBenefits.map((b) => (
                  <div key={b.title} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 leading-tight">{b.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{b.title}</p>
                      <p className="text-xs text-gray-500">{b.desc}</p>
                    </div>
                  </div>
                ))}
                <a href={`https://wa.me/918291455297?text=${waRetail}`} target="_blank" rel="noopener noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl transition-colors">
                  <FaWhatsapp size={16} /> Order Now — Retail
                </a>
              </div>
            </div>

            {/* Wholesale */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-6 py-5 text-white">
                <h2 className="text-xl font-bold mb-1">🏪 Wholesale / Bulk</h2>
                <p className="text-white/80 text-sm">Salons, parlours, shops, resellers</p>
              </div>
              <div className="p-6 space-y-3">
                {wholesaleBenefits.map((b) => (
                  <div key={b.title} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 leading-tight">{b.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{b.title}</p>
                      <p className="text-xs text-gray-500">{b.desc}</p>
                    </div>
                  </div>
                ))}
                <a href={`https://wa.me/918291455297?text=${waWholesale}`} target="_blank" rel="noopener noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-2xl transition-colors">
                  <FiPackage size={16} /> Wholesale Enquiry
                </a>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              <FiTruck className="text-brand-primary" /> Free Home Delivery — Pan India
            </h2>
            <div className="space-y-3">
              {deliveryInfo.map((d) => (
                <div key={d.zone} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                  <span className="text-2xl flex-shrink-0">{d.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{d.zone}</p>
                    <p className="text-xs text-gray-500">{d.time}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${d.charge.startsWith("Free") ? "bg-green-100 text-green-700" : "bg-orange-50 text-orange-600"}`}>
                      {d.charge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              * Delivery via Shiprocket / Delhivery / Blue Dart. Tracking link sent on WhatsApp after dispatch.
            </p>
          </div>

          {/* Popular brands */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Brands Available</h2>
            <p className="text-sm text-gray-500 mb-5">Both retail & wholesale available for all brands</p>
            <div className="flex flex-wrap gap-2">
              {["Lakme","Maybelline","L'Oreal","SUGAR","Wella","Schwarzkopf","Inoa","Majirel","Streax","Cetaphil","Berina","IK","Rica","Raaga","O3+","BBLUNT","Matrix","Pilgrim","Mamaearth","WOW","Biotique","Plum","Minimalist","Neutrogena","Garnier","Himalaya","Vega","Braun","Osis","Floractive"].map((brand) => (
                <span key={brand} className="text-xs bg-brand-light text-brand-primary border border-brand-accent px-3 py-1.5 rounded-full font-semibold">
                  {brand}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-brand-primary rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">Ready to Order?</h2>
            <p className="text-white/80 text-sm mb-6">
              WhatsApp Vinod directly — share the product name, quantity, and delivery address.
              <br />We confirm availability, price, and delivery timeline within minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={`https://wa.me/918291455297?text=${waRetail}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-full">
                <FaWhatsapp size={18} /> +91 82914 55297
              </a>
              <Link href="/products" className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-3.5 rounded-full border border-white/30">
                Browse Products →
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
