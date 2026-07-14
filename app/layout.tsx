import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shree Ambika Beauty Shop | Premium Beauty Products Online",
  description:
    "Shop 100% original beauty products from top brands like Lakme, Maybelline, SUGAR, Nykaa, RENEE, Insight, SMARS & more. Best prices, fast delivery, WhatsApp ordering.",
  keywords:
    "beauty shop, cosmetics, makeup, skincare, haircare, lakme, maybelline, sugar cosmetics, nykaa, shree ambika, beauty products india",
  openGraph: {
    title: "Shree Ambika Beauty Shop | Premium Beauty Products",
    description:
      "100% Original Products from Top Brands. Shop Now on WhatsApp or Online.",
    url: "https://shreeambikabeautyshop.com",
    siteName: "Shree Ambika Beauty Shop",
    images: [
      {
        url: "/images/slider-1.png",
        width: 1200,
        height: 630,
        alt: "Shree Ambika Beauty Shop",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Ambika Beauty Shop",
    description: "100% Original Beauty Products at Best Prices",
    images: ["/images/slider-1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://shreeambikabeautyshop.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
