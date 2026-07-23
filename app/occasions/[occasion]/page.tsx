import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

type OccasionMeta = {
  title: string;
  desc: string;
  emoji: string;
  heroText: string;
  heroSub: string;
  whatsappMsg: string;
};

const OCCASIONS: Record<string, OccasionMeta> = {
  wedding: {
    title: "Wedding Beauty Products | Bridal Makeup & Skincare | Shree Ambika",
    desc: "Get bridal-ready with 100% original wedding beauty products — foundation, highlighter, long-lasting lipstick, setting spray & more. Mumbai's trusted shop since 2001.",
    emoji: "💍",
    heroText: "Wedding Beauty",
    heroSub: "Look stunning on your special day with bridal-approved beauty essentials",
    whatsappMsg: "Hi Vinod! I need beauty products for a wedding. Can you help?",
  },
  party: {
    title: "Party Makeup & Beauty Products | Shree Ambika Beauty Shop",
    desc: "Glam up for every party with bold makeup, shimmer, glitter, and long-lasting products. Original brands, best prices, same-day delivery in Mumbai.",
    emoji: "🎉",
    heroText: "Party Glam",
    heroSub: "Bold, beautiful, and ready to party — all the makeup you need to steal the show",
    whatsappMsg: "Hi Vinod! I need party makeup and beauty products. Can you suggest some?",
  },
  office: {
    title: "Office Makeup & Skincare | Everyday Professional Look | Shree Ambika",
    desc: "Subtle, professional, and polished — shop office-ready beauty products including light foundation, moisturizers, lip balms, and skincare for a confident workday look.",
    emoji: "💼",
    heroText: "Office-Ready Beauty",
    heroSub: "Professional, polished, and put-together — effortless beauty for the workday",
    whatsappMsg: "Hi Vinod! I need professional office-appropriate makeup and skincare. What do you recommend?",
  },
  daily: {
    title: "Daily Use Beauty Products | Skincare & Makeup Essentials | Shree Ambika",
    desc: "Your everyday beauty routine made easy — sunscreen, moisturizer, tinted lip balm, kajal, face wash, and more. 100% original products at the best prices.",
    emoji: "☀️",
    heroText: "Daily Essentials",
    heroSub: "Your everyday beauty routine, simplified with the best products at the best prices",
    whatsappMsg: "Hi Vinod! I need daily use beauty products for my routine. What do you have?",
  },
  "date-night": {
    title: "Date Night Makeup & Perfumes | Shree Ambika Beauty Shop Mumbai",
    desc: "Make a lasting impression — shop date night beauty products including bold lipsticks, eye makeup, perfumes, and skincare from 500+ top brands.",
    emoji: "🌹",
    heroText: "Date Night Beauty",
    heroSub: "Make every moment unforgettable — irresistible fragrance, bold lips, luminous skin",
    whatsappMsg: "Hi Vinod! I need date night beauty products — makeup and perfumes. Can you help?",
  },
  festival: {
    title: "Festival Makeup & Beauty | Diwali Navratri Holi | Shree Ambika",
    desc: "Celebrate every festival in full glory — ethnic makeup, vibrant colours, kajal, bangles accessories and traditional beauty looks. Mumbai's top beauty shop since 2001.",
    emoji: "🪔",
    heroText: "Festival Beauty",
    heroSub: "Celebrate in colour and style — traditional looks, vibrant makeup, festival-ready",
    whatsappMsg: "Hi Vinod! I need beauty products for the upcoming festival. What do you suggest?",
  },
  travel: {
    title: "Travel Beauty Essentials | Mini & Travel Size Products | Shree Ambika",
    desc: "Pack light, look great — travel-size skincare, makeup essentials, sunscreens, and mini perfumes for your next trip. Original brands, TSA-friendly sizes.",
    emoji: "✈️",
    heroText: "Travel Beauty",
    heroSub: "Light luggage, full glam — the best travel-size beauty essentials for every trip",
    whatsappMsg: "Hi Vinod! I need travel-size beauty products for my trip. What do you have?",
  },
  gifting: {
    title: "Beauty Gift Sets & Hampers | Shree Ambika Beauty Shop Mumbai",
    desc: "Perfect beauty gifts for her — skincare gift sets, makeup kits, perfume hampers, and premium beauty products for birthdays, anniversaries, and special occasions.",
    emoji: "🎁",
    heroText: "Beauty Gifting",
    heroSub: "Give the gift of beauty — curated gift sets, hampers, and premium products she'll love",
    whatsappMsg: "Hi Vinod! I want to buy beauty products as a gift. Can you help me pick?",
  },
};

async function getOccasionProducts(occasion: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Try to get products tagged with this occasion
  const { data: tagged } = await supabase
    .from("products")
    .select("id,name,slug,brand,category,price,mrp,discount,images,rating,reviews_count,in_stock")
    .contains("tags", [occasion])
    .eq("in_stock", true)
    .limit(20);

  if (tagged && tagged.length >= 4) return tagged;

  // Fallback to featured products
  const { data: featured } = await supabase
    .from("products")
    .select("id,name,slug,brand,category,price,mrp,discount,images,rating,reviews_count,in_stock")
    .eq("featured", true)
    .eq("in_stock", true)
    .limit(20);

  return featured || [];
}

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  discount: number;
  images: string[];
  rating: number;
  reviews_count: number;
  in_stock: boolean;
};

function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      href={`/products/${p.slug || p.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      <div className="relative aspect-square bg-brand-light overflow-hidden">
        {p.images?.[0] ? (
          <Image
            src={p.images[0]}
            alt={p.name}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">💄</div>
        )}
        {(p.discount ?? 0) > 0 && (
          <span className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {p.discount}% OFF
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-black text-brand-primary uppercase mb-1">{p.brand}</p>
        <h3 className="text-sm font-semibold text-gray-800 leading-tight mb-2 line-clamp-2 flex-1 group-hover:text-brand-primary transition-colors">
          {p.name}
        </h3>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-gray-900">₹{p.price}</span>
          {p.mrp > p.price && (
            <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>
          )}
        </div>
        <div className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white text-xs font-bold py-2.5 rounded-xl">
          🛍 View Product
        </div>
      </div>
    </Link>
  );
}

export async function generateStaticParams() {
  return Object.keys(OCCASIONS).map((occasion) => ({ occasion }));
}

export async function generateMetadata({
  params,
}: {
  params: { occasion: string };
}): Promise<Metadata> {
  const meta = OCCASIONS[params.occasion];
  if (!meta) return { title: "Occasion Not Found" };
  return {
    title: meta.title,
    description: meta.desc,
    alternates: {
      canonical: `https://www.shreeambikabeauty.com/occasions/${params.occasion}`,
    },
    openGraph: {
      title: meta.title,
      description: meta.desc,
      url: `https://www.shreeambikabeauty.com/occasions/${params.occasion}`,
      siteName: "Shree Ambika Beauty Shop",
      locale: "en_IN",
      type: "website",
    },
  };
}

export default async function OccasionPage({
  params,
}: {
  params: { occasion: string };
}) {
  const meta = OCCASIONS[params.occasion];
  if (!meta) notFound();

  const products = await getOccasionProducts(params.occasion);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* Hero Banner */}
        <div className="bg-brand-primary text-white py-16 px-4">
          <div className="max-w-[1200px] mx-auto">
            <nav className="text-xs text-white/60 mb-5">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <Link href="/occasions" className="hover:text-white">Occasions</Link>
              <span className="mx-2">›</span>
              <span className="capitalize">{params.occasion.replace(/-/g, " ")}</span>
            </nav>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
              <span
                className="w-24 h-24 rounded-3xl bg-white/15 flex items-center justify-center text-6xl flex-shrink-0 shadow-xl"
                aria-hidden="true"
              >
                {meta.emoji}
              </span>
              <div>
                <p className="font-script text-brand-accent text-lg mb-1">Shop by Occasion</p>
                <h1 className="text-4xl md:text-5xl font-heading italic text-white mb-3">
                  {meta.heroText}
                </h1>
                <p className="text-white/80 text-base max-w-xl leading-relaxed">{meta.heroSub}</p>
                <div className="flex flex-wrap gap-3 mt-5">
                  <a
                    href={`https://wa.me/918291455297?text=${encodeURIComponent(meta.whatsappMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full text-sm transition-all"
                  >
                    💬 WhatsApp Vinod for Advice
                  </a>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-6 py-3 rounded-full text-sm transition-all border border-white/30"
                  >
                    🛍 All Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-[1200px] mx-auto px-4 py-12">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">{meta.emoji}</p>
              <h2 className="text-xl font-bold text-gray-600 mb-2">Products Coming Soon!</h2>
              <p className="text-gray-400 text-sm mb-6">
                WhatsApp Vinod to get personalized product recommendations for{" "}
                {meta.heroText.toLowerCase()}.
              </p>
              <a
                href={`https://wa.me/918291455297?text=${encodeURIComponent(meta.whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-all"
              >
                💬 WhatsApp +918291455297
              </a>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {meta.heroText} Products
                  </h2>
                  <p className="text-sm text-gray-500">
                    {products.length} products • 100% original • Best prices
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            </>
          )}

          {/* WhatsApp CTA Banner */}
          <div className="mt-12 bg-brand-primary rounded-3xl p-8 text-center text-white">
            <p className="text-4xl mb-3">{meta.emoji}</p>
            <h3 className="font-bold text-2xl mb-2">
              Need help picking the perfect products?
            </h3>
            <p className="text-white/80 text-sm mb-6 max-w-lg mx-auto">
              WhatsApp Vinod directly. With 24+ years of experience, he&apos;ll recommend exactly what
              you need for {meta.heroText.toLowerCase()}.
            </p>
            <a
              href={`https://wa.me/918291455297?text=${encodeURIComponent(meta.whatsappMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-base transition-all"
            >
              💬 WhatsApp Vinod — +91 82914 55297
            </a>
          </div>

          {/* Other Occasions */}
          <div className="mt-12">
            <h3 className="font-bold text-gray-900 text-lg mb-5">Shop Other Occasions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(OCCASIONS)
                .filter(([slug]) => slug !== params.occasion)
                .slice(0, 4)
                .map(([slug, occ]) => (
                  <Link
                    key={slug}
                    href={`/occasions/${slug}`}
                    className="flex flex-col items-center gap-2 bg-white border border-gray-200 hover:border-brand-primary rounded-2xl p-4 text-center text-sm font-semibold text-gray-600 hover:text-brand-primary transition-all hover:shadow-sm"
                  >
                    <span className="text-3xl">{occ.emoji}</span>
                    <span>{occ.heroText}</span>
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
