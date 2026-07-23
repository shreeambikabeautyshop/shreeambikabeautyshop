import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | Shree Ambika Beauty Shop Dahisar Mumbai",
  description:
    "Contact Shree Ambika Beauty Shop — WhatsApp Vinod at +918291455297. Located at Anand Nagar Metro, Dahisar East Mumbai. Open 9AM–9PM, 7 days a week.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/contact" },
  openGraph: {
    title: "Contact Us | Shree Ambika Beauty Shop Dahisar Mumbai",
    description:
      "Reach out to Shree Ambika Beauty Shop — WhatsApp, email, or visit the store in Dahisar East, Mumbai.",
    url: "https://www.shreeambikabeauty.com/contact",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
