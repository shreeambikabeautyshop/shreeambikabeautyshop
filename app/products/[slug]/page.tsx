import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import { FaStar, FaWhatsapp, FaStarHalfAlt, FaRegStar, FaShareAlt } from "react-icons/fa";
import { FiCheck, FiTruck, FiChevronRight } from "react-icons/fi";
import ProductActions from "./ProductActions";

async function getProduct(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  // Exact slug
  const { data: exact } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (exact) return exact;
  // By ID
  const { data: byId } = await supabase.from("products").select("*").eq("id", slug).maybeSingle();
  if (byId) return byId;
  // Partial slug (handles timestamp suffix)
  const slugBase = slug.replace(/-[a-z0-9]{6,}$/, "");
  if (slugBase !== slug) {
    const { data: partial } = await supabase.from("products").select("*").ilike("slug", `${slugBase}%`).limit(1).maybeSingle();
    if (partial) return partial;
  }
  return null;
}

async function getRelated(category: string, excludeId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from("products").select("id,name,slug,brand,price,mrp,images,rating").eq("category", category).eq("in_stock", true).neq("id", excludeId).limit(6);
  return data || [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProduct(params.slug);
  if (!p) return { title: "Product Not Found" };
  return {
    title: p.seo_title || `${p.name} | Shree Ambika Beauty Shop Mumbai`,
    description: p.seo_description || `Buy ${p.name} at best price in Mumbai. Pan India delivery. WhatsApp Vinod: +918291455297`,
    keywords: Array.isArray(p.tags) ? p.tags.join(", ") : "",
    openGraph: {
      title: p.seo_title || p.name,
      description: p.seo_description || p.description,
      images: p.images?.[0] ? [{ url: p.images[0], width: 800, height: 800, alt: p.name }] : [],
    },
    alternates: { canonical: `https://shreeambikabeautyshop.vercel.app/products/${p.slug || p.id}` },
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        if (s <= Math.floor(rating)) return <FaStar key={s} size={14} className="text-yellow-400" />;
        if (s === Math.ceil(rating) && rating % 1 >= 0.5) return <FaStarHalfAlt key={s} size={14} className="text-yellow-400" />;
        return <FaRegStar key={s} size={14} className="text-yellow-300" />;
      })}
    </div>
  );
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug);
  if (!p) notFound();

  const related = await getRelated(p.category, p.id);
  const waMsg = encodeURIComponent(
    `Hi Vinod! I want to order:\n*${p.name}*\nPrice: ₹${p.price}\n\nhttps://shreeambikabeautyshop.vercel.app/products/${p.slug || p.id}`
  );
  const shareMsg = encodeURIComponent(
    `✨ ${p.name}\n₹${p.price} | Shree Ambika Beauty Shop Mumbai\nWhatsApp: +91-8291455297\nhttps://shreeambikabeautyshop.vercel.app/products/${p.slug || p.id}`
  );

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images || [],
    sku: p.slug || p.id,
    brand: { "@type": "Brand", name: p.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: p.price,
      availability: p.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Shree Ambika Beauty Shop", telephone: "+918291455297" },
    },
    ...(p.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews_count || 1 } } : {}),
  };

  const faqSchema = p.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: p.faq.map((f: { q: string; a: string }) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 py-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5 flex-wrap">
            <Link href="/" className="hover:text-brand-primary">Home</Link>
            <FiChevronRight size={10} />
            <Link href="/products" className="hover:text-brand-primary">Products</Link>
            <FiChevronRight size={10} />
            <Link href={`/categories/${p.category?.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-brand-primary">{p.category}</Link>
            <FiChevronRight size={10} />
            <span className="text-gray-600 line-clamp-1">{p.name}</span>
          </nav>

          {/* ── Main product card ── */}
          <div className="grid md:grid-cols-2 gap-8 bg-white rounded-3xl p-6 shadow-sm mb-6">

            {/* LEFT — Images */}
            <div>
              {/* Main image */}
              <div
                className="relative rounded-2xl overflow-hidden bg-white mb-3 border border-gray-100"
                style={{ aspectRatio: "1/1" }}
              >
                {p.images?.[0] ? (
                  <Image src={p.images[0]} alt={p.name} fill className="object-contain" priority />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">💄</div>
                )}
                {/* Share button — top-right */}
                <a
                  href={`https://wa.me/?text=${shareMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md border border-gray-100 hover:bg-white transition-all"
                  aria-label="Share on WhatsApp"
                >
                  <FaShareAlt size={14} className="text-gray-600" />
                </a>
              </div>

              {/* Thumbnail strip */}
              {p.images?.length > 1 && (
                <div className="flex gap-2">
                  {p.images.slice(0, 5).map((img: string, i: number) => (
                    <div
                      key={i}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 hover:border-brand-primary transition-colors cursor-pointer"
                    >
                      <Image src={img} alt={`${p.name} ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Product info */}
            <div className="flex flex-col gap-4">

              {/* 1. Category pill */}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary bg-brand-light px-3 py-1 rounded-full w-fit border border-brand-accent/30">
                🏷 {p.category}
              </span>

              {/* 2. Brand + 3. Title */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{p.brand}</p>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{p.name}</h1>
              </div>

              {/* 4. Stars + rating + reviews + sold */}
              <div className="flex items-center gap-3 flex-wrap">
                <Stars rating={p.rating || 4.2} />
                <span className="font-bold text-gray-700 text-sm">{p.rating || 4.2}</span>
                <span className="text-sm text-gray-400">({p.reviews_count || 0} Reviews)</span>
                {p.in_stock && (
                  <span className="text-xs text-gray-400 border-l border-gray-200 pl-3">250+ Sold</span>
                )}
              </div>

              {/* 5. Price block */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">Our Price</p>
                <p className="text-4xl font-black text-gray-900 leading-none mb-1">
                  <span className="text-xl font-normal">₹</span>
                  {p.price.toLocaleString("en-IN")}
                </p>
                {p.mrp > p.price && (
                  <p className="text-sm text-gray-400">
                    MRP <span className="line-through">₹{p.mrp.toLocaleString("en-IN")}</span>
                  </p>
                )}
              </div>

              {/* 6. Stock status */}
              <div className={`flex items-center gap-2 text-sm font-semibold ${p.in_stock ? "text-green-600" : "text-red-500"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${p.in_stock ? "bg-green-500" : "bg-red-500"}`} />
                {p.in_stock ? "In Stock — Ready to Ship" : "Out of Stock"}
              </div>

              {/* 7. Suitable for */}
              {p.suitable_for && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">Suitable for: </span>
                  {p.suitable_for}
                </p>
              )}

              {/* 8. Delivery Info */}
              <div className="bg-gradient-to-r from-brand-light to-white rounded-2xl p-4 border border-pink-100">
                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                  <FiTruck className="text-brand-primary" size={16} /> Delivery Information
                </h3>
                <div className="space-y-2">
                  {[
                    { icon: "⚡", title: "Same Day Delivery — Mumbai", sub: "Order before 12 PM · Delivered same evening" },
                    { icon: "📦", title: "Mumbai & Thane · 1–2 Days", sub: "Navi Mumbai, Thane, Mira-Bhayandar, Kalyan" },
                    { icon: "🚚", title: "Maharashtra · 2–4 Days", sub: "Pune, Nashik, Nagpur, Aurangabad & all cities" },
                    { icon: "🇮🇳", title: "Pan India · 4–7 Days", sub: "All states via Blue Dart / Delhivery / DTDC" },
                    { icon: "🌍", title: "International · 7–14 Days", sub: "Worldwide shipping · WhatsApp for rates" },
                  ].map((d) => (
                    <div key={d.title} className="flex items-start gap-2.5">
                      <span className="text-base flex-shrink-0">{d.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{d.title}</p>
                        <p className="text-[11px] text-gray-500">{d.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-pink-100">
                  <p className="text-[11px] text-gray-500 font-medium">
                    📦 Delivery charges applicable · WhatsApp for exact shipping cost
                  </p>
                </div>
              </div>

              {/* 9 + 10. Quantity selector + Buy on WhatsApp (client component) */}
              <ProductActions
                productName={p.name}
                price={p.price}
                slug={p.slug || p.id}
                waMsg={waMsg}
              />

              {/* 11. Why Buy From Us */}
              <p className="text-xs text-gray-500 text-center pt-1">
                Est. 2001 · Mumbai's trusted beauty store · 25+ years of service
              </p>

            </div>
          </div>

          {/* ── About + How to Use ── */}
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 text-lg mb-3">About This Product</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
              {p.key_benefits?.length > 0 && (
                <>
                  <h3 className="font-bold text-gray-700 mt-4 mb-2 text-sm">Key Benefits</h3>
                  <ul className="space-y-1.5">
                    {p.key_benefits.map((b: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <FiCheck className="text-green-500 flex-shrink-0 mt-0.5" size={13} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {p.how_to_use && (
                <>
                  <h2 className="font-bold text-gray-800 text-lg mb-3">How to Use</h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-4">{p.how_to_use}</p>
                </>
              )}
              {p.tags?.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-700 mb-2 text-sm">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag: string) => (
                      <span key={tag} className="text-[10px] bg-brand-light text-brand-primary px-2.5 py-1 rounded-full font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── FAQ ── */}
          {p.faq?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="font-bold text-gray-800 text-xl mb-5">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {p.faq.map((f: { q: string; a: string }, i: number) => (
                  <div key={i} className="border-b border-gray-50 pb-3 last:border-0">
                    <p className="font-semibold text-brand-primary text-sm mb-1">Q: {f.q}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">A: {f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── You May Also Like ── */}
          {related.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="font-bold text-gray-800 text-lg mb-4">You May Also Like</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {related.map((r: { id: string; name: string; slug: string; brand: string; price: number; mrp: number; images: string[]; rating: number }) => (
                  <Link key={r.id} href={`/products/${r.slug || r.id}`} className="group flex flex-col gap-1.5">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-brand-accent transition-colors">
                      {r.images?.[0] && (
                        <Image src={r.images[0]} alt={r.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                    </div>
                    <p className="text-[10px] font-semibold text-gray-700 line-clamp-2 leading-tight">{r.name}</p>
                    <p className="text-xs font-bold text-gray-900">₹{r.price}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  );
}
