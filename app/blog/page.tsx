import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";

export const dynamic = "force-dynamic";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Beauty Blog & Tips | Shree Ambika Beauty Shop Mumbai",
  description: "Expert beauty tips, skincare guides, makeup tutorials & buying guides from Shree Ambika Beauty Shop Mumbai. Learn from 25+ years of beauty expertise.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/blog" },
};

async function getBlogs() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("blog_posts")
    .select("id,slug,title,excerpt,cover_image,category,tags,read_time_minutes,created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  return data || [];
}

type Blog = {
  id: string; slug: string; title: string; excerpt: string;
  cover_image: string; category: string; tags: string[];
  read_time_minutes: number; created_at: string;
};

const CAT_COLORS: Record<string, string> = {
  "Skin Care":    "bg-pink-100 text-pink-700",
  "Hair Care":    "bg-purple-100 text-purple-700",
  "Makeup":       "bg-red-100 text-red-700",
  "Beauty Tips":  "bg-brand-light text-brand-primary",
  "Buying Guide": "bg-blue-100 text-blue-700",
};

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-brand-primary text-white py-12 px-4">
          <div className="max-w-[1200px] mx-auto">
            <nav className="text-xs text-white/60 mb-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Blog</span>
            </nav>
            <h1 className="text-3xl font-bold font-serif mb-2">Beauty Blog & Tips</h1>
            <p className="text-white/80 text-sm max-w-lg">
              Expert advice from Mumbai&apos;s trusted beauty shop since 2001 — skincare, makeup, hair care guides.
            </p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 py-10">
          {blogs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📝</p>
              <p className="font-semibold">Blogs coming soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog: Blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  {/* Cover Image */}
                  <div className="relative aspect-video bg-brand-light overflow-hidden">
                    {blog.cover_image ? (
                      <Image src={blog.cover_image} alt={blog.title} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">💄</div>
                    )}
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${CAT_COLORS[blog.category] || "bg-gray-100 text-gray-600"}`}>
                      {blog.category}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-3 flex-1 mb-4">{blog.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>📅 {new Date(blog.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>⏱ {blog.read_time_minutes} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
