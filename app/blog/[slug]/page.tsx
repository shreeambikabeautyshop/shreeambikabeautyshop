import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { FaWhatsapp } from "react-icons/fa";
import { FiChevronRight, FiClock, FiCalendar, FiTag, FiEye } from "react-icons/fi";

async function getBlog(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("blog_posts").select("*")
    .eq("slug", slug).eq("is_published", true).maybeSingle();
  return data;
}

async function getSidebarData(category: string, excludeSlug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  // Same category blogs
  const { data: sameCat } = await supabase
    .from("blog_posts")
    .select("id,slug,title,cover_image,category,read_time_minutes,created_at")
    .eq("is_published", true).eq("category", category)
    .neq("slug", excludeSlug).limit(4);

  // All categories with count
  const { data: allBlogs } = await supabase
    .from("blog_posts")
    .select("category").eq("is_published", true);

  // Recent blogs
  const { data: recent } = await supabase
    .from("blog_posts")
    .select("id,slug,title,cover_image,read_time_minutes,created_at")
    .eq("is_published", true).neq("slug", excludeSlug)
    .order("created_at", { ascending: false }).limit(5);

  const catCount: Record<string, number> = {};
  (allBlogs || []).forEach((b) => {
    catCount[b.category] = (catCount[b.category] || 0) + 1;
  });
  const categories = Object.entries(catCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return { sameCat: sameCat || [], categories, recent: recent || [] };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlog(params.slug);
  if (!blog) return { title: "Blog Not Found" };
  return {
    title: blog.seo_title || `${blog.title} | Shree Ambika Beauty Shop`,
    description: blog.seo_description || blog.excerpt,
    openGraph: {
      title: blog.title, description: blog.excerpt,
      images: blog.cover_image ? [{ url: blog.cover_image }] : [],
    },
    alternates: { canonical: `https://www.shreeambikabeauty.com/blog/${blog.slug}` },
  };
}

const CAT_ICONS: Record<string, string> = {
  "Makeup": "🎨", "Skin Care": "✨", "Hair Care": "💆",
  "Beauty Tips": "💡", "Perfumes": "🌸", "Buying Guide": "📖",
};

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const blog = await getBlog(params.slug);
  if (!blog) notFound();

  const { sameCat, categories, recent } = await getSidebarData(blog.category, blog.slug);

  const articleSchema = {
    "@context": "https://schema.org", "@type": "Article",
    headline: blog.title, description: blog.excerpt,
    image: blog.cover_image || "",
    author: { "@type": "Organization", name: "Shree Ambika Beauty Shop" },
    publisher: {
      "@type": "Organization", name: "Shree Ambika Beauty Shop",
      logo: { "@type": "ImageObject", url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784563982/shree-ambika-beauty-shop-logo_wdds5i.png" }
    },
    datePublished: blog.created_at,
    mainEntityOfPage: `https://www.shreeambikabeauty.com/blog/${blog.slug}`,
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <main className="min-h-screen bg-gray-50">

        {/* ── Hero Cover ── */}
        {blog.cover_image && (
          <div className="relative w-full bg-gray-900" style={{ height: "380px" }}>
            <Image src={blog.cover_image} alt={blog.title} fill
              className="object-cover opacity-80" priority sizes="100vw" />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
            {/* Breadcrumb on hero */}
            <div className="absolute top-5 left-0 right-0 max-w-[1200px] mx-auto px-4">
              <nav className="flex items-center gap-1.5 text-xs text-white/70 flex-wrap">
                <Link href="/" className="hover:text-white">Home</Link>
                <FiChevronRight size={10} />
                <Link href="/blog" className="hover:text-white">Blog</Link>
                <FiChevronRight size={10} />
                <span className="text-white/90 line-clamp-1 max-w-xs">{blog.title}</span>
              </nav>
            </div>
            {/* Title overlay on hero */}
            <div className="absolute bottom-0 left-0 right-0 max-w-[1200px] mx-auto px-4 pb-8">
              <span className="inline-block text-xs font-bold bg-brand-primary text-white px-3 py-1 rounded-full mb-3">
                {CAT_ICONS[blog.category] || "📝"} {blog.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight max-w-2xl">
                {blog.title}
              </h1>
              <div className="flex items-center gap-4 mt-3 text-white/70 text-xs">
                <span className="flex items-center gap-1">
                  <FiCalendar size={11} />
                  {new Date(blog.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1"><FiClock size={11} /> {blog.read_time_minutes} min read</span>
                <span className="flex items-center gap-1"><FiEye size={11} /> {(blog.views || 0) + 1} views</span>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── MAIN CONTENT ── */}
            <article className="flex-1 min-w-0">

              {/* No cover — show breadcrumb + title here */}
              {!blog.cover_image && (
                <div className="mb-6">
                  <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 flex-wrap">
                    <Link href="/" className="hover:text-brand-primary">Home</Link>
                    <FiChevronRight size={10} />
                    <Link href="/blog" className="hover:text-brand-primary">Blog</Link>
                    <FiChevronRight size={10} />
                    <span className="text-gray-600">{blog.title}</span>
                  </nav>
                  <span className="inline-block text-xs font-bold bg-brand-light text-brand-primary px-3 py-1 rounded-full mb-3">
                    {CAT_ICONS[blog.category] || "📝"} {blog.category}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">{blog.title}</h1>
                  <div className="flex items-center gap-4 mt-3 text-gray-400 text-xs">
                    <span className="flex items-center gap-1"><FiCalendar size={11} />
                      {new Date(blog.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1"><FiClock size={11} /> {blog.read_time_minutes} min read</span>
                  </div>
                </div>
              )}

              {/* Article card */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Decorative top border */}
                <div className="h-1 bg-gradient-to-r from-brand-primary via-pink-400 to-brand-primary" />

                <div className="p-6 md:p-8">
                  {/* Excerpt — styled quote */}
                  <blockquote className="border-l-4 border-brand-primary bg-brand-light rounded-r-2xl px-5 py-4 mb-8 italic text-gray-700 text-base leading-relaxed">
                    {blog.excerpt}
                  </blockquote>

                  {/* Main content */}
                  <div className="prose prose-base max-w-none
                    prose-headings:font-black prose-headings:text-gray-900
                    prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
                    prose-h3:text-base prose-h3:text-brand-primary prose-h3:mt-6 prose-h3:mb-2
                    prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4
                    prose-li:text-gray-600 prose-li:leading-relaxed
                    prose-strong:text-gray-800 prose-strong:font-bold
                    prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: blog.content || "" }} />

                  {/* Tags */}
                  {blog.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                      <span className="flex items-center gap-1 text-xs text-gray-400"><FiTag size={11} /> Tags:</span>
                      {blog.tags.map((tag: string) => (
                        <span key={tag} className="text-xs bg-gray-100 hover:bg-brand-light hover:text-brand-primary text-gray-600 px-3 py-1 rounded-full cursor-pointer transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Shop CTA Banner ── */}
              <div className="mt-6 rounded-3xl overflow-hidden relative"
                style={{ background: "linear-gradient(135deg, #8B0000 0%, #C41E3A 50%, #8B0000 100%)" }}>
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">🛍 Shop at Shree Ambika Beauty Shop</p>
                    <h3 className="text-xl font-black text-white mb-1">Mumbai&apos;s Most Trusted Beauty Store</h3>
                    <p className="text-white/80 text-sm">100% original products • Est. 2001 • Same day delivery in Mumbai • Pan India 4–7 days</p>
                    <p className="text-white/60 text-xs mt-1">📍 Anand Nagar Metro, Dahisar East, Mumbai 400068</p>
                  </div>
                  <div className="flex flex-col gap-2.5 flex-shrink-0">
                    <a href="https://wa.me/918291455297?text=Hi Vinod! I read your beauty blog and want to order products."
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all shadow-lg whitespace-nowrap">
                      <FaWhatsapp size={18} /> Order on WhatsApp
                    </a>
                    <Link href="/products"
                      className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all border border-white/30 whitespace-nowrap">
                      🛒 Browse All Products
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── Related Articles (same category) ── */}
              {sameCat.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-px flex-1 bg-gray-200" />
                    <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">
                      More in {blog.category}
                    </h2>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sameCat.map((r: { id: string; slug: string; title: string; cover_image: string; category: string; read_time_minutes: number }) => (
                      <Link key={r.id} href={`/blog/${r.slug}`}
                        className="group flex gap-4 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md hover:border-brand-accent transition-all">
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-brand-light">
                          {r.cover_image ? (
                            <Image src={r.cover_image} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">💄</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-brand-primary transition-colors leading-snug">{r.title}</p>
                          <p className="text-[10px] text-gray-400 mt-1">⏱ {r.read_time_minutes} min read</p>
                          <span className="text-[10px] font-semibold text-brand-primary mt-1 inline-block">Read →</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* ── SIDEBAR ── */}
            <aside className="w-full lg:w-[300px] flex-shrink-0 space-y-5">

              {/* Shop Now Card */}
              <div className="bg-brand-primary rounded-2xl p-5 text-white">
                <p className="font-black text-base mb-1">💄 Shop Now</p>
                <p className="text-white/80 text-xs mb-4">Original beauty products, same day delivery in Mumbai.</p>
                <a href="https://wa.me/918291455297"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                  <FaWhatsapp size={16} /> WhatsApp Order
                </a>
                <Link href="/products"
                  className="flex items-center justify-center mt-2 py-2.5 rounded-xl text-sm font-bold bg-white/15 hover:bg-white/25 transition-all border border-white/20">
                  Browse Products →
                </Link>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-50">
                  <h3 className="font-black text-gray-800 text-sm">📂 Categories</h3>
                </div>
                <div className="p-3 space-y-0.5">
                  {categories.map((cat) => (
                    <Link key={cat.name} href={`/blog?category=${encodeURIComponent(cat.name)}`}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors group ${
                        cat.name === blog.category
                          ? "bg-brand-light text-brand-primary"
                          : "text-gray-600 hover:bg-gray-50 hover:text-brand-primary"
                      }`}>
                      <span>{CAT_ICONS[cat.name] || "📝"} {cat.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        cat.name === blog.category ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-500 group-hover:bg-brand-light"
                      }`}>{cat.count}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Posts */}
              {recent.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-50">
                    <h3 className="font-black text-gray-800 text-sm">🕐 Recent Articles</h3>
                  </div>
                  <div className="p-3 space-y-2">
                    {recent.map((r: { id: string; slug: string; title: string; cover_image: string; read_time_minutes: number; created_at: string }) => (
                      <Link key={r.id} href={`/blog/${r.slug}`}
                        className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 group transition-colors">
                        <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-brand-light">
                          {r.cover_image ? (
                            <Image src={r.cover_image} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">💄</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-gray-800 line-clamp-2 group-hover:text-brand-primary transition-colors leading-snug">{r.title}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">⏱ {r.read_time_minutes} min</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Box */}
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                <p className="font-black text-gray-800 text-sm mb-3">📞 Contact Us</p>
                <div className="space-y-2 text-xs text-gray-600">
                  <p>📱 <a href="tel:+918291455297" className="hover:text-brand-primary font-semibold">+91 82914 55297</a></p>
                  <p>💬 <a href="https://wa.me/918291455297" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 font-semibold">WhatsApp Vinod</a></p>
                  <p>📍 Anand Nagar Metro, Dahisar East, Mumbai 400068</p>
                  <p>🕐 Open 9am – 9pm, All days</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
