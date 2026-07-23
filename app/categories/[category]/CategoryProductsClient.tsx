"use client";
import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { useState, useMemo } from "react";
import { useWhatsAppOrder } from "@/app/hooks/useWhatsAppOrder";

interface Product {
  id: string; name: string; slug: string; brand: string; category: string;
  price: number; mrp: number; discount: number; images: string[];
  rating?: number; reviews_count?: number; in_stock: boolean;
  featured?: boolean; trending?: boolean;
}

interface Props {
  products: Product[];
  categoryName: string;
  categorySlug: string;
}

export default function CategoryProductsClient({ products, categoryName, categorySlug }: Props) {
  const { openWhatsApp } = useWhatsAppOrder();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    if (sort === "price_asc")  list.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    if (sort === "discount")   list.sort((a, b) => (b.discount||0) - (a.discount||0));
    return list;
  }, [products, search, sort]);

  const handleOrder = (p: Product) => {
    openWhatsApp({
      productId: p.id,
      productName: p.name,
      productBrand: p.brand,
      productPrice: p.price,
      source: "category_page",
    });
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🛍️</p>
        <h2 className="text-xl font-bold text-gray-600 mb-2">Products Coming Soon!</h2>
        <p className="text-gray-400 text-sm mb-6">WhatsApp us to check availability of {categoryName} products.</p>
        <button
          onClick={() => openWhatsApp({ source: "category_page", customMessage: `Hi Vinod! Do you have ${categoryName} products?\nShree Ambika Beauty Shop` })}
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-full transition-colors">
          <FaWhatsapp size={18} /> Ask on WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search + sort bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 min-w-[200px] shadow-sm">
          <FiSearch size={14} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search in ${categoryName}...`}
            className="outline-none text-sm text-gray-700 bg-transparent flex-1 placeholder-gray-400"
          />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="bg-white border border-gray-200 text-sm text-gray-700 px-3 py-2.5 rounded-xl outline-none shadow-sm">
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="discount">Best Discount</option>
        </select>
        <p className="text-sm text-gray-500">
          <strong className="text-gray-800">{filtered.length}</strong> products
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No products match &quot;{search}&quot;</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
              <Link href={`/products/${p.slug || p.id}`} className="relative aspect-square bg-brand-light overflow-hidden block">
                {p.images?.[0] ? (
                  <Image src={p.images[0]} alt={p.name} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">💄</div>
                )}
                {p.trending && (
                  <span className="absolute top-2 left-2 bg-brand-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">🔥 Trending</span>
                )}
                {(p.discount ?? 0) > 0 && (
                  <span className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {p.discount}% OFF
                  </span>
                )}
              </Link>
              <div className="p-3 flex flex-col flex-1">
                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wide mb-0.5">{p.brand}</p>
                <Link href={`/products/${p.slug || p.id}`}>
                  <h3 className="text-xs font-semibold text-gray-800 leading-tight mb-2 line-clamp-2 hover:text-brand-primary">{p.name}</h3>
                </Link>
                <div className="flex items-center gap-1.5 mb-2 mt-auto">
                  <span className="font-bold text-gray-900">₹{p.price}</span>
                  {p.mrp > p.price && <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>}
                </div>
                <button
                  onClick={() => handleOrder(p)}
                  className="w-full flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-[11px] font-bold py-2 rounded-xl transition-colors">
                  <FaWhatsapp size={11} /> Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
