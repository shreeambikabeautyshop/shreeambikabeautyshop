import type { Metadata } from "next";
import { Poppins, Playfair_Display, Cormorant_Garamond, Dancing_Script, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { WishlistProvider } from "@/app/context/WishlistContext";
import { UserProvider } from "@/app/context/UserContext";
import CustomerLoginModal from "@/app/components/CustomerLoginModal";

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

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dancing",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shree Ambika Beauty Shop Mumbai | 100% Original Beauty Products | Pan India Delivery",
  description:
    "Mumbai's trusted beauty shop. Buy 100% original cosmetics, makeup, skincare & haircare — Lakme, Maybelline, SUGAR, Nykaa & 500+ brands. Best prices. Pan India delivery. WhatsApp Vinod: +918291455297",
  keywords:
    "shree ambika beauty shop mumbai, beauty products mumbai, vinod beauty shop, original cosmetics mumbai, makeup shop mumbai, skincare mumbai, pan india beauty delivery, beauty products whatsapp order india, lakme maybelline sugar mumbai, best beauty shop mumbai thane navi mumbai",
  openGraph: {
    title: "Shree Ambika Beauty Shop | Original Beauty Products",
    description:
      "100% Original Products. Best Prices. WhatsApp Order: +918291455297. Serving Mumbai since 2001.",
    url: "https://shreeambikabeautyshop.vercel.app",
    siteName: "Shree Ambika Beauty Shop",
    images: [
      {
        url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png",
        width: 1200,
        height: 630,
        alt: "Shree Ambika Beauty Shop Mumbai",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Ambika Beauty Shop | Original Beauty Products Mumbai",
    description: "100% Original Beauty Products at Best Prices. WhatsApp: +918291455297",
    images: ["https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png"],
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
    canonical: "https://shreeambikabeautyshop.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Store"],
    "name": "Shree Ambika Beauty Shop",
    "alternateName": "Shree Ambika Beauty Shop Mumbai",
    "description": "Mumbai's trusted beauty shop since 2001. 100% original beauty products — cosmetics, makeup, skincare, haircare from top brands. Pan India delivery. WhatsApp order: +918291455297.",
    "url": "https://shreeambikabeautyshop.vercel.app",
    "telephone": "+918291455297",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+918291455297",
        "contactType": "customer service",
        "availableLanguage": ["Hindi", "English", "Marathi"],
        "contactOption": "WhatsApp",
        "areaServed": "IN",
      },
      {
        "@type": "ContactPoint",
        "telephone": "+918291455297",
        "contactType": "sales",
        "availableLanguage": ["Hindi", "English", "Marathi"],
        "contactOption": "WhatsApp",
        "areaServed": ["Mumbai", "Thane", "Navi Mumbai", "Pune", "Maharashtra", "India"],
      },
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mumbai",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "19.0760",
      "longitude": "72.8777",
    },
    "areaServed": [
      { "@type": "City", "name": "Mumbai" },
      { "@type": "City", "name": "Thane" },
      { "@type": "City", "name": "Navi Mumbai" },
      { "@type": "City", "name": "Pune" },
      { "@type": "State", "name": "Maharashtra" },
      { "@type": "Country", "name": "India" },
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Beauty Products",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Cosmetics & Makeup" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Skin Care Products" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Hair Care Products" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Perfumes & Fragrances" } },
      ],
    },
    "openingHours": "Mo-Su 09:00-21:00",
    "priceRange": "₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, UPI, GPay, PhonePe, WhatsApp Pay, Credit Card, Debit Card, COD",
    "founder": {
      "@type": "Person",
      "name": "Vinod",
      "telephone": "+918291455297",
    },
    "slogan": "Your Beauty, Our Responsibility ♡",
    "foundingDate": "2001",
    "sameAs": [
      "https://instagram.com/shreeambikabeautystore",
      "https://wa.me/918291455297",
    ],
  };

  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable} ${cormorant.variable} ${dancing.variable} ${dmSerif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="font-sans antialiased">
          <UserProvider>
            <WishlistProvider>
              {children}
              <CustomerLoginModal />
            </WishlistProvider>
          </UserProvider>
        </body>
    </html>
  );
}
