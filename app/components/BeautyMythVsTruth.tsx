import Link from "next/link";
import Image from "next/image";
import { FiCheck, FiX } from "react-icons/fi";

const myths = [
  { myth: "Expensive products are always better.", truth: "Quality matters, not just price." },
  { myth: "Natural ingredients are 100% safe.", truth: "Natural can also cause allergies." },
  { myth: "More skincare means better results.", truth: "Right products in the right way works best." },
];

const whyChoose = [
  { icon: "🏠", title: "100% Original Products", desc: "Direct from Brands & Company" },
  { icon: "🛡️", title: "Safe & Secure Shopping", desc: "Genuine Products, Safe Delivery" },
  { icon: "💰", title: "Best Prices & Maximum Discount", desc: "Always As Possible" },
  { icon: "✨", title: "Expert Beauty Guidance", desc: "We Guide, You Glow" },
  { icon: "🛍️", title: "Wide Range for Every Need", desc: "From Daily Essentials to Professional" },
  { icon: "🚚", title: "Fast Delivery & Easy Order", desc: "WhatsApp, Website, Call – Your Choice" },
  { icon: "⭐", title: "Trusted Since 2001", desc: "25+ Years of Trust & Happiness" },
  { icon: "👩", title: "For Every Woman", desc: "Teen to 40+ – We Care for All" },
];

export default function BeautyMythVsTruth() {
  return (
    <section className="py-0 bg-white" aria-label="Beauty Myth vs Truth and Why Choose Us">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-2">

          {/* ── LEFT: Beauty Myth vs Truth ── */}
          <div
            className="relative flex gap-0 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #fff5f7 0%, #ffe8ef 100%)" }}
          >
            {/* Content */}
            <div className="flex-1 px-8 py-8 pr-4">
              {/* Header */}
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-lg font-black text-brand-primary tracking-wide">
                  BEAUTY MYTH VS TRUTH
                </h2>
                <span className="text-brand-gold text-base">⊕</span>
              </div>

              {/* Myth vs Truth rows */}
              <div className="space-y-4 mb-6">
                {myths.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-3">
                    {/* Myth */}
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                        <FiX size={10} className="text-white" strokeWidth={3} />
                      </span>
                      <div>
                        <span className="text-[10px] font-black text-white bg-brand-primary px-2 py-0.5 rounded-sm tracking-wider block mb-1 w-fit">
                          MYTH
                        </span>
                        <p className="text-xs text-gray-600 leading-relaxed">{item.myth}</p>
                      </div>
                    </div>
                    {/* Truth */}
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <FiCheck size={10} className="text-white" strokeWidth={3} />
                      </span>
                      <div>
                        <span className="text-[10px] font-black text-white bg-green-500 px-2 py-0.5 rounded-sm tracking-wider block mb-1 w-fit">
                          TRUTH
                        </span>
                        <p className="text-xs text-gray-600 leading-relaxed">{item.truth}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/beauty-tips"
                className="inline-flex items-center gap-1.5 border border-brand-primary text-brand-primary text-xs font-semibold px-5 py-2 rounded-full hover:bg-brand-primary hover:text-white transition-all"
              >
                Explore More Myths →
              </Link>
            </div>

            {/* Women image — right side of left panel */}
            <div className="relative w-52 flex-shrink-0 self-stretch hidden md:block">
              <Image
                src="https://res.cloudinary.com/zjlchjal/image/upload/v1784225462/beauty_myth_vs_truth_vrngh7.png"
                alt="Beauty Expert"
                fill
                className="object-contain object-bottom"
                sizes="208px"
              />
            </div>
          </div>

          {/* ── RIGHT: Why Every Woman Chooses ── */}
          <div
            className="relative flex gap-0 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #fff5f7 0%, #ffe0e8 100%)" }}
          >
            {/* Content */}
            <div className="flex-1 px-8 py-8 pl-6">
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-brand-gold text-base">⊕</span>
                <h2 className="text-sm font-bold text-brand-primary tracking-wide uppercase">
                  WHY EVERY WOMAN CHOOSES
                </h2>
                <span className="text-brand-gold text-base">⊕</span>
              </div>
              <h3 className="text-base font-black text-brand-primary mb-5 tracking-wide">
                SHREE AMBIKA BEAUTY STORE
              </h3>

              {/* 2 col grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                {whyChoose.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-brand-primary text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800 leading-tight">{item.title}</p>
                      <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Women image — right side of right panel */}
            <div className="relative w-52 flex-shrink-0 self-stretch hidden md:block">
              <Image
                src="https://res.cloudinary.com/zjlchjal/image/upload/v1784225477/why-every-women-choose_vht46h.png"
                alt="Why Choose Shree Ambika"
                fill
                className="object-contain object-bottom"
                sizes="208px"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
