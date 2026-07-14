import Link from "next/link";

const myths = [
  { myth: "Expensive products are always better", truth: "Quality matters, not just price." },
  { myth: "More makeup = more beautiful", truth: "Right products, right skin tone always enhances." },
  { myth: "More skincare is always better", truth: "Right products in right quantity is the key." },
];

const whyChoose = [
  { icon: "✅", text: "100% Original Products — Direct from Brand & Company" },
  { icon: "✅", text: "Safe & Secure Shopping — Genuine Products, Zero Refilling" },
  { icon: "✅", text: "Best Price & Maximum Discount — Always" },
  { icon: "✅", text: "Expert Beauty Guidance — For You, Only You" },
  { icon: "✅", text: "Wide Range for Every Need — From Daily Essentials to Professional" },
  { icon: "✅", text: "Fast Delivery & Easy Order — WhatsApp, Website, Call — Your Choice" },
  { icon: "✅", text: "Trusted Since 2001 — 20+ Years of Pride & Happiness" },
  { icon: "✅", text: "We Care for All — Not just skin — We Care for All" },
];

export default function BeautyMythVsTruth() {
  return (
    <section className="py-12 bg-white" aria-labelledby="myth-heading">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">

          {/* Beauty Myth vs Truth */}
          <div className="bg-brand-light rounded-3xl p-7">
            <h2 id="myth-heading" className="text-xl font-bold text-brand-primary font-serif mb-5 text-center">
              🌸 BEAUTY MYTH VS TRUTH
            </h2>
            <div className="space-y-4">
              {myths.map((item, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-3">
                  <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                    <p className="text-xs font-bold text-red-500 mb-1 uppercase tracking-wide">MYTH ✗</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.myth}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                    <p className="text-xs font-bold text-green-600 mb-1 uppercase tracking-wide">TRUTH ✓</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.truth}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-5">
              <Link href="/beauty-tips" className="text-sm font-semibold text-brand-primary hover:underline">
                Explore More Myths →
              </Link>
            </div>
          </div>

          {/* Why Every Woman Chooses */}
          <div className="bg-rose-50 rounded-3xl p-7">
            <h2 className="text-xl font-bold text-brand-primary font-serif mb-2 text-center">
              WHY EVERY WOMAN CHOOSES
            </h2>
            <h3 className="text-lg font-bold text-brand-secondary text-center mb-5">
              SHREE AMBIKA BEAUTY STORE
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {whyChoose.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 flex-shrink-0 mt-0.5">{item.icon}</span>
                  <span className="text-xs leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
