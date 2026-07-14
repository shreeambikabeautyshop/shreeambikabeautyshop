import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";

// Placeholder Instagram post colors/emojis
const posts = [
  { emoji: "💄", bg: "from-pink-200 to-rose-100", label: "New Lipstick Arrivals" },
  { emoji: "✨", bg: "from-yellow-100 to-amber-100", label: "Skincare Routine" },
  { emoji: "🎨", bg: "from-purple-100 to-pink-100", label: "Makeup Tutorial" },
  { emoji: "🧴", bg: "from-green-100 to-emerald-100", label: "Serum Collection" },
  { emoji: "💅", bg: "from-rose-100 to-pink-100", label: "Nail Art Ideas" },
  { emoji: "🌸", bg: "from-pink-100 to-fuchsia-100", label: "Perfume Collection" },
];

export default function InstagramFeed() {
  return (
    <section className="py-12 bg-white" aria-labelledby="instagram-heading">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaInstagram size={24} className="text-pink-500" />
            <h2 id="instagram-heading" className="text-2xl font-bold text-brand-primary font-serif">
              FOLLOW US ON INSTAGRAM
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            @shreeambikabeautystore — Stay updated with latest beauty trends & offers
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          {posts.map((post, idx) => (
            <a
              key={idx}
              href="https://instagram.com/shreeambikabeautystore"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={post.label}
              className={`group aspect-square rounded-2xl bg-gradient-to-br ${post.bg} flex items-center justify-center text-4xl hover:scale-105 transition-transform duration-300 shadow-sm hover:shadow-md relative overflow-hidden`}
            >
              <span className="group-hover:scale-110 transition-transform duration-300">{post.emoji}</span>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/20 flex items-end justify-center pb-2 transition-all">
                <span className="text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-brand-primary/80 px-2 py-0.5 rounded-full">
                  {post.label}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://instagram.com/shreeambikabeautystore"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-md"
          >
            <FaInstagram size={18} />
            Follow Us on Instagram
          </a>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-full transition-colors shadow-md"
          >
            <FaWhatsapp size={18} />
            SHOP ON WHATSAPP
          </a>
        </div>
      </div>
    </section>
  );
}
