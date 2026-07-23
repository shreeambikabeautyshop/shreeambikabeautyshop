"use client";
import { useEffect, useState } from "react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FiHeart, FiMessageCircle, FiExternalLink } from "react-icons/fi";

// Instagram post IDs + thumbnail images (use Cloudinary thumbnails or product images)
const POSTS = [
  {
    id: "DavkfX_n7k8",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png",
    caption: "Top 10 Beauty Essentials",
  },
  {
    id: "Davi8UijaxF",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784471137/today-beauty-tips_tkzbog.png",
    caption: "Hair Care Routine Guide",
  },
  {
    id: "DaviEoIDdjO",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784225462/beauty_myth_vs_truth_vrngh7.png",
    caption: "Sunscreen SPF Guide",
  },
  {
    id: "DavhBqvH8r4",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-2_rtcjzp.png",
    caption: "Foundation Shade Guide",
  },
  {
    id: "DavfxROn0b8",
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221445/wedding_ro6df3.png",
    caption: "Lipstick Tips for Your Skin Tone",
  },
];

export default function InstagramFeed() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="py-12 bg-white" aria-labelledby="instagram-heading">
      <div className="max-w-[1400px] mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaInstagram size={24} className="text-pink-500" />
            <h2 id="instagram-heading" className="text-2xl font-bold text-brand-primary font-serif">
              FOLLOW US ON INSTAGRAM
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            <a href="https://instagram.com/shreeambikabeautyshop" target="_blank" rel="noopener noreferrer"
              className="font-semibold text-pink-500 hover:underline">
              @shreeambikabeautyshop
            </a>
            {" "}— Follow for daily beauty tips, offers & product updates
          </p>
        </div>

        {/* Image-only Instagram grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {POSTS.map((post) => (
            <a
              key={post.id}
              href={`https://www.instagram.com/p/${post.id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              onMouseEnter={() => setHovered(post.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Post image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.img}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Instagram gradient overlay on hover */}
              <div className={`absolute inset-0 transition-opacity duration-300 ${hovered === post.id ? "opacity-100" : "opacity-0"}`}
                style={{ background: "linear-gradient(135deg, rgba(131,58,180,0.75) 0%, rgba(253,29,29,0.75) 50%, rgba(252,176,69,0.75) 100%)" }} />

              {/* View on Instagram badge */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity duration-300 ${hovered === post.id ? "opacity-100" : "opacity-0"}`}>
                <FaInstagram size={28} className="text-white drop-shadow-lg" />
                <span className="text-white text-xs font-bold drop-shadow-lg flex items-center gap-1">
                  View on Instagram <FiExternalLink size={11} />
                </span>
              </div>

              {/* Instagram icon badge always visible (bottom right) */}
              <div className="absolute bottom-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                <FaInstagram size={14} className="text-pink-500" />
              </div>
            </a>
          ))}
        </div>

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://instagram.com/shreeambikabeautyshop"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-md"
            style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}
          >
            <FaInstagram size={18} />
            Follow Us on Instagram
          </a>
          <a
            href="https://wa.me/918291455297"
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
