import { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "FAQ | Shree Ambika Beauty Shop",
  description:
    "Frequently asked questions about Shree Ambika Beauty Shop — product authenticity, ordering, delivery, returns, payment methods, and store location in Dahisar Mumbai.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/faq" },
  openGraph: {
    title: "FAQ | Shree Ambika Beauty Shop",
    description:
      "Got questions? Find answers about ordering, delivery, returns, and more at Shree Ambika Beauty Shop Mumbai.",
    url: "https://www.shreeambikabeauty.com/faq",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

export default function FAQPage() {
  return <FAQClient />;
}
