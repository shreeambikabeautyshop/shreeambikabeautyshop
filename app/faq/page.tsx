import { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "FAQ | Shree Ambika Beauty Shop Mumbai — Ordering, Delivery & Products",
  description:
    "Frequently asked questions about Shree Ambika Beauty Shop Mumbai — ordering on WhatsApp, delivery times, 100% original products, payment methods, return policy, and store location in Dahisar East.",
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
