import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Track Your Order | Shree Ambika Beauty Shop Mumbai",
  description:
    "Track your beauty product order from Shree Ambika Beauty Shop. WhatsApp Vinod at +918291455297 with your order ID for real-time tracking. Mumbai same day, Pan India 4–7 days delivery.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/track-order" },
  openGraph: {
    title: "Track Your Order | Shree Ambika Beauty Shop",
    description: "Track your order from Shree Ambika Beauty Shop — WhatsApp Vinod +918291455297 for instant tracking updates.",
    url: "https://www.shreeambikabeauty.com/track-order",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

const trackingSteps = [
  {
    emoji: "✅",
    status: "Order Confirmed",
    desc: "You WhatsApp Vinod and confirm the product, quantity, and delivery address. Payment is received.",
    color: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  {
    emoji: "📦",
    status: "Order Packed",
    desc: "Your order is carefully packed and ready for dispatch. Usually done within 1–2 hours of payment.",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  {
    emoji: "🚚",
    status: "Dispatched",
    desc: "Your parcel is handed to our courier partner (DTDC, Blue Dart, India Post). You will receive the tracking ID on WhatsApp.",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  {
    emoji: "📍",
    status: "In Transit",
    desc: "Your parcel is on its way. Use the tracking ID on the courier website to check real-time status.",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  {
    emoji: "🎉",
    status: "Delivered",
    desc: "Your order has been delivered! If there's any issue, WhatsApp Vinod immediately.",
    color: "bg-brand-light text-brand-primary border-brand-primary/20",
    dot: "bg-brand-primary",
  },
];

const couriers = [
  { name: "DTDC", url: "https://www.dtdc.in/tracking.asp", emoji: "🟡" },
  { name: "Blue Dart", url: "https://www.bluedart.com/web/guest/trackdartresult", emoji: "🔵" },
  { name: "India Post", url: "https://www.indiapost.gov.in/vas/pages/trackConsignment.aspx", emoji: "🔴" },
  { name: "Delhivery", url: "https://www.delhivery.com/track/", emoji: "🟢" },
  { name: "Ekart", url: "https://ekartlogistics.com/shipmenttrack", emoji: "🟠" },
];

export default function TrackOrderPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-brand-primary text-white py-12 px-4">
          <div className="max-w-[1000px] mx-auto">
            <nav className="text-xs text-white/60 mb-4">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Track Your Order</span>
            </nav>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-5xl">📦</span>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold font-serif">Track Your Order</h1>
                <p className="text-white/80 text-sm mt-1">Real-time updates on your beauty product delivery</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-4 py-12 space-y-10">

          {/* Quick Track via WhatsApp */}
          <div className="bg-green-50 border-2 border-green-300 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">💬</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Fastest Way — WhatsApp Vinod</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  The easiest way to track your order is to WhatsApp Vinod directly at <strong>+91 82914 55297</strong>. 
                  Send your name and order details — you&apos;ll get the tracking ID and live status within minutes.
                </p>
                <a
                  href="https://wa.me/918291455297?text=Hi Vinod! I want to track my order. My name is: [Your Name] and I ordered: [Product Name]"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors"
                >
                  💬 WhatsApp for Tracking — +91 82914 55297
                </a>
              </div>
            </div>
          </div>

          {/* Order Journey */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Order Journey</h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gray-200 hidden sm:block" />
              <div className="space-y-6">
                {trackingSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`relative z-10 w-10 h-10 rounded-full ${step.dot} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-lg">{step.emoji}</span>
                    </div>
                    <div className={`flex-1 ${step.color} border rounded-2xl p-4`}>
                      <p className="font-bold text-sm mb-1">{step.status}</p>
                      <p className="text-xs leading-relaxed opacity-80">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Courier Tracking Links */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Track on Courier Website</h2>
            <p className="text-gray-500 text-sm mb-6">
              Once your order is dispatched, Vinod will send you the <strong>tracking ID + courier name</strong> on WhatsApp. 
              Use the links below to track in real-time.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {couriers.map((c) => (
                <a
                  key={c.name}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 bg-gray-50 hover:bg-brand-light border border-gray-200 hover:border-brand-primary rounded-2xl p-4 text-center transition-all group"
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-brand-primary">{c.name}</span>
                  <span className="text-[10px] text-brand-primary font-semibold">Track →</span>
                </a>
              ))}
            </div>
          </div>

          {/* Delivery timeline */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Expected Delivery Times</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "🏙️", zone: "Mumbai City", time: "Same Day", note: "Order before 2pm", color: "bg-green-50 border-green-200" },
                { icon: "🌆", zone: "Thane / Navi Mumbai", time: "Next Day", note: "1–2 working days", color: "bg-blue-50 border-blue-200" },
                { icon: "🇮🇳", zone: "Pan India", time: "4–7 Days", note: "Working days via courier", color: "bg-orange-50 border-orange-200" },
                { icon: "✈️", zone: "International", time: "10–15 Days", note: "Worldwide shipping available", color: "bg-purple-50 border-purple-200" },
              ].map((d) => (
                <div key={d.zone} className={`${d.color} border-2 rounded-2xl p-4 flex items-center gap-4`}>
                  <span className="text-3xl flex-shrink-0">{d.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{d.zone}</p>
                    <p className="text-brand-primary font-black text-base">{d.time}</p>
                    <p className="text-gray-500 text-[11px]">{d.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Common Questions</h2>
            <div className="space-y-4">
              {[
                { q: "I didn't receive my tracking ID. What should I do?", a: "WhatsApp Vinod at +918291455297 with your name and order details. We'll share the tracking ID immediately. Orders are dispatched same day (payment before 2pm)." },
                { q: "My order is showing delayed. What do I do?", a: "Courier delays can happen due to weather, peak seasons, or location. WhatsApp Vinod — we'll follow up with the courier on your behalf." },
                { q: "My parcel shows delivered but I haven't received it.", a: "Sometimes courier apps update incorrectly. Check with your neighbours, security, or building reception. Then WhatsApp Vinod — we'll raise a complaint with the courier." },
                { q: "Can I change my delivery address after ordering?", a: "Yes, if the order hasn't been dispatched yet. WhatsApp Vinod immediately with the new address." },
              ].map((faq, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-4">
                  <p className="font-bold text-gray-800 text-sm mb-1.5">❓ {faq.q}</p>
                  <p className="text-gray-600 text-xs leading-relaxed">💬 {faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-brand-primary rounded-3xl p-8 text-center text-white">
            <p className="text-4xl mb-3">📦</p>
            <h2 className="font-bold text-2xl mb-2">Need Help with Your Order?</h2>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
              For tracking, delivery updates, or any order-related help — WhatsApp Vinod directly. We respond within minutes.
            </p>
            <a
              href="https://wa.me/918291455297?text=Hi Vinod! I need help with my order tracking."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-full transition-colors"
            >
              💬 WhatsApp Vinod — +91 82914 55297
            </a>
            <p className="text-white/40 text-xs mt-4">Anand Nagar Metro Station, Dahisar East, Mumbai 400068</p>
          </div>

        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
