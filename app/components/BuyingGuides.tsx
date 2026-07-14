import Link from "next/link";

const guides = [
  {
    icon: "💄",
    title: "How to Choose the Right Lipstick",
    desc: "Find the perfect match for your skin tone & mood",
    href: "/beauty-tips/choose-lipstick",
  },
  {
    icon: "🖌️",
    title: "How to Select the Right Foundation",
    desc: "Tips for flawless, skin-matching base",
    href: "/beauty-tips/choose-foundation",
  },
  {
    icon: "🎨",
    title: "How to Choose Hair Colour",
    desc: "Pick the right shade for your skin tone",
    href: "/beauty-tips/hair-colour",
  },
  {
    icon: "🧴",
    title: "How to Buy Skincare Products",
    desc: "Know your skin type before buying",
    href: "/beauty-tips/buy-skincare",
  },
  {
    icon: "👜",
    title: "How to Build Your Beauty Kit",
    desc: "Must-have products for every occasion",
    href: "/beauty-tips/beauty-kit",
  },
];

export default function BuyingGuides() {
  return (
    <section className="py-12 bg-white" aria-labelledby="guides-heading">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between mb-7">
          <h2 id="guides-heading" className="text-2xl font-bold text-brand-primary font-serif">
            📖 HOW TO SELECT &amp; PURCHASE A GOOD PRODUCT
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {guides.map((guide, idx) => (
            <Link
              key={idx}
              href={guide.href}
              className="group bg-brand-light hover:bg-white rounded-2xl p-5 border border-pink-100 hover:border-brand-accent hover:shadow-md transition-all duration-300"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{guide.icon}</div>
              <h3 className="text-sm font-bold text-gray-800 mb-1 leading-tight">{guide.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{guide.desc}</p>
              <span className="text-xs font-semibold text-brand-primary group-hover:underline">
                Read Guide →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
