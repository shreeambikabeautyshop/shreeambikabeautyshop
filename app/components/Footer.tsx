import Link from "next/link";
import {
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "/categories" },
  { name: "Brands", href: "/brands" },
  { name: "Offers", href: "/offers" },
  { name: "Beauty Tips", href: "/beauty-tips" },
];

const customerService = [
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
  { name: "FAQ", href: "/faq" },
  { name: "Shipping Policy", href: "/shipping-policy" },
  { name: "Return & Refund", href: "/return-policy" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white" aria-label="Site Footer">
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm font-serif">SA</span>
              </div>
              <div>
                <p className="font-bold text-brand-accent font-serif">श्री अम्बिका</p>
                <p className="text-xs text-gray-400 tracking-widest">BEAUTY SHOP</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Your one-stop destination for 100% original beauty products from top brands. 
              Trusted since 2001. Your Beauty, Our Responsibility.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <FaInstagram size={16} />, href: "#", label: "Instagram" },
                { icon: <FaFacebook size={16} />, href: "#", label: "Facebook" },
                { icon: <FaWhatsapp size={16} />, href: "https://wa.me/919999999999", label: "WhatsApp" },
                { icon: <FaYoutube size={16} />, href: "#", label: "YouTube" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 bg-white/10 hover:bg-brand-primary rounded-full flex items-center justify-center transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-brand-accent mb-4 uppercase text-sm tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    → {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-brand-accent mb-4 uppercase text-sm tracking-wide">Customer Service</h3>
            <ul className="space-y-2">
              {customerService.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    → {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-brand-accent mb-4 uppercase text-sm tracking-wide">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MdEmail className="flex-shrink-0 mt-0.5 text-brand-accent" size={16} />
                <span>shreeambikabeautyshop@gmail.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MdPhone className="flex-shrink-0 mt-0.5 text-brand-accent" size={16} />
                <span>+91 99999 99999</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MdLocationOn className="flex-shrink-0 mt-0.5 text-brand-accent" size={16} />
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>

            <div className="mt-5">
              <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">We Accept</p>
              <div className="flex gap-2 flex-wrap">
                {["Visa", "Mastercard", "UPI", "GPay", "PhonePe", "COD"].map((pay) => (
                  <span
                    key={pay}
                    className="bg-white/10 text-gray-300 text-[10px] px-2 py-0.5 rounded font-medium"
                  >
                    {pay}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-4 px-4">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Shree Ambika Beauty Shop. All rights reserved.</p>
          <p>
            Your one-stop shop for 100% original beauty essentials.{" "}
            <Link href="/privacy-policy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
