import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

type TopicMeta = {
  title: string;
  desc: string;
  emoji: string;
  heroText: string;
  heroSub: string;
  dbCategory: string;
  tips: { heading: string; body: string }[];
};

const TOPICS: Record<string, TopicMeta> = {
  "skin-care": {
    title: "Skin Care Tips for Indian Skin | Shree Ambika Beauty Shop",
    desc: "Expert skin care tips for Indian skin — daily routine, sunscreen, moisturizer, serums, and more. From Mumbai's trusted beauty experts since 2001.",
    emoji: "✨",
    heroText: "Skin Care Tips",
    heroSub: "Simple, effective routines for healthy, glowing Indian skin — trusted advice from 24 years of beauty expertise.",
    dbCategory: "Skin Care",
    tips: [
      {
        heading: "Never Skip Sunscreen",
        body: "Indian skin is prone to hyperpigmentation and tanning. Apply SPF 30+ sunscreen every morning — even on cloudy days and indoors near windows. Reapply every 2–3 hours if outdoors. Look for lightweight formulas from Lakme, Neutrogena, or Minimalist.",
      },
      {
        heading: "Cleanse Twice a Day",
        body: "Use a gentle face wash suited to your skin type — foaming for oily skin, cream-based for dry skin. Cleansing removes pollution, makeup, and sebum. Avoid harsh soaps that strip natural oils. Himalaya, Biotique, and Plum have excellent options for Indian skin.",
      },
      {
        heading: "Moisturise Even if You Have Oily Skin",
        body: "Skipping moisturiser makes oily skin produce even more sebum. Choose an oil-free, non-comedogenic moisturiser. Gel-based formulas from Neutrogena or Dot & Key work well for the Mumbai humidity.",
      },
      {
        heading: "Use a Vitamin C Serum in the Morning",
        body: "Vitamin C brightens skin, fades pigmentation, and protects against free radicals. Apply 2–3 drops under your sunscreen in the morning. Minimalist, Dermafique, and Pilgrim have highly rated serums available at our store.",
      },
      {
        heading: "Exfoliate Gently, Just Once or Twice a Week",
        body: "Over-exfoliation damages the skin barrier. Use a mild chemical exfoliant (AHA/BHA) or a gentle scrub once or twice a week. This helps with tan removal and keeping skin smooth. Avoid harsh walnut scrubs that can cause micro-tears.",
      },
      {
        heading: "Hydrate from Within",
        body: "Drink at least 8 glasses of water daily. Add hydrating foods like watermelon, cucumber, and coconut water. Internal hydration shows on your skin — no serum can fully replace proper hydration.",
      },
    ],
  },
  "hair-care": {
    title: "Hair Care Tips & Routine | Shree Ambika Beauty Shop",
    desc: "Practical hair care tips for Indian hair — oiling, shampooing, conditioning, anti-dandruff, and heat protection routines. Expert advice from Shree Ambika Beauty Shop.",
    emoji: "💆",
    heroText: "Hair Care Tips",
    heroSub: "Stronger, shinier, healthier hair — practical routines and expert tips for all hair types.",
    dbCategory: "Hair Care",
    tips: [
      {
        heading: "Oil Your Hair Before Every Wash",
        body: "Pre-wash oiling is a traditional Indian practice that actually works. Apply warm coconut oil, almond oil, or Indulekha Bringha oil 1–2 hours before washing. This reduces protein loss during shampooing and keeps hair moisturised.",
      },
      {
        heading: "Don't Over-Wash",
        body: "Washing hair every day strips natural oils and weakens hair. For most hair types, washing 2–3 times a week is ideal. Use a sulphate-free shampoo for dry or chemically treated hair. L'Oreal, Dove, and Tresemme have great options.",
      },
      {
        heading: "Always Use a Conditioner",
        body: "Conditioner is non-negotiable. It smooths the hair cuticle, reduces frizz, and adds shine. Apply from mid-lengths to ends — never on the roots. Leave on for 2–3 minutes before rinsing. Pair with your shampoo for best results.",
      },
      {
        heading: "Use Heat Protectant Before Styling",
        body: "If you use a hair dryer, curler, or straightener, always apply a heat protectant spray first. Heat damage is cumulative and irreversible. Brands like TRESemmé, Schwarzkopf, and Wella have good heat protection sprays.",
      },
      {
        heading: "Treat Dandruff with the Right Shampoo",
        body: "Dandruff in Mumbai's humid weather is very common. Use an anti-dandruff shampoo with zinc pyrithione or ketoconazole (like Selsun, Ketomac, or Head & Shoulders) 2–3 times a week until dandruff clears. Then switch to maintenance with occasional use.",
      },
      {
        heading: "Trim Regularly to Avoid Split Ends",
        body: "Hair doesn't grow faster with trimming, but regular trims (every 6–8 weeks) prevent split ends from travelling up the shaft and causing breakage. This keeps hair looking healthy and growing longer in the long run.",
      },
    ],
  },
  makeup: {
    title: "Makeup Guides & Tutorials | Shree Ambika Beauty Shop",
    desc: "Easy makeup guides and tutorials for beginners and pros — foundation, kajal, lipstick tips, contouring, and occasion-based looks from Shree Ambika Beauty Shop Mumbai.",
    emoji: "🎨",
    heroText: "Makeup Guides",
    heroSub: "From everyday naturals to bold party looks — step-by-step makeup guidance for every occasion and skin tone.",
    dbCategory: "Makeup",
    tips: [
      {
        heading: "Always Start with Skincare",
        body: "Makeup sits better and lasts longer on prepped skin. Cleanse, moisturise, and apply sunscreen before any makeup. A good primer helps foundation stay fresh for hours — especially important in Mumbai's humidity.",
      },
      {
        heading: "Match Your Foundation to Your Jawline",
        body: "Test foundation on your jawline (not your hand) in natural light. The right shade should disappear into your skin. For Indian skin tones, look for warm or neutral undertones. Brands like Lakme, SUGAR, and Maybelline have great shades for desi complexions.",
      },
      {
        heading: "Kajal is Your Best Friend",
        body: "A well-applied kajal instantly makes eyes look defined and beautiful. Use a waterproof formula in Mumbai's humidity. Maybelline Colossal Kajal, Lakme Eyeconic, and SUGAR's kajals are best-sellers at our store.",
      },
      {
        heading: "Set Your Makeup with a Setting Spray",
        body: "Loose powder mattifies but can look cakey. A setting spray locks makeup in place, gives a natural finish, and extends wear time — especially important if you're outdoors or in humid weather. L'Oreal and NYX make great options.",
      },
      {
        heading: "Less is More for Daily Makeup",
        body: "For everyday looks, keep it simple — tinted moisturiser or BB cream, kajal, a tinted lip balm, and a touch of blush. You'll look fresh and put-together without heavy coverage. Save the full face for events.",
      },
      {
        heading: "Remove Makeup Before Sleeping — Always",
        body: "Sleeping in makeup clogs pores and causes breakouts, dullness, and premature ageing. Use micellar water or a cleansing oil to remove everything, including waterproof products, before your skincare routine.",
      },
    ],
  },
  buying: {
    title: "Beauty Product Buying Guide | Shree Ambika Beauty Shop",
    desc: "Smart beauty product buying guide — how to choose the right products, check authenticity, compare brands, and get the best value. Expert advice from Shree Ambika Mumbai.",
    emoji: "📖",
    heroText: "Buying Guides",
    heroSub: "Shop smarter, not harder — know what to look for, which brands to trust, and how to spot genuine products.",
    dbCategory: "Buying Guide",
    tips: [
      {
        heading: "Always Buy from Authorised Stores",
        body: "The #1 rule in beauty: only buy from authorised stockists. Counterfeit products are rampant online and can contain harmful chemicals. At Shree Ambika Beauty Shop, every product is sourced from brand-authorised distributors — guaranteed original since 2001.",
      },
      {
        heading: "Check Expiry Dates Before Buying",
        body: "Beauty products have expiry dates — usually printed on the bottom or side of the packaging. Using expired skincare or makeup can cause irritation, breakouts, or worse. Also check the Period After Opening (PAO) symbol — a small jar icon showing how many months after opening the product remains usable.",
      },
      {
        heading: "Patch Test New Products First",
        body: "Before applying a new product all over your face, test it on a small patch of skin (inner wrist or behind the ear) for 24 hours. This helps identify allergic reactions before they spread. This is especially important for chemical peels, exfoliants, and fragranced products.",
      },
      {
        heading: "Read Ingredient Lists for Your Skin Concerns",
        body: "Look for specific ingredients for your concern: Niacinamide and Vitamin C for brightening, Hyaluronic Acid for hydration, Salicylic Acid for acne, Retinol for anti-ageing, Ceramides for barrier repair. WhatsApp Vinod if you need help understanding what your skin needs.",
      },
      {
        heading: "Don't Fall for Marketing Gimmicks",
        body: "Words like 'natural', 'organic', or 'herbal' are not regulated — they don't guarantee safety or efficacy. Focus on the actual ingredients list rather than front-of-pack claims. Expensive doesn't always mean better — some of the most effective products are mid-range.",
      },
      {
        heading: "Buy Travel-Size First",
        body: "Before committing to a full-size, expensive product, buy a travel or mini size to test it first. Many brands offer starter kits at our store. This saves money and prevents regret if the product doesn't suit your skin type.",
      },
    ],
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

async function getTopicBlogs(category: string): Promise<BlogPost[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("blog_posts")
    .select("id,slug,title,excerpt,cover_image,category,read_time_minutes,created_at")
    .eq("is_published", true)
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(6);
  return data || [];
}

const CAT_COLORS: Record<string, string> = {
  "Skin Care": "bg-pink-100 text-pink-700",
  "Hair Care": "bg-purple-100 text-purple-700",
  "Makeup": "bg-red-100 text-red-700",
  "Beauty Tips": "bg-brand-light text-brand-primary",
  "Buying Guide": "bg-blue-100 text-blue-700",
};

export async function generateStaticParams() {
  return Object.keys(TOPICS).map((topic) => ({ topic }));
}

export async function generateMetadata({
  params,
}: {
  params: { topic: string };
}): Promise<Metadata> {
  const meta = TOPICS[params.topic];
  if (!meta) return { title: "Topic Not Found" };
  return {
    title: meta.title,
    description: meta.desc,
    alternates: {
      canonical: `https://www.shreeambikabeauty.com/beauty-tips/${params.topic}`,
    },
    openGraph: {
      title: meta.title,
      description: meta.desc,
      url: `https://www.shreeambikabeauty.com/beauty-tips/${params.topic}`,
      siteName: "Shree Ambika Beauty Shop",
      locale: "en_IN",
      type: "website",
    },
  };
}

export default async function BeautyTipTopicPage({
  params,
}: {
  params: { topic: string };
}) {
  const meta = TOPICS[params.topic];
  if (!meta) notFound();

  const blogs = await getTopicBlogs(meta.dbCategory);

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
              <Link href="/beauty-tips" className="hover:text-white">Beauty Tips</Link>
              <span className="mx-2">›</span>
              <span className="capitalize">{params.topic.replace(/-/g, " ")}</span>
            </nav>
            <div className="flex items-start gap-5">
              <span className="text-6xl flex-shrink-0" aria-hidden="true">{meta.emoji}</span>
              <div>
                <p className="font-script text-brand-accent text-lg mb-1">Expert Beauty Advice</p>
                <h1 className="text-4xl font-heading italic text-white mb-3">{meta.heroText}</h1>
                <p className="text-white/80 text-base max-w-xl leading-relaxed">{meta.heroSub}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-4 py-14">

          {/* Expert Tips Section */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gray-200" />
              <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">
                {meta.emoji} Expert Tips
              </h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {meta.tips.map((tip, i) => (
                <div key={tip.heading} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-brand-primary text-white text-sm font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base mb-2">{tip.heading}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{tip.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Blog Posts */}
          {blogs.length > 0 && (
            <div className="mb-14">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900">
                  {meta.dbCategory} Articles
                </h2>
                <Link
                  href="/blog"
                  className="text-sm font-bold text-brand-primary hover:text-brand-secondary"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >
                    <div className="relative aspect-video bg-brand-light overflow-hidden">
                      {blog.cover_image ? (
                        <Image
                          src={blog.cover_image}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          {meta.emoji}
                        </div>
                      )}
                      <span
                        className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          CAT_COLORS[blog.category] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {blog.category}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-3">{blog.excerpt}</p>
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
            </div>
          )}

          {/* Other Topics */}
          <div className="mb-14">
            <h3 className="font-bold text-gray-900 text-lg mb-5">Explore Other Topics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(TOPICS)
                .filter(([slug]) => slug !== params.topic)
                .map(([slug, t]) => (
                  <Link
                    key={slug}
                    href={`/beauty-tips/${slug}`}
                    className="flex flex-col items-center gap-2 bg-white border border-gray-200 hover:border-brand-primary rounded-2xl p-4 text-center text-sm font-semibold text-gray-600 hover:text-brand-primary transition-all hover:shadow-sm"
                  >
                    <span className="text-3xl">{t.emoji}</span>
                    <span>{t.heroText}</span>
                  </Link>
                ))}
            </div>
          </div>

          {/* Shop CTA */}
          <div className="bg-brand-primary rounded-3xl p-8 text-center text-white">
            <p className="text-3xl mb-3">🛍</p>
            <h2 className="font-bold text-2xl mb-2">Shop the Products You Need</h2>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
              WhatsApp Vinod for personalised product recommendations based on your skin type and concerns, or browse our full collection online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/918291455297?text=Hi Vinod! I read your beauty tips and need product recommendations."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-all"
              >
                💬 WhatsApp for Advice
              </a>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-primary font-bold px-8 py-3.5 rounded-full text-sm hover:bg-brand-light transition-all"
              >
                🛍 Browse Products
              </Link>
            </div>
          </div>
        </div>

      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
