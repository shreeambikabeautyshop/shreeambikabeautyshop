import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Delivery Information | Shree Ambika Beauty Shop Mumbai",
  description:
    "Delivery details for Shree Ambika Beauty Shop — same day in Mumbai, next day Thane/Navi Mumbai, 4–7 days Pan India, 10–15 days international. Free delivery on orders above ₹999 in Mumbai.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/delivery" },
  openGraph: {
    title: "Delivery Information | Shree Ambika Beauty Shop Mumbai",
    description:
      "Same day delivery in Mumbai, Pan India in 4–7 days, worldwide shipping. Track via WhatsApp. Free delivery above ₹999 in Mumbai.",
    url: "https://www.shreeambikabeauty.com/delivery",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

const deliveryZones = [
  {
    zone: "Mumbai",
    emoji: "⚡",
    time: "Same Day Delivery",
    details: "Order before 2:00 PM",
    price: "Free above ₹999",
    note: "Delivered within 6–8 hours",
    color: "bg-green-50 border-green-200",
    badge: "bg-green-500",
    badgeText: "Fastest",
  },
  {
    zone: "Thane & Navi Mumbai",
    emoji: "🚗",
    time: "Next Day Delivery",
    details: "Order anytime today",
    price: "₹50 flat",
    note: "Delivered within 24 hours",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-500",
    badgeText: "Next Day",
  },
  {
    zone: "Pan India",
    emoji: "🚚",
    time: "4–7 Working Days",
    details: "All states & union territories",
    price: "₹80–₹120",
    note: "Via DTDC, Blue Dart, India Post",
    color: "bg-purple-50 border-purple-200",
    badge: "bg-purple-500",
    badgeText: "Pan India",
  },
  {
    zone: "International",
    emoji: "✈️",
    time: "10–15 Days",
    details: "Worldwide shipping available",
    price: "Contact for rates",
    note: "WhatsApp to confirm charges",
    color: "bg-orange-50 border-orange-200",
    badge: "bg-orange-500",
    badgeText: "Worldwide",
  },
];

const couriers = [
  { name: "DTDC", emoji: "📦", desc: "Pan India coverage" },
  { name: "Blue Dart", emoji: "🔵", desc: "Express delivery" },
  { name: "India Post", emoji: "📮", desc: "Remote areas" },
  { name: "Self Delivery", emoji: "🛵", desc: "Mumbai same-day" },
];

const freeDeliveryItems = [
  "Orders above ₹999 in Mumbai get free same-day delivery",
  "Orders above ₹1,499 in Thane & Navi Mumbai get free next-day delivery",
  "For Pan India, enjoy discounted shipping on bulk orders — WhatsApp to enquire",
];

const faqs = [
  {
    q: "What happens if I'm not home during delivery?",
    a: "Our delivery agent will call you before arriving. If you're unavailable, the package will be re-attempted the next day or held for pickup.",
  },
  {
    q: "How do I track my order?",
    a: "Simply WhatsApp Vinod at +918291455297 with your order number. He'll share the tracking link or real-time update.",
  },
  {
    q: "Can I change my delivery address after ordering?",
    a: "Yes, if your order hasn't been dispatched yet. WhatsApp us immediately at +918291455297 to update the address.",
  },
  {
    q: "Is same-day delivery available on Sundays?",
    a: "Yes! We deliver 7 days a week including Sundays and public holidays. Order before 2 PM for same-day Mumbai delivery.",
  },
];

export default function DeliveryPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-brand-primary text-white py-14 px-4">
          <div className="max-w-[1200px] mx-auto">
            <nav className="text-xs text-white/60 mb-4">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Delivery Information</span>
            </nav>
            <h1 className="text-4xl font-heading italic text-white mb-3">Delivery Information</h1>
            <p className="text-white/80 text-base max-w-lg">
              We deliver beauty products across Mumbai, Pan India, and worldwide. Fast, reliable, and trackable.
            </p>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-4 py-14">

          {/* Delivery Zones */}
          <div className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Delivery Zones & Timelines</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {deliveryZones.map((zone) => (
                <div
                  key={zone.zone}
                  className={`${zone.color} border-2 rounded-3xl p-6 relative overflow-hidden`}
                >
                  <span
                    className={`absolute top-4 right-4 ${zone.badge} text-white text-[10px] font-bold px-2.5 py-1 rounded-full`}
                  >
                    {zone.badgeText}
                  </span>
                  <span className="text-4xl block mb-3">{zone.emoji}</span>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{zone.zone}</h3>
                  <p className="font-black text-lg text-gray-900 mb-1">{zone.time}</p>
                  <p className="text-sm text-gray-600 mb-3">{zone.details}</p>
                  <div className="border-t border-gray-200 pt-3 mt-3 space-y-1">
                    <p className="text-xs font-semibold text-gray-700">
                      💰 Shipping: <span className="text-brand-primary">{zone.price}</span>
                    </p>
                    <p className="text-xs text-gray-500">{zone.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Free Delivery Banner */}
          <div className="bg-brand-primary rounded-3xl p-7 mb-14 text-white">
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0">🎁</span>
              <div>
                <h3 className="font-bold text-xl mb-3">Free Delivery Offer</h3>
                <ul className="space-y-2">
                  {freeDeliveryItems.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/90">
                      <span className="text-brand-accent flex-shrink-0 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Delivery Partners */}
          <div className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Delivery Partners</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {couriers.map((c) => (
                <div
                  key={c.name}
                  className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all"
                >
                  <span className="text-4xl block mb-2">{c.emoji}</span>
                  <p className="font-bold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Track Order */}
          <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-7 mb-14">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-xl mb-2">📍 Track Your Order</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  After your order is dispatched, you&apos;ll receive the tracking number via WhatsApp. You can also message Vinod anytime to get a real-time update on your delivery status.
                </p>
              </div>
              <a
                href="https://wa.me/918291455297?text=Hi Vinod! I want to track my order. My order number is:"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all"
              >
                💬 Track via WhatsApp
              </a>
            </div>
          </div>

          {/* Delivery FAQs */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Delivery FAQs</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 text-sm mb-2">🔸 {faq.q}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm mb-4">Questions about delivery? WhatsApp us directly.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/918291455297?text=Hi Vinod! I have a question about delivery."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-all"
              >
                💬 WhatsApp Vinod
              </a>
              <Link
                href="/how-to-order"
                className="inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold px-8 py-3.5 rounded-full text-sm transition-all"
              >
                📋 How to Order
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
