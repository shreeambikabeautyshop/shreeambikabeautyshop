import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | Shree Ambika Beauty Shop Dahisar Mumbai | WhatsApp +918291455297",
  description:
    "Contact Shree Ambika Beauty Shop — WhatsApp Vinod Goswami at +918291455297 for orders & enquiries. Store at Anand Nagar Metro, Dahisar East Mumbai 400068. Open 9AM–9PM, 7 days.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/contact" },
  openGraph: {
    title: "Contact Us | Shree Ambika Beauty Shop Dahisar Mumbai | WhatsApp +918291455297",
    description:
      "Reach Shree Ambika Beauty Shop — WhatsApp, email, Instagram or visit the store at Dahisar East, Mumbai. Vinod Goswami replies within minutes.",
    url: "https://www.shreeambikabeauty.com/contact",
    siteName: "Shree Ambika Beauty Shop",
    images: [
      {
        url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png",
        width: 1200,
        height: 630,
        alt: "Contact Shree Ambika Beauty Shop — Dahisar Mumbai",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
