import { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "FAQ | Shree Ambika Beauty Shop Mumbai — Orders, Delivery, Returns & More",
  description:
    "Got questions? ✅ How to order on WhatsApp · ⚡ Same-day delivery Mumbai · 🚚 Pan India shipping · 💳 COD & UPI · Returns policy — all answered. Call/WhatsApp Vinod: +91 82914 55297.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/faq" },
  openGraph: {
    title: "FAQ | Shree Ambika Beauty Shop Mumbai — Ordering, Delivery & Products",
    description:
      "Got questions? Find answers about ordering, delivery, returns, and more at Shree Ambika Beauty Shop Mumbai. WhatsApp +918291455297.",
    url: "https://www.shreeambikabeauty.com/faq",
    siteName: "Shree Ambika Beauty Shop",
    images: [
      {
        url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png",
        width: 1200,
        height: 630,
        alt: "FAQ — Shree Ambika Beauty Shop Mumbai",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function FAQPage() {
  return <FAQClient />;
}
