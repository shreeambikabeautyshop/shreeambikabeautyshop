import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Beauty Tips & Guides | Shree Ambika Beauty Shop Mumbai",
  description:
    "Expert beauty tips, skincare routines, hair care guides, makeup tutorials, and buying guides from Shree Ambika Beauty Shop — Mumbai's most trusted beauty experts since 2001.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/beauty-tips" },
  openGraph: {
    title: "Beauty Tips & Guides | Shree Ambika Beauty Shop Mumbai",
    description:
      "Expert beauty advice from Mumbai's trusted beauty shop since 2001 — skin care, hair care, makeup guides, and product buying tips.",
    url: "https://www.shreeambikabeauty.com/beauty-tips",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  category: string;
  read_time_minutes: number;
  created_at: string;
};

async function getLatestBlogs(): Promise<BlogPost[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("blog_posts")
    .select("id,slug,title,excerpt,cover_image,category,read_time_minutes,created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6);
  return data || [];
}

const topicCards = [
  {
    slug: "skin-care",
    emoji: "✨",
    title: "Skin Care Tips",
    desc: "Routines, serums, sunscreens, and expert advice for healthy, glowing Indian skin.",
    color: "bg-pink-50 border-pink-200",
    badge: "bg-pink-500",
  },
  {
    slug: "hair-care",
    emoji: "💆",
    title: "Hair Care Tips",
    desc: "From oiling to anti-dandruff routines — practical hair care for all hair types.",
    color: "bg-purple-50 border-purple-200",
    badge: "bg-purple-500",
  },
  {
    slug: "makeup",
    emoji: "🎨",
    title: "Makeup Guides",
    desc: "Step-by-step makeup tutorials, product picks, and looks for every occasion.",
    color: "bg-red-50 border-red-200",
    badge: "bg-brand-primary",
  },
  {
    slug: "buying",
    emoji: "📖",
    title: "Buying Guides",
    desc: "How to choose the right products — what to look for, best brands, and smart picks.",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-500",
  },
];

const CAT_COLORS: Record<string, string> = {
  "Skin Care": "bg-pink-100 text-pink-700",
  "Hair Care": "bg-purple-100 text-purple-700",
  "Makeup": "bg-red-100 text-red-700",
  "Beauty Tips": "bg-brand-light text-brand-primary",
  "Buying Guide": "bg-blue-100 text-blue-700",
};

export default async function BeautyTipsPage() {
  const blogs = await getLatestBlogs();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-brand-primary text-white py-14 px-4">
          <div className="max-w-[1200px] mx-auto">
            <nav className="text-xs text-white/60 mb-4">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Beauty Tips</span>
            </nav>
            <p className="font-script text-brand-accent text-xl mb-2">From Mumbai&apos;s Beauty Experts</p>
            <h1 className="text-4xl md:text-5xl font-heading italic text-white mb-4">
              Beauty Tips & Guides
            </h1>
            <p className="text-white/80 text-base max-w-xl leading-relaxed">
              Practical, expert advice on skincare, hair care, makeup, and buying the right beauty products — backed by 24+ years of experience.
            </p>
          </div>
        </div>

        {/* Topic Cards */}
        <section className="max-w-[1200px] mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <p className="label-caps text-brand-primary mb-2">Explore by Topic</p>
            <h2 className="text-3xl font-serif font-bold text-gray-900">What Would You Like to Learn?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topicCards.map((card) => (
              <Link
                key={card.slug}
                href={`/beauty-tips/${card.slug}`}
                className={`group ${card.color} border-2 rounded-3xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl">{card.emoji}</span>
                  <span className={`${card.badge} text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0`}>
                    Guide
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-brand-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">{card.desc}</p>
                <div className="mt-4 text-sm font-bold text-brand-primary group-hover:translate-x-1 transition-transform">
                  Read Guide →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Blog Posts */}
        <section className="bg-white py-14 px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="label-caps text-brand-primary mb-1">Latest Articles</p>
                <h2 className="text-2xl font-serif font-bold text-gray-900">Beauty Blog</h2>
              </div>
              <Link
                href="/blog"
                className="text-sm font-bold text-brand-primary hover:text-brand-secondary transition-colors"
              >
                View All →
              </Link>
            </div>

            {blogs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-4">📝</p>
                <p className="font-semibold">Blog posts coming soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.slug}`}
                    className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-video bg-brand-light overflow-hidden">
                      {blog.cover_image ? (
                        <Image
                          src={blog.cover_image}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">💄</div>
                      )}
                      <span
                        className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          CAT_COLORS[blog.category] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {blog.category}
                      </span>
                    </div>
                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 flex-1 mb-4">{blog.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>
                          📅{" "}
                          {new Date(blog.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>⏱ {blog.read_time_minutes} min read</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-brand-primary py-14 px-4">
          <div className="max-w-[700px] mx-auto text-center text-white">
            <p className="text-3xl mb-3">💬</p>
            <h2 className="font-heading italic text-3xl mb-3">Need a Personal Recommendation?</h2>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
              WhatsApp Vinod and describe your skin type, hair concern, or beauty goal — he&apos;ll recommend the perfect products personally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/918291455297?text=Hi Vinod! I need beauty product recommendations."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-sm transition-all"
              >
                💬 WhatsApp for Advice
              </a>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-primary font-bold px-8 py-4 rounded-full text-sm hover:bg-brand-light transition-all"
              >
                🛍 Shop Products
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
