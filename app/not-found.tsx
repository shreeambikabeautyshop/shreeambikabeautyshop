import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <p className="text-8xl mb-4">💄</p>
          <h1 className="text-6xl font-black text-brand-primary mb-2">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Page Not Found</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Oops! The page you are looking for doesn&apos;t exist.<br/>
            Let&apos;s get you back to the beauty products!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/"
              className="inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold px-6 py-3 rounded-full text-sm transition-colors">
              🏠 Go to Homepage
            </Link>
            <Link href="/products"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3 rounded-full text-sm transition-colors">
              🛍 Browse Products
            </Link>
            <a href="https://wa.me/918291455297?text=Hi Vinod! I need help finding a product."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors">
              💬 WhatsApp Help
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {[
              ["/categories/makeup","Makeup"],
              ["/categories/skincare","Skin Care"],
              ["/categories/haircare","Hair Care"],
              ["/beauty-tips","Beauty Tips"],
              ["/contact","Contact"],
              ["/faq","FAQ"],
            ].map(([href, label]) => (
              <Link key={href} href={href}
                className="bg-white border border-gray-200 hover:border-brand-primary text-gray-600 hover:text-brand-primary px-3 py-1.5 rounded-full transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
