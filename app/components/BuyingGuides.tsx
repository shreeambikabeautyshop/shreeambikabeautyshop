"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Blog {
  id: string; slug: string; title: string; excerpt: string;
  cover_image: string; category: string; read_time_minutes: number;
}

// Fallback static guides shown before blogs load
const FALLBACK = [
  { icon: "💄", title: "How to Choose the Right Lipstick",    desc: "Find the perfect shade for your skin tone.", slug: "how-to-choose-lipstick" },
  { icon: "🖌️", title: "How to Select the Right Foundation",  desc: "Tips for flawless, skin-matching base.",     slug: "how-to-select-foundation" },
  { icon: "🎨", title: "How to Choose Hair Colour",           desc: "Pick the right shade for your skin tone.",   slug: "how-to-choose-hair-colour" },
  { icon: "🧴", title: "How to Buy Skincare Products",        desc: "Know your skin type & ingredients.",         slug: "how-to-buy-skincare-products" },
  { icon: "🛡️", title: "How to Spot Original Products",      desc: "Avoid fakes, choose 100% genuine.",          slug: "how-to-spot-original-products" },
  { icon: "👜", title: "How to Build Your Beauty Kit",        desc: "Must-have products for every woman.",        slug: "how-to-build-beauty-kit" },
];

export default function BuyingGuides() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/blog?limit=6")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data?.length > 0) setBlogs(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Use real blogs if available, else fallback
  const items = loaded && blogs.length > 0 ? blogs : null;

  return (
    <section className="py-12 bg-white" aria-labelledby="guides-heading">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-brand-primary/30" />
            <h2 id="guides-heading" className="text-xl font-bold tracking-[0.15em] uppercase text-brand-primary font-serif">
              📖 Beauty Blog & Buying Guides
            </h2>
            <div className="h-px w-8 bg-brand-primary/30" />
          </div>
          <Link href="/blog"
            className="text-sm font-semibold text-brand-primary border border-brand-primary/30 px-4 py-1.5 rounded-full hover:bg-brand-light transition-colors whitespace-nowrap">
            View All Blogs →
          </Link>
        </div>

        {/* Blog cards from Supabase */}
        {items ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {items.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`}
                className="group bg-brand-light hover:bg-white rounded-2xl overflow-hidden border border-pink-100 hover:border-brand-accent hover:shadow-md transition-all duration-300 flex flex-col">
                {/* Cover image */}
                <div className="relative aspect-video bg-brand-light overflow-hidden">
                  {blog.cover_image ? (
                    <Image src={blog.cover_image} alt={blog.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 200px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">💄</div>
                  )}
                </div>
                <div className="p-3.5 flex flex-col flex-1">
                  <span className="text-[9px] font-bold text-brand-primary bg-white px-1.5 py-0.5 rounded-full self-start mb-2">{blog.category}</span>
                  <h3 className="text-xs font-bold text-gray-800 mb-1 leading-snug line-clamp-2 flex-1">{blog.title}</h3>
                  <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{blog.excerpt}</p>
                  <span className="text-[10px] font-semibold text-brand-primary group-hover:underline">
                    Read Guide →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Fallback static guides */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FALLBACK.map((guide, idx) => (
              <Link key={idx} href={`/blog/${guide.slug}`}
                className="group bg-brand-light hover:bg-white rounded-2xl p-4 border border-pink-100 hover:border-brand-accent hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{guide.icon}</div>
                <h3 className="text-xs font-bold text-gray-800 mb-1 leading-tight flex-1">{guide.title}</h3>
                <p className="text-[10px] text-gray-500 mb-2">{guide.desc}</p>
                <span className="text-[10px] font-semibold text-brand-primary group-hover:underline">Read Guide →</span>
              </Link>
            ))}
          </div>
        )}

        {/* View All button — already in header, removed duplicate */}
      </div>
    </section>
  );
}
