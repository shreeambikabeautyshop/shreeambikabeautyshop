import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import { FaStar, FaWhatsapp } from "react-icons/fa";
import { FiCheck, FiTruck, FiShield } from "react-icons/fi";

async function getProduct(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("products")
    .select("*")
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single();
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProduct(params.slug);
  if (!p) return { title: "Product Not Found" };
  return {
    title: p.seo_title || `${p.name} | Shree Ambika Beauty Shop Mumbai`,
    description: p.seo_description || `Buy ${p.name} at best price in Mumbai. 100% original. Pan India delivery. WhatsApp Vinod: +918291455297`,
    keywords: Array.isArray(p.tags) ? p.tags.join(", ") : "",
    openGraph: {
      title: p.seo_title || p.name,
      description: p.seo_description || p.description,
      images: p.images?.[0] ? [{ url: p.images[0], width: 800, height: 800, alt: p.name }] : [],
      type: "website",
    },
    alternates: { canonical: `https://shreeambikabeautyshop.vercel.app/products/${p.slug || p.id}` },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug);
  if (!p) notFound();

  const waMessage = encodeURIComponent(`Hi Vinod! I want to order: ${p.name} (₹${p.price}). Please confirm availability.`);
  const waLink = `https://wa.me/918291455297?text=${waMessage}`;

  // JSON-LD Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.name,
    "description": p.description,
    "image": p.images || [],
    "sku": p.slug || p.id,
    "brand": { "@type": "Brand", "name": p.brand },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": p.price,
      "availability": p.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      "seller": {
        "@type": "Organization",
        "name": "Shree Ambika Beauty Shop",
        "telephone": "+918291455297",
      },
    },
    "aggregateRating": p.rating ? {
      "@type": "AggregateRating",
      "ratingValue": p.rating,
      "reviewCount": p.reviews_count || 1,
    } : undefined,
  };

  // FAQ Schema for AEO
  const faqSchema = p.faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": p.faq.map((f: { q: string; a: string }) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  } : null;

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-xs text-gray-400 mb-6 flex gap-2 flex-wrap">
            <Link href="/" className="hover:text-brand-primary">Home</Link>
            <span>›</span>
            <Link href="/products" className="hover:text-brand-primary">Products</Link>
            <span>›</span>
            <Link href={`/categories/${p.category?.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-brand-primary">{p.category}</Link>
            <span>›</span>
            <span className="text-gray-600 line-clamp-1">{p.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 bg-white rounded-3xl p-6 shadow-sm mb-8">
            {/* Images */}
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-brand-light mb-3">
                {p.images?.[0] ? (
                  <Image src={p.images[0]} alt={p.name} fill className="object-contain p-4" priority />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">💄</div>
                )}
              </div>
              {p.images?.length > 1 && (
                <div className="flex gap-2">
                  {p.images.slice(0, 5).map((img: string, i: number) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100">
                      <Image src={img} alt={`${p.name} ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-2">{p.brand}</p>
              <h1 className="text-2xl font-bold text-gray-800 mb-3 leading-tight">{p.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <FaStar key={s} size={14} className={s <= Math.floor(p.rating || 4) ? "text-yellow-400" : "text-gray-200"} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({p.reviews_count || 0} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">₹{p.price}</span>
                {p.mrp > p.price && <span className="text-lg text-gray-400 line-through">₹{p.mrp}</span>}
                {p.discount > 0 && (
                  <span className="bg-green-100 text-green-700 font-bold text-sm px-2 py-0.5 rounded-full">{p.discount}% OFF</span>
                )}
              </div>
              {p.mrp > p.price && (
                <p className="text-sm text-green-600 font-medium mb-4">You save ₹{p.mrp - p.price}!</p>
              )}

              {/* Suitable for */}
              {p.suitable_for && (
                <p className="text-sm text-gray-500 mb-4">
                  <span className="font-semibold text-gray-700">Suitable for: </span>{p.suitable_for}
                </p>
              )}

              {/* Stock */}
              <div className="flex items-center gap-2 mb-5">
                <span className={`text-sm font-semibold ${p.in_stock ? "text-green-600" : "text-red-500"}`}>
                  {p.in_stock ? "✓ In Stock" : "✗ Out of Stock"}
                </span>
              </div>

              {/* CTAs */}
              <div className="flex gap-3 mb-6">
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-colors">
                  <FaWhatsapp size={18} /> Order on WhatsApp
                </a>
                <a href="tel:+918291455297"
                  className="px-5 py-3.5 border-2 border-brand-primary text-brand-primary font-bold rounded-xl hover:bg-brand-light transition-colors text-sm">
                  Call Now
                </a>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <FiShield className="text-green-500" />, text: "100% Original" },
                  { icon: <FiTruck className="text-blue-500" />, text: "Pan India Delivery" },
                  { icon: <FiCheck className="text-brand-primary" />, text: "Best Price" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-1.5 bg-gray-50 rounded-xl p-2.5">
                    {b.icon}
                    <span className="text-xs font-semibold text-gray-600">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description + Benefits + How to Use */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 text-lg mb-3">About This Product</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>

              {p.key_benefits?.length > 0 && (
                <>
                  <h3 className="font-bold text-gray-700 mt-5 mb-3">Key Benefits</h3>
                  <ul className="space-y-2">
                    {p.key_benefits.map((b: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <FiCheck className="text-green-500 flex-shrink-0 mt-0.5" />
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
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{p.how_to_use}</p>
                </>
              )}
              {p.tags?.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-bold text-gray-700 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((tag: string) => (
                      <span key={tag} className="text-[11px] bg-brand-light text-brand-primary px-2.5 py-1 rounded-full font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FAQ */}
          {p.faq?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
              <h2 className="font-bold text-gray-800 text-xl mb-5">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {p.faq.map((f: { q: string; a: string }, i: number) => (
                  <div key={i} className="border-b border-gray-50 pb-4 last:border-0">
                    <p className="font-semibold text-brand-primary text-sm mb-1">Q: {f.q}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">A: {f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl p-6 text-center text-white">
            <h3 className="font-bold text-xl mb-2">Ready to Order?</h3>
            <p className="text-white/80 text-sm mb-4">WhatsApp Vinod directly — fast reply, genuine products guaranteed</p>
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-brand-primary font-bold px-8 py-3 rounded-full hover:bg-brand-light transition-colors">
              <FaWhatsapp size={20} className="text-green-500" />
              WhatsApp +918291455297
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
