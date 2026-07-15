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
  title: "Shree Ambika Beauty Shop | 100% Original Beauty Products | Mumbai",
  description:
    "Buy 100% original beauty products from Shree Ambika Beauty Shop. Top brands like Lakme, Maybelline, SUGAR, Nykaa & more. Best prices in Mumbai. WhatsApp Vinod: +918291455297",
  keywords:
    "shree ambika beauty shop, vinod beauty shop mumbai, original beauty products mumbai, cosmetics online india, lakme maybelline sugar nykaa buy online, beauty shop whatsapp order, 100% original makeup india",
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
    "@type": "LocalBusiness",
    "name": "Shree Ambika Beauty Shop",
    "description": "100% original beauty products from top brands. Cosmetics, makeup, skincare, haircare at best prices. Mumbai's trusted beauty shop since 2001.",
    "url": "https://shreeambikabeautyshop.vercel.app",
    "telephone": "+918291455297",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+918291455297",
      "contactType": "customer service",
      "availableLanguage": ["Hindi", "English", "Marathi"],
      "contactOption": "WhatsApp",
    },
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
    "openingHours": "Mo-Su 09:00-21:00",
    "priceRange": "₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, UPI, Credit Card, Debit Card, WhatsApp Pay",
    "sameAs": [
      "https://instagram.com/shreeambikabeautystore",
      "https://wa.me/918291455297",
    ],
    "founder": {
      "@type": "Person",
      "name": "Vinod",
      "telephone": "+918291455297",
    },
  };

  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
