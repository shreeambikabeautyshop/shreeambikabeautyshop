import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import ProductGrid from "@/app/components/ProductGrid";

export const dynamic = "force-dynamic";

// Brand slug → display name + SEO data
// slug is lowercase, hyphenated version of brand name
export const BRAND_SEO: Record<string, {
  display: string;
  title: string;
  desc: string;
  about: string;
  gradient: string;
  emoji: string;
}> = {
  "insight-professional": {
    display: "Insight Professional",
    title: "Buy Insight Professional Products Mumbai | Foundation Lip Liner Palette | Shree Ambika",
    desc: "Buy 100% original Insight Professional makeup in Mumbai — HD Foundation, 5-in-1 Skin Tint, Lip Liners, Eye Palettes, Blush. Best price. Same day delivery. WhatsApp +918291455297",
    about: "Insight Professional is India's leading professional makeup brand trusted by makeup artists. Known for HD Foundation, Skin Tint, Concealers, and Eyeshadow Palettes with superb pigmentation and long-lasting wear.",
    gradient: "from-[#C41E3A] to-[#8B0000]",
    emoji: "💄",
  },
  "swiss-beauty": {
    display: "Swiss Beauty",
    title: "Buy Swiss Beauty Products Mumbai | Eyeliner Serum Fixer Sheet Mask | Shree Ambika",
    desc: "Buy 100% original Swiss Beauty products in Mumbai — Holographic Eyeliner, Makeup Fixer, Vitamin C Serum, Sheet Masks, Strobe Cream. Best price. Same day delivery. WhatsApp +918291455297",
    about: "Swiss Beauty is India's top affordable beauty brand known for Holographic Eyeliners, Glow Up Makeup Fixer, Korean Glow Facial Kit, and Vitamin C Serum. High quality at accessible prices.",
    gradient: "from-[#a855f7] to-[#C41E3A]",
    emoji: "✨",
  },
  "loreal-professionnel": {
    display: "L'Oréal Professionnel",
    title: "Buy L'Oréal Professionnel Products Mumbai | Shampoo Serum Hair Color | Shree Ambika",
    desc: "Buy 100% original L'Oréal Professionnel in Mumbai — Absolut Repair Shampoo, Liss Unlimited Serum, Xtenso Care, Metal DX, Majirel Hair Color. Best price. WhatsApp +918291455297",
    about: "L'Oréal Professionnel is the world's #1 salon professional hair brand. Trusted by hairdressers globally for Absolut Repair, Xtenso, Metal DX, Serie Expert, and Majirel hair color range.",
    gradient: "from-[#f59e0b] to-[#ef4444]",
    emoji: "💆",
  },
  "loreal-paris": {
    display: "L'Oréal Paris",
    title: "Buy L'Oréal Paris Products Mumbai | Hair Color Face Wash Serum | Shree Ambika",
    desc: "Buy 100% original L'Oréal Paris in Mumbai — Casting Creme Gloss Hair Color, Excellence, Revitalift, EverPure. Best price. Same day delivery. WhatsApp +918291455297",
    about: "L'Oréal Paris is the world's most loved beauty brand. Iconic for Casting Creme Gloss hair color, Revitalift skincare, and Excellence hair color — trusted by millions in India.",
    gradient: "from-[#f59e0b] to-[#c2410c]",
    emoji: "🌟",
  },
  "pilgrim": {
    display: "Pilgrim",
    title: "Buy Pilgrim Products Mumbai | Rosemary Shampoo Hair Serum Hair Oil | Shree Ambika",
    desc: "Buy 100% original Pilgrim products in Mumbai — Spanish Rosemary Anti-Hairfall Shampoo, Korean Rice Water Hair Mask, Advanced Hair Growth Serum. Best price. WhatsApp +918291455297",
    about: "Pilgrim is India's premium K-beauty inspired haircare and skincare brand. Known for Spanish Rosemary Biotin Shampoo, Korean Black Rice Hair Mask, and Rootactive Anti-Hairfall Serum.",
    gradient: "from-[#10b981] to-[#0ea5e9]",
    emoji: "🌿",
  },
  "wella-professionals": {
    display: "Wella Professionals",
    title: "Buy Wella Professional Products Mumbai | Shampoo Conditioner INOVA | Shree Ambika",
    desc: "Buy 100% original Wella Professionals in Mumbai — INOVA Nutri Enrich, Smooth Proof, Brilliance Shampoo & Conditioner. Best price. Same day delivery. WhatsApp +918291455297",
    about: "Wella Professionals is a world-leading salon hair brand trusted for 140+ years. The INVIGO, SP, and INOVA ranges are loved by hair professionals and consumers globally.",
    gradient: "from-[#0ea5e9] to-[#6366f1]",
    emoji: "💫",
  },
  "matrix": {
    display: "Matrix",
    title: "Buy Matrix Products Mumbai | Mega Smooth Shampoo Wonder Color SoColor | Shree Ambika",
    desc: "Buy 100% original Matrix in Mumbai — Mega Smooth Shampoo, Opti Care Serum, Wonder Color, SoColor Pre-Bonded Hair Color. Best price. WhatsApp +918291455297",
    about: "Matrix is America's #1 salon brand in India. Known for Mega Smooth, Opti Care, Wonder Color (ammonia-free), and SoColor professional hair color — salon-quality results at home.",
    gradient: "from-[#334155] to-[#1e3a5f]",
    emoji: "🎨",
  },
  "schwarzkopf": {
    display: "Schwarzkopf",
    title: "Buy Schwarzkopf Products Mumbai | OSIS Smooth Shine Hair Serum | Shree Ambika",
    desc: "Buy 100% original Schwarzkopf in Mumbai — OSIS Smooth Shine, Glow Serum, Sparkler Spray. Best price. Same day delivery. WhatsApp +918291455297",
    about: "Schwarzkopf is Germany's premium professional hair brand known for OSIS styling, Smooth & Shine, and professional hair color. Trusted by stylists worldwide.",
    gradient: "from-[#475569] to-[#1e293b]",
    emoji: "⚡",
  },
  "streax-professional": {
    display: "Streax Professional",
    title: "Buy Streax Professional Products Mumbai | Hair Serum Canvo Argan | Shree Ambika",
    desc: "Buy 100% original Streax Professional in Mumbai — Canvo Line Hair Serum, Argan Secrets Hair Color, Repair Max Serum. Best price. Same day delivery. WhatsApp +918291455297",
    about: "Streax Professional is India's trusted professional hair brand. The Canvo Line and Argan Secrets range provide salon-quality results for Indian hair types.",
    gradient: "from-[#92400e] to-[#78350f]",
    emoji: "💇",
  },
  "garnier": {
    display: "Garnier",
    title: "Buy Garnier Products Mumbai | Black Naturals Hair Color Serum Face Wash | Shree Ambika",
    desc: "Buy 100% original Garnier in Mumbai — Black Naturals Hair Color, Color Naturals, Fructis Serum, Vitamin C Face Wash. Best price. Same day delivery. WhatsApp +918291455297",
    about: "Garnier is France's most loved everyday beauty brand. Famous for Black Naturals hair color, Fructis haircare, and Vitamin C skincare — affordable and effective for Indian skin and hair.",
    gradient: "from-[#16a34a] to-[#15803d]",
    emoji: "🌿",
  },
  "lakme": {
    display: "Lakme",
    title: "Buy Lakme Products Mumbai | Lipstick Foundation Kajal Eyeshadow | Shree Ambika",
    desc: "Buy 100% original Lakme in Mumbai — 9to5 Foundation, Enrich Matte Lipstick, Eyeconic Kajal, Absolute Eyeshadow. Best price. Same day delivery. WhatsApp +918291455297",
    about: "Lakme is India's #1 beauty brand, trusted for 70+ years. From iconic Enrich Lipsticks to 9to5 Foundation and Eyeconic Kajal — Lakme understands Indian skin and style perfectly.",
    gradient: "from-[#ec4899] to-[#be185d]",
    emoji: "🌸",
  },
  "maybelline": {
    display: "Maybelline",
    title: "Buy Maybelline Products Mumbai | Fit Me Foundation Colossal Kajal | Shree Ambika",
    desc: "Buy 100% original Maybelline in Mumbai — Fit Me Foundation, Colossal Kajal, SuperStay Lipstick, Sky High Mascara. Best price. Same day delivery. WhatsApp +918291455297",
    about: "Maybelline New York is America's #1 cosmetics brand. Known in India for Fit Me Foundation, Colossal Kajal, SuperStay Lipstick, and Sky High Mascara — designed for every Indian woman.",
    gradient: "from-[#C41E3A] to-[#a855f7]",
    emoji: "💋",
  },
  "mamaearth": {
    display: "Mamaearth",
    title: "Buy Mamaearth Products Mumbai | Vitamin C Serum Onion Shampoo Face Wash | Shree Ambika",
    desc: "Buy 100% original Mamaearth in Mumbai — Vitamin C Face Wash, Onion Shampoo, Turmeric Serum, Ubtan Face Pack. Best price. Same day delivery. WhatsApp +918291455297",
    about: "Mamaearth is India's fastest growing natural beauty brand. Known for toxin-free, plant-based formulations — Onion Shampoo, Vitamin C Serum, and Turmeric range are bestsellers across India.",
    gradient: "from-[#84cc16] to-[#15803d]",
    emoji: "🌱",
  },
  "oshea-herbals": {
    display: "Oshea Herbals",
    title: "Buy Oshea Herbals Products Mumbai | Rice Water Hair Mask Face Pack | Shree Ambika",
    desc: "Buy 100% original Oshea Herbals in Mumbai — Rice Water Nourishing Hair Mask, face packs, herbal skincare. Best price. Same day delivery. WhatsApp +918291455297",
    about: "Oshea Herbals is India's trusted herbal beauty brand combining Ayurvedic wisdom with modern science. Known for Rice Water Hair Mask, herbal face packs, and natural skincare.",
    gradient: "from-[#84cc16] to-[#0ea5e9]",
    emoji: "🌾",
  },
  "jovees": {
    display: "Jovees",
    title: "Buy Jovees Products Mumbai | Jojoba Neem Face Scrub Strawberry Face Wash | Shree Ambika",
    desc: "Buy 100% original Jovees in Mumbai — Jojoba & Neem Face Scrub, Strawberry Face Wash, White Water Lily Lotion, Hair Serum. Best price. WhatsApp +918291455297",
    about: "Jovees is India's premium herbal personal care brand. Using plant extracts and natural ingredients for gentle, effective skincare and haircare that suits all skin types.",
    gradient: "from-[#f59e0b] to-[#84cc16]",
    emoji: "🍓",
  },
};

// Convert brand display name to slug
export function brandToSlug(brand: string): string {
  return brand.toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Convert slug back to search pattern for DB
function slugToSearchPattern(slug: string): string {
  return slug.replace(/-/g, " ");
}

async function getBrandProducts(brandSlug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const seoData = BRAND_SEO[brandSlug];
  const searchName = seoData?.display || slugToSearchPattern(brandSlug);

  // Try exact match first, then ilike
  const { data: exact } = await supabase
    .from("products")
    .select("id,name,slug,brand,category,price,mrp,discount,images,rating,reviews_count,in_stock")
    .ilike("brand", searchName)
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  if (exact && exact.length > 0) return { products: exact, displayName: exact[0].brand };

  // Fuzzy match on first word of brand
  const firstWord = searchName.split(" ")[0];
  const { data: fuzzy } = await supabase
    .from("products")
    .select("id,name,slug,brand,category,price,mrp,discount,images,rating,reviews_count,in_stock")
    .ilike("brand", `%${firstWord}%`)
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  return { products: fuzzy || [], displayName: seoData?.display || searchName };
}

export async function generateStaticParams() {
  return Object.keys(BRAND_SEO).map((brand) => ({ brand }));
}

export async function generateMetadata({ params }: { params: { brand: string } }): Promise<Metadata> {
  const seo = BRAND_SEO[params.brand];
  const displayName = seo?.display || params.brand.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: seo?.title || `Buy ${displayName} Products Mumbai | 100% Original | Shree Ambika`,
    description: seo?.desc || `Buy 100% original ${displayName} products in Mumbai at best price. Same day delivery. Pan India 4–7 days. WhatsApp: +918291455297`,
    alternates: { canonical: `https://www.shreeambikabeauty.com/brands/${params.brand}` },
    openGraph: {
      title: seo?.title || `${displayName} Products — Shree Ambika Beauty Shop Mumbai`,
      description: seo?.desc || `100% original ${displayName} in Mumbai. Same day delivery. WhatsApp: +918291455297`,
      url: `https://www.shreeambikabeauty.com/brands/${params.brand}`,
      images: [{ url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png", width: 1200, height: 630, alt: `${displayName} Products — Shree Ambika Beauty Shop Mumbai` }],
      siteName: "Shree Ambika Beauty Shop",
      locale: "en_IN",
      type: "website",
    },
  };
}

export default async function BrandPage({ params }: { params: { brand: string } }) {
  const seo = BRAND_SEO[params.brand];
  const { products, displayName } = await getBrandProducts(params.brand);
  const gradient = seo?.gradient || "from-brand-primary to-[#8B0000]";
  const emoji    = seo?.emoji    || "✨";

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${displayName} Products — Shree Ambika Beauty Shop Mumbai`,
    "description": seo?.about || `100% original ${displayName} products at best prices in Mumbai.`,
    "url": `https://www.shreeambikabeauty.com/brands/${params.brand}`,
    "numberOfItems": products.length,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Shree Ambika Beauty Shop",
      "telephone": "+918291455297",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dahisar East",
        "addressRegion": "Maharashtra",
        "postalCode": "400068",
        "addressCountry": "IN",
      },
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Where can I buy original ${displayName} products in Mumbai?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Shree Ambika Beauty Shop in Dahisar East, Mumbai stocks 100% original ${displayName} products. Same day delivery in Mumbai. WhatsApp: +918291455297 or shop at shreeambikabeauty.com/brands/${params.brand}.`,
        },
      },
      {
        "@type": "Question",
        "name": `Are ${displayName} products at Shree Ambika 100% original?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, all ${displayName} products at Shree Ambika Beauty Shop are 100% original, sourced directly from authorized distributors. We have been serving Mumbai customers since 2001 with only genuine products.`,
        },
      },
      {
        "@type": "Question",
        "name": `Does Shree Ambika deliver ${displayName} products Pan India?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes! Shree Ambika Beauty Shop delivers ${displayName} products across India in 4–7 working days. Same-day delivery available in Mumbai. Cash on Delivery (COD) available. WhatsApp: +918291455297.`,
        },
      },
      {
        "@type": "Question",
        "name": `What is the price of ${displayName} products in Mumbai?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Shree Ambika Beauty Shop offers ${displayName} products at the best prices in Mumbai. We carry ${products.length > 0 ? `${products.length}+ products` : "the full range"} from ${displayName}. WhatsApp +918291455297 for current pricing or shop online at shreeambikabeauty.com.`,
        },
      },
    ],
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="bg-gray-50 min-h-screen">
        {/* Hero */}
        <div className={`bg-gradient-to-r ${gradient} text-white py-12 px-4`}>
          <div className="max-w-[1400px] mx-auto">
            <nav className="text-xs text-white/60 mb-3 flex items-center gap-1.5 flex-wrap">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>›</span>
              <Link href="/brands" className="hover:text-white">Brands</Link>
              <span>›</span>
              <span className="text-white/90">{displayName}</span>
            </nav>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-5xl">{emoji}</span>
              <div>
                <h1 className="text-3xl font-bold font-serif">{displayName}</h1>
                <p className="text-white/70 text-sm mt-0.5">
                  {products.length > 0 ? `${products.length} products` : "Products coming soon"} • 100% Original • Mumbai Store • Pan India Delivery
                </p>
              </div>
            </div>
            {seo?.about && (
              <p className="text-white/80 text-sm max-w-2xl leading-relaxed mt-3 border-t border-white/20 pt-3">
                {seo.about}
              </p>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <ProductGrid
            products={products}
            source="brand_page"
            emptyTitle={`${displayName} Products Coming Soon!`}
            emptyMessage={`WhatsApp us to check availability of any ${displayName} product.`}
            emptyWhatsAppMsg={`Hi Vinod! Do you have ${displayName} products? Please suggest.`}
          />
        </div>

        {/* Brand info + CTA */}
        <div className="max-w-[1400px] mx-auto px-4 pb-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">About {displayName}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {seo?.about || `${displayName} products are available at Shree Ambika Beauty Shop, Mumbai's most trusted beauty store since 2001.`}{" "}
              Shop all {displayName} products online with same-day delivery in Mumbai or Pan India delivery in 4–7 days.
              All products are 100% original, sourced from authorized distributors.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={`https://wa.me/918291455297?text=Hi Vinod! I want to order ${displayName} products.`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors">
                💬 WhatsApp to Order
              </a>
              <Link href="/brands" className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-600 font-bold px-5 py-2.5 rounded-full text-sm hover:border-brand-primary hover:text-brand-primary transition-colors">
                ← All Brands
              </Link>
            </div>
          </div>

          {/* Related brands */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Explore Other Brands</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(BRAND_SEO)
                .filter(([slug]) => slug !== params.brand)
                .slice(0, 12)
                .map(([slug, b]) => (
                  <Link key={slug} href={`/brands/${slug}`}
                    className="text-xs font-semibold bg-brand-light text-brand-primary px-3 py-1.5 rounded-full border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-colors">
                    {b.emoji} {b.display}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
