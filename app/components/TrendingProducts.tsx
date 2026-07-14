"use client";
import { useState } from "react";
import Link from "next/link";
import { FiShoppingCart, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const products = [
  {
    id: 1,
    name: "Lakme Color + Matte Lipstick - Blush Mauve",
    brand: "Lakme",
    price: 349,
    mrp: 499,
    discount: 30,
    rating: 4.4,
    reviews: 742,
    emoji: "💄",
    tag: "10% OFF",
    color: "from-pink-100 to-rose-50",
  },
  {
    id: 2,
    name: "Maybelline Fit Me Matte + Poreless Foundation",
    brand: "Maybelline",
    price: 449,
    mrp: 699,
    discount: 36,
    rating: 4.3,
    reviews: 1205,
    emoji: "🧴",
    tag: "15% OFF",
    color: "from-amber-50 to-yellow-50",
  },
  {
    id: 3,
    name: "Sugar Beauty Eyeshadow Palette - 12 Shades",
    brand: "SUGAR",
    price: 599,
    mrp: 999,
    discount: 40,
    rating: 4.5,
    reviews: 634,
    emoji: "🎨",
    tag: "20% OFF",
    color: "from-purple-50 to-pink-50",
  },
  {
    id: 4,
    name: "Plum 15% Niacinamide Face Serum",
    brand: "Plum",
    price: 449,
    mrp: 599,
    discount: 25,
    rating: 4.6,
    reviews: 987,
    emoji: "💧",
    tag: "25% OFF",
    color: "from-green-50 to-emerald-50",
  },
  {
    id: 5,
    name: "Lakme Absolute Foundation",
    brand: "Lakme",
    price: 529,
    mrp: 799,
    discount: 34,
    rating: 4.2,
    reviews: 541,
    emoji: "✨",
    tag: "30% OFF",
    color: "from-rose-50 to-pink-50",
  },
  {
    id: 6,
    name: "Vega High Volume Mascara",
    brand: "Vega",
    price: 249,
    mrp: 399,
    discount: 38,
    rating: 4.1,
    reviews: 378,
    emoji: "👁️",
    tag: "35% OFF",
    color: "from-gray-50 to-slate-50",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={10}
          className={star <= Math.floor(rating) ? "text-yellow-400" : "text-gray-200"}
        />
      ))}
      <span className="text-[10px] text-gray-500 ml-1">({rating})</span>
    </div>
  );
}

export default function TrendingProducts() {
  const [startIdx, setStartIdx] = useState(0);
  const visible = 4;

  const prev = () => setStartIdx(Math.max(0, startIdx - 1));
  const next = () => setStartIdx(Math.min(products.length - visible, startIdx + 1));

  const visibleProducts = products.slice(startIdx, startIdx + visible);

  return (
    <section className="py-12 bg-brand-light" aria-labelledby="trending-heading">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between mb-7">
          <h2 id="trending-heading" className="text-2xl font-bold text-brand-primary font-serif">
            🔥 TRENDING PRODUCTS
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              disabled={startIdx === 0}
              aria-label="Previous products"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:bg-brand-primary hover:text-white hover:border-brand-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              disabled={startIdx >= products.length - visible}
              aria-label="Next products"
              className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:bg-brand-primary hover:text-white hover:border-brand-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-pink-50 group"
            >
              {/* Product image placeholder */}
              <div className={`relative h-48 bg-gradient-to-br ${product.color} flex items-center justify-center`}>
                <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                  {product.emoji}
                </span>
                <span className="absolute top-3 left-3 bg-brand-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  {product.tag}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wide mb-1">
                  {product.brand}
                </p>
                <h3 className="text-xs font-semibold text-gray-800 leading-tight mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <StarRating rating={product.rating} />
                <p className="text-[10px] text-gray-400 mb-2">({product.reviews} reviews)</p>

                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-gray-900 text-sm">₹{product.price}</span>
                  <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                  <span className="text-xs font-bold text-green-600">{product.discount}% OFF</span>
                </div>

                <button className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                  <FiShoppingCart size={13} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-block border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-semibold px-10 py-3 rounded-full transition-all"
          >
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
