import type { Metadata } from "next";
import { Poppins, Playfair_Display, Cormorant_Garamond, Dancing_Script, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { WishlistProvider } from "@/app/context/WishlistContext";
import { UserProvider } from "@/app/context/UserContext";
import { SettingsProvider } from "@/app/context/SettingsContext";
import CustomerLoginModal from "@/app/components/CustomerLoginModal";
import VisitorTracker from "@/app/components/VisitorTracker";

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
  metadataBase: new URL("https://www.shreeambikabeauty.com"),
  title: {
    default: "Shree Ambika Beauty Shop Mumbai | 100% Original Beauty Products | Pan India Delivery",
    template: "%s | Shree Ambika Beauty Shop Mumbai",
  },
  description:
    "Mumbai's most trusted beauty shop since 2001. Buy 100% original cosmetics, makeup, skincare & haircare — Lakme, Maybelline, SUGAR, L'Oreal, Pilgrim & 500+ brands. Best prices. Same day delivery Mumbai. Pan India 4–7 days. WhatsApp Vinod: +918291455297",
  keywords: [
    "shree ambika beauty shop mumbai",
    "beauty products mumbai",
    "vinod beauty shop dahisar",
    "original cosmetics mumbai",
    "makeup shop mumbai",
    "skincare mumbai best price",
    "haircare products mumbai",
    "pan india beauty delivery",
    "beauty products whatsapp order india",
    "lakme maybelline sugar mumbai",
    "best beauty shop mumbai thane navi mumbai",
    "100% original beauty products india",
    "buy beauty products online mumbai",
    "shree ambika choice center dahisar",
    "beauty shop dahisar mumbai",
  ],
  authors: [{ name: "Shree Ambika Beauty Shop", url: "https://www.shreeambikabeauty.com" }],
  creator: "Shree Ambika Beauty Shop",
  publisher: "Shree Ambika Beauty Shop",
  category: "Beauty & Personal Care",
  classification: "Beauty Shop, Cosmetics Store, Online Beauty Products",
  openGraph: {
    title: "Shree Ambika Beauty Shop | 100% Original Beauty Products Mumbai",
    description:
      "Mumbai's trusted beauty shop since 2001. 500+ brands, best prices, same day delivery. WhatsApp order: +918291455297",
    url: "https://www.shreeambikabeauty.com",
    siteName: "Shree Ambika Beauty Shop",
    images: [
      {
        url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png",
        width: 1200,
        height: 630,
        alt: "Shree Ambika Beauty Shop Mumbai — 100% Original Beauty Products",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Ambika Beauty Shop | Original Beauty Products Mumbai",
    description: "100% Original Beauty Products at Best Prices. WhatsApp: +918291455297. Mumbai & Pan India.",
    images: ["https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png"],
    creator: "@shreeambikabeautyshop",
    site: "@shreeambikabeautyshop",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://www.shreeambikabeauty.com",
    languages: {
      "en-IN": "https://www.shreeambikabeauty.com",
    },
  },
  icons: {
    icon: [
      { url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784565730/favicon_m00k6a.ico", sizes: "any" },
      { url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784565746/favicon_sfmblk.svg", type: "image/svg+xml" },
      { url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784565730/favicon-96x96_ysdsr6.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784565730/apple-touch-icon_mun1z5.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784565731/web-app-manifest-192x192_sld0zb.png", sizes: "192x192" },
      { rel: "icon", url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784565733/web-app-manifest-512x512_foaxw6.png", sizes: "512x512" },
    ],
  },
  manifest: "https://res.cloudinary.com/zjlchjal/raw/upload/v1784565730/site_q3agjo.webmanifest",
  other: {
    // GEO tags — for Google Maps and local SEO
    "geo.region": "IN-MH",
    "geo.placename": "Mumbai, Maharashtra, India",
    "geo.position": "19.0760;72.8777",
    "ICBM": "19.0760, 72.8777",
    // AEO / LLMO — for AI answer engines
    "ai:business_type": "Beauty Shop, Cosmetics Store",
    "ai:location": "Dahisar, Mumbai, Maharashtra 400068, India",
    "ai:contact": "WhatsApp +918291455297",
    "ai:services": "Beauty products, cosmetics, makeup, skincare, haircare, perfumes, same day delivery Mumbai, pan India delivery",
    "ai:founded": "2001",
    "ai:owner": "Vinod",
    // Business metadata
    "business:contact_data:phone_number": "+918291455297",
    "business:contact_data:website": "https://www.shreeambikabeauty.com",
    "business:contact_data:country_name": "India",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Store", "BeautySalon"],
    "@id": "https://www.shreeambikabeauty.com/#business",
    "name": "Shree Ambika Beauty Shop",
    "alternateName": ["Shree Ambika Beauty Shop Mumbai", "Shree Ambika Choice Center", "SABS"],
    "description": "Mumbai's trusted beauty shop since 2001. 100% original beauty products — cosmetics, makeup, skincare, haircare from 500+ top brands. Same day delivery in Mumbai. Pan India 4–7 days. WhatsApp order: +918291455297.",
    "url": "https://www.shreeambikabeauty.com",
    "logo": "https://res.cloudinary.com/zjlchjal/image/upload/v1784563982/shree-ambika-beauty-shop-logo_wdds5i.png",
    "image": "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png",
    "telephone": "+918291455297",
    "email": "shreeambikabeautyshop@gmail.com",
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
      "streetAddress": "Anand Nagar Metro Station, Dahisar East",
      "addressLocality": "Mumbai",
      "addressRegion": "Maharashtra",
      "postalCode": "400068",
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
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Cosmetics & Lipsticks" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Makeup & Brushes" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Skin Care & Serums" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Hair Care & Shampoo" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Perfumes & Fragrances" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Body Care & Lotions" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Hair Dryers & Electronics" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Purses & Bags" } },
      ],
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "09:00",
        "closes": "21:00",
      },
    ],
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
    "numberOfEmployees": { "@type": "QuantitativeValue", "value": 5 },
    "sameAs": [
      "https://instagram.com/shreeambikabeautyshop",
      "https://wa.me/918291455297",
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "500",
      "bestRating": "5",
    },
  };

  // FAQ Schema for AEO (Answer Engine Optimization)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Are all products at Shree Ambika Beauty Shop 100% original?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all products at Shree Ambika Beauty Shop are 100% original and sourced directly from brands and authorized distributors. We have been serving Mumbai customers since 2001 with genuine products only.",
        },
      },
      {
        "@type": "Question",
        "name": "How do I order beauty products from Shree Ambika Beauty Shop?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can order easily via WhatsApp by messaging Vinod at +918291455297. Browse products on our website, select what you want, and send a WhatsApp message. We offer same-day delivery in Mumbai and Pan India 4–7 days delivery.",
        },
      },
      {
        "@type": "Question",
        "name": "Does Shree Ambika Beauty Shop deliver outside Mumbai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We deliver Pan India in 4–7 days and also ship worldwide. Order via WhatsApp: +918291455297 or through our website.",
        },
      },
      {
        "@type": "Question",
        "name": "Where is Shree Ambika Beauty Shop located?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Shree Ambika Beauty Shop is located at Anand Nagar Metro Station, Dahisar East, Mumbai, Maharashtra 400068. We also have an online store at www.shreeambikabeauty.com with WhatsApp ordering.",
        },
      },
      {
        "@type": "Question",
        "name": "What brands are available at Shree Ambika Beauty Shop?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We stock 500+ top brands including Lakme, Maybelline, L'Oreal, SUGAR, Wella, Pilgrim, Jovees, Streax, Mamaearth, Biotique, Plum, Nykaa, Insight, 6MARS, Swiss Beauty and many more. All products are 100% authentic.",
        },
      },
    ],
  };

  // BreadcrumbList for better Google navigation
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.shreeambikabeauty.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.shreeambikabeauty.com/products" },
      { "@type": "ListItem", "position": 3, "name": "Categories", "item": "https://www.shreeambikabeauty.com/categories" },
    ],
  };

  // WebSite schema for sitelinks searchbox
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Shree Ambika Beauty Shop",
    "url": "https://www.shreeambikabeauty.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.shreeambikabeauty.com/products?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable} ${cormorant.variable} ${dancing.variable} ${dmSerif.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body className="font-sans antialiased">
          <UserProvider>
            <SettingsProvider>
              <WishlistProvider>
                <VisitorTracker />
                {children}
                <CustomerLoginModal />
              </WishlistProvider>
            </SettingsProvider>
          </UserProvider>
        </body>
    </html>
  );
}

