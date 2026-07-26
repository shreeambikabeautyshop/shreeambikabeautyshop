import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Shipping Policy | Shree Ambika Beauty Shop Mumbai",
  description: "Shipping policy for Shree Ambika Beauty Shop — same day Mumbai delivery, Pan India 4-7 days, free shipping above Rs.999. WhatsApp: +918291455297",
  alternates: { canonical: "https://www.shreeambikabeauty.com/shipping-policy" },
};

export default function ShippingPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-brand-primary text-white py-10 px-4">
          <div className="max-w-[900px] mx-auto">
            <nav className="text-xs text-white/60 mb-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Shipping Policy</span>
            </nav>
            <h1 className="text-3xl font-bold font-serif">Shipping Policy</h1>
            <p className="text-white/70 text-sm mt-1">Last updated: July 2026</p>
          </div>
        </div>
        <div className="max-w-[900px] mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
            {[
              { title:"Free Shipping", body:"Free delivery on all orders above ₹999 across India. Orders below ₹999 attract a flat shipping charge of ₹79." },
              { title:"Mumbai Same Day Delivery", body:"Orders placed before 2:00 PM are dispatched the same day within Mumbai city. Delivery within 4-8 hours depending on location and courier availability." },
              { title:"Pan India Delivery", body:"We deliver to all cities, towns, and villages across India via DTDC, Blue Dart, Delhivery, and India Post. Standard delivery takes 4-7 working days." },
              { title:"International Shipping", body:"We ship internationally. Please WhatsApp Vinod at +918291455297 for shipping rates and delivery timelines to your country." },
              { title:"Tracking", body:"Once your order is dispatched, you will receive a tracking ID on WhatsApp. You can use this to track your shipment on the courier's website." },
              { title:"Dispatch Time", body:"Orders are dispatched the same day payment is received (for orders received before 2 PM). Orders received after 2 PM are dispatched the next working day." },
            ].map(s => (
              <section key={s.title}>
                <h2 className="text-base font-bold text-gray-900 mb-1">{s.title}</h2>
                <p>{s.body}</p>
              </section>
            ))}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
              <p className="font-bold text-green-800 text-sm">Questions about your shipment?</p>
              <p className="text-green-700 text-xs mt-1">WhatsApp Vinod at +91 82914 55297 for instant help with your delivery.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
