"use client";
import { useState } from "react";
import Image from "next/image";
import { FaInstagram, FaWhatsapp, FaHeart, FaComment } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

// Your real Instagram posts — update image URLs and post links as you add more
// To get image URLs: open each post on Instagram, right-click image → copy image address
// OR upload your Instagram post images to Cloudinary and paste URLs here
const posts = [
  {
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221445/wedding_ro6df3.png",
    link: "https://instagram.com/shreeambikabeautyshop",
    caption: "Pilgrim Korean Rice Water & Collagen Hair Mask",
  },
  {
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221436/party_feyaq1.png",
    link: "https://instagram.com/shreeambikabeautyshop",
    caption: "Anti-Hairfall Complete Care for Healthier Hair",
  },
  {
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221435/office_c55njk.png",
    link: "https://instagram.com/shreeambikabeautyshop",
    caption: "Pilgrim Advanced Hair Growth Serum",
  },
  {
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221435/daily_use_csbkl7.png",
    link: "https://instagram.com/shreeambikabeautyshop",
    caption: "Pilgrim Hair Growth Oil with Spanish Rosemary",
  },
  {
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221435/Date-night_gr0fui.png",
    link: "https://instagram.com/shreeambikabeautyshop",
    caption: "Jovees Hair Serum Grape Seed & Almond",
  },
  {
    img: "https://res.cloudinary.com/zjlchjal/image/upload/v1784221437/festival_vh2wqu.png",
    link: "https://instagram.com/shreeambikabeautyshop",
    caption: "New Arrivals at Shree Ambika Beauty Shop",
  },
];

export default function InstagramFeed() {
  const [hovered, setHovered] = useState<number | null>(null);

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
            {" "}— Stay updated with latest beauty trends & offers
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          {posts.map((post, idx) => (
            <a
              key={idx}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={post.caption}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.03]"
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
            >
              <Image
                src={post.img}
                alt={post.caption}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 33vw, 16vw"
              />

              {/* Hover overlay */}
              <div className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 transition-opacity duration-300 ${hovered === idx ? "opacity-100" : "opacity-0"}`}>
                <FiExternalLink size={20} className="text-white" />
                <p className="text-white text-[10px] font-bold text-center px-2 leading-tight line-clamp-2">
                  {post.caption}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-white text-[10px]">
                    <FaHeart size={10} /> View
                  </span>
                  <span className="flex items-center gap-1 text-white text-[10px]">
                    <FaComment size={10} /> Post
                  </span>
                </div>
              </div>

              {/* Instagram gradient border on hover */}
              <div className={`absolute inset-0 rounded-2xl ring-2 transition-all duration-300 ${hovered === idx ? "ring-pink-400" : "ring-transparent"}`} />
            </a>
          ))}
        </div>

        {/* Notice to update */}
        <p className="text-center text-xs text-gray-400 mb-5 italic">
          * Upload your Instagram post images to show real posts here
        </p>

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://instagram.com/shreeambikabeautyshop"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-md"
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
