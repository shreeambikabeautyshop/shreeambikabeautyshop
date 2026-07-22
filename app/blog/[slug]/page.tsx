import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { FaWhatsapp } from "react-icons/fa";
import { FiChevronRight, FiClock, FiCalendar } from "react-icons/fi";

async function getBlog(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return data;
}

async function getRelatedBlogs(category: string, excludeSlug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("blog_posts")
    .select("id,slug,title,cover_image,category,read_time_minutes")
    .eq("is_published", true)
    .eq("category", category)
    .neq("slug", excludeSlug)
    .limit(3);
  return data || [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlog(params.slug);
  if (!blog) return { title: "Blog Not Found" };
  return {
    title: blog.seo_title || `${blog.title} | Shree Ambika Beauty Shop`,
    description: blog.seo_description || blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: blog.cover_image ? [{ url: blog.cover_image }] : [],
    },
    alternates: { canonical: `https://www.shreeambikabeauty.com/blog/${blog.slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const blog = await getBlog(params.slug);
  if (!blog) notFound();

  const related = await getRelatedBlogs(blog.category, blog.slug);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.excerpt,
    image: blog.cover_image || "",
    author: { "@type": "Organization", name: "Shree Ambika Beauty Shop" },
    publisher: {
      "@type": "Organization",
      name: "Shree Ambika Beauty Shop",
      logo: { "@type": "ImageObject", url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784563982/shree-ambika-beauty-shop-logo_wdds5i.png" }
    },
    datePublished: blog.created_at,
    dateModified: blog.updated_at || blog.created_at,
    mainEntityOfPage: `https://www.shreeambikabeauty.com/blog/${blog.slug}`,
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-[900px] mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 flex-wrap">
            <Link href="/" className="hover:text-brand-primary">Home</Link>
            <FiChevronRight size={10} />
            <Link href="/blog" className="hover:text-brand-primary">Blog</Link>
            <FiChevronRight size={10} />
            <span className="text-gray-600 line-clamp-1 max-w-xs">{blog.title}</span>
          </nav>

          {/* Article */}
          <article className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            {/* Cover */}
            {blog.cover_image && (
              <div className="relative aspect-video w-full">
                <Image src={blog.cover_image} alt={blog.title} fill
                  className="object-cover" priority sizes="(max-width: 900px) 100vw, 900px" />
              </div>
            )}

            <div className="p-6 md:p-10">
              {/* Category + meta */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs font-bold bg-brand-light text-brand-primary px-3 py-1 rounded-full">
                  {blog.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <FiCalendar size={11} />
                  {new Date(blog.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <FiClock size={11} /> {blog.read_time_minutes} min read
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">{blog.title}</h1>
              <p className="text-gray-500 text-base leading-relaxed mb-6 border-l-4 border-brand-primary pl-4 italic">{blog.excerpt}</p>

              {/* Blog content */}
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                style={{ lineHeight: "1.8" }}
                dangerouslySetInnerHTML={{ __html: blog.content || "" }} />

              {/* Tags */}
              {blog.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                  {blog.tags.map((tag: string) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="mt-8 p-5 bg-brand-light rounded-2xl border border-pink-100">
                <p className="font-bold text-gray-800 mb-1">Shop Beauty Products — Mumbai&apos;s Most Trusted Store</p>
                <p className="text-sm text-gray-500 mb-4">100% original products. Same day delivery in Mumbai. Pan India 4–7 days.</p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://wa.me/918291455297?text=Hi Vinod! I read your blog and want to shop beauty products."
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                    <FaWhatsapp size={16} /> Order on WhatsApp
                  </a>
                  <Link href="/products"
                    className="flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                    Browse Products
                  </Link>
                </div>
              </div>
            </div>
          </article>

          {/* Related Blogs */}
          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="font-bold text-gray-800 text-lg mb-5">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((r: { id: string; slug: string; title: string; cover_image: string; category: string; read_time_minutes: number }) => (
                  <Link key={r.id} href={`/blog/${r.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                    <div className="relative aspect-video bg-brand-light">
                      {r.cover_image ? (
                        <Image src={r.cover_image} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">💄</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-brand-primary transition-colors">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-1">⏱ {r.read_time_minutes} min read</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
