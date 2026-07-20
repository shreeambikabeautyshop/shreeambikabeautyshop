"use client";
import { useEffect } from "react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

// Your real Instagram post IDs
const POSTS = [
  "DavkfX_n7k8",
  "Davi8UijaxF",
  "DaviEoIDdjO",
  "DavhBqvH8r4",
  "DavfxROn0b8",
];

export default function InstagramFeed() {
  // Load Instagram embed script
  useEffect(() => {
    const existing = document.querySelector('script[src="//www.instagram.com/embed.js"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "//www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Re-process embeds if script already loaded
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    }
  }, []);

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
            {" "}— Stay updated with latest beauty trends &amp; offers
          </p>
        </div>

        {/* Instagram embeds — horizontal scroll on mobile, wrap on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8 items-start">
          {POSTS.map((id) => (
            <div key={id} className="w-full overflow-hidden rounded-2xl">
              <blockquote
                className="instagram-media"
                data-instgrm-captioned
                data-instgrm-permalink={`https://www.instagram.com/p/${id}/?utm_source=ig_embed&utm_campaign=loading`}
                data-instgrm-version="14"
                style={{
                  background: "#FFF",
                  border: 0,
                  borderRadius: "12px",
                  boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                  margin: 0,
                  maxWidth: "100%",
                  minWidth: "0",
                  padding: 0,
                  width: "100%",
                }}
              />
            </div>
          ))}
        </div>

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

// Extend window type for Instagram embed
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}
