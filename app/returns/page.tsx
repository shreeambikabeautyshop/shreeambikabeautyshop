import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Returns & Exchange Policy | Shree Ambika Beauty Shop Mumbai",
  description:
    "Return policy at Shree Ambika Beauty Shop — customer ships product back at their cost, we refund or exchange. Used/dirty products not accepted. Free delivery on all orders. WhatsApp: +918291455297",
  alternates: { canonical: "https://www.shreeambikabeauty.com/returns" },
};

export default function ReturnsPage() {
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
              <span>Returns & Exchange</span>
            </nav>
            <h1 className="text-3xl font-bold font-serif mb-2">Returns & Exchange Policy</h1>
            <p className="text-white/80 text-sm max-w-xl">
              We sell 100% original products sourced directly from brands. Our return process is fair and simple — read below to understand how it works.
            </p>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-4 py-12 space-y-8">

          {/* Important notice */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 flex gap-4">
            <span className="text-3xl flex-shrink-0">⚠️</span>
            <div>
              <h2 className="font-bold text-amber-900 text-base mb-1">Important — Read Before Ordering</h2>
              <p className="text-amber-800 text-sm leading-relaxed">
                All our products are <strong>100% original</strong>, sourced directly from brands and authorized distributors.
                If a product does not suit your skin or body — that is a personal reaction, not a product defect.
                We cannot be held responsible for individual skin reactions as every person&apos;s skin type is different.
                If there is a <strong>genuine product defect or wrong item delivered</strong>, we are always here to help.
              </p>
            </div>
          </div>

          {/* 3 summary cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { emoji:"🚚", title:"Free Delivery on Orders", desc:"We offer free delivery on all orders. Same day in Mumbai (after payment), Pan India 4–7 days via courier with tracking ID.", color:"bg-green-50 border-green-200" },
              { emoji:"↩️", title:"Returns Accepted", desc:"If product has a genuine defect or wrong item was sent — we accept returns. Customer is responsible for return shipping cost.", color:"bg-blue-50 border-blue-200" },
              { emoji:"🔄", title:"Refund or Exchange", desc:"After we receive the product at our Dahisar store, we will refund your money OR give you another product of your choice.", color:"bg-purple-50 border-purple-200" },
            ].map(c => (
              <div key={c.title} className={`${c.color} border-2 rounded-2xl p-5`}>
                <span className="text-3xl block mb-2">{c.emoji}</span>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{c.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Return process */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
            <h2 className="text-xl font-bold text-gray-900 mb-6">How to Return a Product</h2>
            <div className="space-y-5">
              {[
                { n:"01", emoji:"📸", title:"Take a Photo First", desc:"Take a clear photo of the product and its packaging showing the issue (damage, wrong item, etc.). This helps us process your request faster." },
                { n:"02", emoji:"💬", title:"WhatsApp Vinod", desc:"Message Vinod at +918291455297 within 7 days of receiving the product. Share your order details and the photo. We will confirm return eligibility." },
                { n:"03", emoji:"📦", title:"Ship it Back — At Your Cost", desc:"Once approved, pack the product in its original packaging and book a courier yourself (DTDC, Delhivery, India Post etc.) to our shop address: Anand Nagar Metro Station, Dahisar East, Mumbai 400068. Share the tracking ID with Vinod on WhatsApp." },
                { n:"04", emoji:"🏪", title:"Or Visit Our Store Directly", desc:"You can also walk into our physical store at Dahisar East, Mumbai with the product. We will inspect it on the spot and resolve immediately — refund or exchange, whichever you prefer." },
                { n:"05", emoji:"✅", title:"Refund or Exchange", desc:"Once we receive and inspect the returned product at our store, we will either refund your money to your original payment method OR give you another product of your choice." },
              ].map(s => (
                <div key={s.n} className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-primary text-white rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0">{s.n}</div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">{s.emoji} {s.title}</p>
                    <p className="text-gray-600 text-xs leading-relaxed mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What we accept vs don't */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-xl">✅</span> We Accept Returns If</h3>
              <ul className="space-y-2.5">
                {[
                  "Wrong product was delivered to you",
                  "Product arrived damaged or broken in transit",
                  "Product has a genuine manufacturing defect",
                  "Sealed / unopened product in original packaging",
                  "Return initiated within 7 days of delivery",
                  "Product is in the same condition as delivered",
                ].map(i => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>{i}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-xl">❌</span> We Do NOT Accept Returns If</h3>
              <ul className="space-y-2.5">
                {[
                  "Product has been used — even once",
                  "Product quantity is almost finished",
                  "Product is dirty, melted, or not clean",
                  "Packaging is damaged, broken, or missing",
                  "Product does not suit your skin — this is not a defect",
                  "Return is requested after 7 days of delivery",
                  "Personal care items with broken seal (hygiene reasons)",
                ].map(i => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">✗</span>{i}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Delivery policy */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">🚚 Our Delivery Promise</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon:"🏙️", title:"Mumbai — Same Day Delivery", desc:"Once payment is received, we dispatch your order instantly. Delivery same day within Mumbai city. Depends on courier partner but we try our best." },
                { icon:"🇮🇳", title:"Pan India — 4 to 7 Working Days", desc:"We dispatch via trusted couriers (DTDC, Blue Dart, India Post). You get a tracking ID on WhatsApp to track your shipment live." },
                { icon:"💸", title:"Free Delivery on All Orders", desc:"We charge zero delivery fees. No minimum order value. Free shipping to your door anywhere in India." },
                { icon:"📲", title:"Tracking ID on WhatsApp", desc:"As soon as your order is dispatched, Vinod will send you the courier tracking ID on WhatsApp so you know exactly where your parcel is." },
              ].map(d => (
                <div key={d.title} className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">{d.icon}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{d.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note on cosmetics */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-3">
            <span className="text-2xl flex-shrink-0">💄</span>
            <div>
              <p className="font-bold text-blue-900 text-sm mb-1">Note on Cosmetics & Skincare</p>
              <p className="text-blue-800 text-xs leading-relaxed">
                Cosmetics and skincare products are personal use items. Once a product is opened, it cannot be resold for hygiene reasons.
                We are not responsible if a product does not suit your skin type — every person&apos;s skin is different.
                <strong> However</strong>, if there is an issue with the product itself (wrong item, damage, expired), we will always help.
                We have been selling beauty products since 2001 and such issues are extremely rare.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-brand-primary rounded-3xl p-8 text-center text-white">
            <p className="text-4xl mb-3">📦</p>
            <h2 className="font-bold text-2xl mb-2">Need Help with a Return?</h2>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
              WhatsApp Vinod with your order details and product photo. We will guide you through the process and resolve it quickly.
            </p>
            <a href="https://wa.me/918291455297?text=Hi Vinod! I need help with a return. My order details are:"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-full transition-colors">
              💬 WhatsApp Vinod — +91 82914 55297
            </a>
            <p className="text-white/50 text-xs mt-4">Store Address: Anand Nagar Metro Station, Dahisar East, Mumbai 400068</p>
          </div>

        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
