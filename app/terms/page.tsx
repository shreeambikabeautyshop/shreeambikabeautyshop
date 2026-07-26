import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Terms of Service | Shree Ambika Beauty Shop",
  description: "Terms of Service for Shree Ambika Beauty Shop — rules for using our website and placing orders.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-brand-primary text-white py-10 px-4">
          <div className="max-w-[900px] mx-auto">
            <nav className="text-xs text-white/60 mb-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Terms of Service</span>
            </nav>
            <h1 className="text-3xl font-bold font-serif">Terms of Service</h1>
            <p className="text-white/70 text-sm mt-1">Last updated: July 2026</p>
          </div>
        </div>
        <div className="max-w-[900px] mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl p-8 shadow-sm space-y-5 text-gray-700 text-sm leading-relaxed">
            {[
              { title:"1. Acceptance", body:"By using shreeambikabeauty.com or placing an order, you agree to these terms. If you disagree, please do not use our services." },
              { title:"2. Products", body:"All products sold are 100% original and sourced from authorized distributors. We do not sell counterfeit or duplicate products." },
              { title:"3. Pricing", body:"All prices are in Indian Rupees (₹) and inclusive of applicable taxes. Prices may change without prior notice." },
              { title:"4. Orders", body:"Orders are accepted via WhatsApp and confirmed once payment is received. We reserve the right to cancel orders in case of stock unavailability or payment issues." },
              { title:"5. Payment", body:"We accept UPI, cards, net banking, cash on delivery, and cash at our Dahisar store. All payments must be completed before dispatch (except COD orders)." },
              { title:"6. Liability", body:"Shree Ambika Beauty Shop is not responsible for individual skin reactions to products, as every person's skin type is different. We are responsible only for delivering the correct, original product as ordered." },
              { title:"7. Intellectual Property", body:"All content on this website including images, text, and logos are property of Shree Ambika Beauty Shop. Do not reproduce without permission." },
              { title:"8. Contact", body:"For any queries, contact Vinod Goswami at +91 82914 55297 (WhatsApp) or shreeambikabeautyshop@gmail.com." },
            ].map(s => (
              <section key={s.title}>
                <h2 className="text-base font-bold text-gray-900 mb-1">{s.title}</h2>
                <p>{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
