import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import { FaStar, FaStarHalfAlt, FaRegStar, FaWhatsapp } from "react-icons/fa";
import { FiCheck, FiTruck, FiChevronRight } from "react-icons/fi";
import ProductActions from "./ProductActions";

async function getProduct(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: e1 } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (e1) return e1;
  const { data: e2 } = await supabase.from("products").select("*").eq("id", slug).maybeSingle();
  if (e2) return e2;
  const base = slug.replace(/-[a-z0-9]{6,}$/, "");
  if (base !== slug) {
    const { data: e3 } = await supabase.from("products").select("*").ilike("slug", `${base}%`).limit(1).maybeSingle();
    if (e3) return e3;
  }
  return null;
}

async function getRelated(category: string, excludeId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from("products")
    .select("id,name,slug,brand,price,mrp,images,rating")
    .eq("category", category).eq("in_stock", true).neq("id", excludeId).limit(6);
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
    alternates: { canonical: `https://www.shreeambikabeauty.com/products/${p.slug || p.id}` },
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => {
        if (s <= Math.floor(rating)) return <FaStar key={s} size={14} className="text-yellow-400" />;
        if (s === Math.ceil(rating) && rating % 1 >= 0.5) return <FaStarHalfAlt key={s} size={14} className="text-yellow-400" />;
        return <FaRegStar key={s} size={14} className="text-yellow-300" />;
      })}
    </div>
  );
}

type RelatedProduct = { id: string; name: string; slug: string; brand: string; price: number; images: string[]; };
type Faq = { q: string; a: string };

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug);
  if (!p) notFound();

  const related = await getRelated(p.category, p.id);
  const productUrl = `https://www.shreeambikabeauty.com/products/${p.slug || p.id}`;

  // JSON-LD schemas
  const productSchema = {
    "@context": "https://schema.org", "@type": "Product",
    name: p.name, description: p.description, image: p.images || [],
    sku: p.slug || p.id, brand: { "@type": "Brand", name: p.brand },
    offers: { "@type": "Offer", priceCurrency: "INR", price: p.price,
      availability: p.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Shree Ambika Beauty Shop", telephone: "+918291455297" } },
    ...(p.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews_count || 1 } } : {}),
  };
  const faqSchema = p.faq?.length ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: p.faq.map((f: Faq) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  } : null;

  const delivery = [
    { icon: "⚡", title: "Same Day — Mumbai", sub: "Order before 12 PM · Delivered same evening" },
    { icon: "📦", title: "Mumbai Metro · 1–2 Days", sub: "Thane, Navi Mumbai, Kalyan, Mira Road" },
    { icon: "🚚", title: "Maharashtra · 2–4 Days", sub: "Pune, Nashik, Nagpur & all cities" },
    { icon: "🇮🇳", title: "Pan India · 4–7 Days", sub: "Blue Dart / Delhivery / DTDC" },
    { icon: "🌍", title: "International · 7–14 Days", sub: "Worldwide · WhatsApp for rates" },
  ];

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
            <span className="text-gray-600 line-clamp-1 max-w-xs">{p.name}</span>
          </nav>

          {/* ── MAIN PRODUCT CARD ── */}
          <div className="grid md:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden shadow-sm mb-6">

            {/* LEFT — Image fills full height, no padding, no gap */}
            <div className="relative bg-gray-50" style={{ minHeight: "500px" }}>
              {p.images?.[0] ? (
                <Image src={p.images[0]} alt={p.name} fill
                  className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">💄</div>
              )}
              {/* Thumbnail overlay bottom */}
              {p.images?.length > 1 && (
                <div className="absolute bottom-3 left-3 flex gap-1.5">
                  {p.images.slice(0, 5).map((img: string, i: number) => (
                    <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-md">
                      <Image src={img} alt={`view ${i+1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Product info with scroll */}
            <div className="flex flex-col gap-3.5 p-6 overflow-y-auto" style={{ maxHeight: "800px" }}>

              {/* Category + Brand row */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold text-brand-primary bg-brand-light px-3 py-1 rounded-full border border-brand-accent/30">
                  🏷 {p.category}
                </span>
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{p.brand}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{p.name}</h1>

              {/* Stars + reviews + sold */}
              <div className="flex items-center gap-2 flex-wrap">
                <Stars rating={p.rating || 4.2} />
                <span className="font-bold text-gray-700 text-sm">{p.rating || 4.2}</span>
                <span className="text-sm text-gray-400">({p.reviews_count || 0} Reviews)</span>
                {p.in_stock && <span className="text-xs text-gray-400 border-l border-gray-200 pl-2">250+ Sold</span>}
              </div>

              {/* Price — controlled by settings via ProductActions */}

              {/* Suitable for */}
              {p.suitable_for && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">Suitable for: </span>{p.suitable_for}
                </p>
              )}

              {/* Delivery */}
              <div className="bg-brand-light rounded-2xl p-4 border border-pink-100">
                <p className="font-bold text-gray-800 text-xs mb-2.5 flex items-center gap-1.5">
                  <FiTruck className="text-brand-primary" size={14} /> Delivery Information
                </p>
                <div className="space-y-1.5">
                  {delivery.map((d) => (
                    <div key={d.title} className="flex items-start gap-2">
                      <span className="text-sm flex-shrink-0 leading-tight">{d.icon}</span>
                      <div>
                        <span className="text-[11px] font-bold text-gray-800">{d.title}</span>
                        <span className="text-[10px] text-gray-500 ml-1">· {d.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-pink-100">
                  Delivery charges applicable · WhatsApp for exact cost
                </p>
              </div>

              {/* Quantity + Buy (client component handles price display + settings) */}
              <ProductActions productName={p.name} price={p.price} mrp={p.mrp} slug={p.slug || p.id} />

              <p className="text-[11px] text-gray-400 text-center">
                Est. 2001 · Mumbai&apos;s trusted beauty store · 25+ years of service
              </p>
            </div>
          </div>

          {/* ── ABOUT + HOW TO USE ── */}
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 text-lg mb-3">About This Product</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{p.description}</p>
              {p.key_benefits?.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">Key Benefits</h3>
                  <ul className="space-y-1.5">
                    {p.key_benefits.map((b: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <FiCheck className="text-green-500 flex-shrink-0 mt-0.5" size={12} />{b}
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
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-5">{p.how_to_use}</p>
                </>
              )}
              {p.tags?.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag: string) => (
                      <span key={tag} className="text-[10px] bg-brand-light text-brand-primary px-2.5 py-1 rounded-full">#{tag}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── FAQ ── */}
          {p.faq?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {p.faq.map((f: Faq, i: number) => (
                  <div key={i} className="border-b border-gray-50 pb-3 last:border-0">
                    <p className="font-semibold text-brand-primary text-sm mb-1">Q: {f.q}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">A: {f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── YOU MAY ALSO LIKE ── */}
          {related.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="font-bold text-gray-800 text-lg mb-5">You May Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {related.map((r: RelatedProduct) => {
                  const rWaMsg = encodeURIComponent(
                    `Hi Vinod! I want to order:\n*${r.name}*\nPrice: ₹${r.price}\n\nhttps://www.shreeambikabeauty.com/products/${r.slug || r.id}`
                  );
                  return (
                    <div key={r.id} className="group flex flex-col border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                      {/* Image */}
                      <Link href={`/products/${r.slug || r.id}`}>
                        <div className="relative aspect-square bg-gray-50 overflow-hidden">
                          {r.images?.[0] && (
                            <Image src={r.images[0]} alt={r.name} fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          )}
                        </div>
                      </Link>
                      {/* Info */}
                      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
                        <Link href={`/products/${r.slug || r.id}`}>
                          <p className="text-[10px] font-semibold text-gray-700 line-clamp-2 leading-tight hover:text-brand-primary transition-colors">{r.name}</p>
                        </Link>
                        <p className="text-sm font-bold text-gray-900">₹{r.price}</p>
                        {/* Buttons */}
                        <div className="flex gap-1.5 mt-auto">
                          <Link href={`/products/${r.slug || r.id}`}
                            className="flex-1 text-center text-[9px] font-semibold border border-gray-200 text-gray-600 py-1.5 rounded-lg hover:border-brand-primary hover:text-brand-primary transition-colors">
                            View
                          </Link>
                          <a href={`https://wa.me/918291455297?text=${rWaMsg}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-0.5 text-[9px] font-bold text-white py-1.5 rounded-lg transition-colors"
                            style={{ background: "#25D366" }}>
                            <FaWhatsapp size={9} /> Buy
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
