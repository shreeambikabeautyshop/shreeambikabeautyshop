import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Privacy Policy | Shree Ambika Beauty Shop",
  description: "Privacy Policy for Shree Ambika Beauty Shop — how we collect, use, and protect your personal information.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-brand-primary text-white py-10 px-4">
          <div className="max-w-[900px] mx-auto">
            <nav className="text-xs text-white/60 mb-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Privacy Policy</span>
            </nav>
            <h1 className="text-3xl font-bold font-serif">Privacy Policy</h1>
            <p className="text-white/70 text-sm mt-1">Last updated: July 2026</p>
          </div>
        </div>
        <div className="max-w-[900px] mx-auto px-4 py-10 prose prose-gray max-w-none">
          <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">1. Information We Collect</h2>
              <p>When you use our website (shreeambikabeauty.com) or place an order via WhatsApp, we may collect: your name, phone number, email address, and delivery address. This information is provided voluntarily by you to complete your order.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">2. How We Use Your Information</h2>
              <p>We use your information solely to process and deliver your orders, communicate order status via WhatsApp, and provide customer support. We do not use your information for unsolicited marketing without your consent.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">3. Data Storage</h2>
              <p>Your information is stored securely in our order management system. We do not sell, rent, or share your personal information with third parties except our delivery partners (for shipping purposes only).</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">4. Cookies</h2>
              <p>Our website uses cookies to improve your browsing experience and track website analytics (Google Analytics). You can disable cookies in your browser settings. We use analytics only to understand how visitors use our website.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">5. Your Rights</h2>
              <p>You can request to view, update, or delete your personal data at any time by contacting us via WhatsApp at +918291455297 or email at shreeambikabeautyshop@gmail.com.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">6. Contact</h2>
              <p>For any privacy-related queries, contact: Vinod Goswami, Shree Ambika Beauty Shop, Dahisar East, Mumbai 400068. WhatsApp: +91 82914 55297. Email: shreeambikabeautyshop@gmail.com</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
