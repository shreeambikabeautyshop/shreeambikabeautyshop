"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiEdit2, FiTrash2, FiPlusCircle, FiSearch, FiShare2, FiExternalLink } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  discount: number;
  images: string[];
  in_stock: boolean;
  featured: boolean;
  trending: boolean;
  created_at: string;
}

const BASE_URL = "https://shreeambikabeautyshop.vercel.app";

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(({ data }) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  const getProductUrl = (p: Product) =>
    `${BASE_URL}/products/${p.slug || p.id}`;

  const handleCopyUrl = async (p: Product) => {
    const url = getProductUrl(p);
    await navigator.clipboard.writeText(url);
    setCopied(p.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShareWhatsApp = (p: Product) => {
    const url = getProductUrl(p);
    const msg = encodeURIComponent(
      `*${p.name}*\n` +
      `Price: Rs.${p.price} (MRP Rs.${p.mrp}) - ${p.discount}% OFF\n` +
      `100% Original Product\n\n` +
      `View Product: ${url}\n\n` +
      `Order on WhatsApp: +918291455297\n` +
      `Shree Ambika Beauty Shop`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Products</h1>
          <p className="text-gray-500 text-sm">
            <span className="font-bold text-brand-primary text-base">{products.length}</span> products total
            {search && <span className="ml-2">• {filtered.length} results</span>}
          </p>
        </div>
        <Link
          href="/sabs-controller/dashboard/products/add"
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <FiPlusCircle /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, brand, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700 flex-1"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 text-xs">
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FiPlusCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No products found</p>
            <Link href="/sabs-controller/dashboard/products/add" className="text-brand-primary text-sm hover:underline mt-1 inline-block">
              Add your first product →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-center px-3 py-3 font-semibold text-gray-500 w-10">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Brand</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tags</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    {/* Sr No */}
                    <td className="px-3 py-3 text-center">
                      <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center mx-auto">
                        {idx + 1}
                      </span>
                    </td>

                    {/* Image + Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-brand-light overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.name} width={48} height={48} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-xl">📦</span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-gray-800 line-clamp-1 max-w-[160px] block">{p.name}</span>
                          {/* Product URL preview */}
                          <a
                            href={getProductUrl(p)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-gray-400 hover:text-brand-primary truncate max-w-[160px] block flex items-center gap-1"
                          >
                            <FiExternalLink size={9} />
                            /products/{(p.slug || p.id).slice(0, 25)}...
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600 text-xs">{p.brand}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">{p.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-800">₹{p.price}</p>
                      <p className="text-xs text-gray-400 line-through">₹{p.mrp}</p>
                      <p className="text-xs text-green-600 font-semibold">{p.discount}% OFF</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.in_stock ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                        {p.in_stock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {p.featured && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">⭐</span>}
                        {p.trending && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">🔥</span>}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Edit */}
                        <Link
                          href={`/sabs-controller/dashboard/products/edit/${p.id}`}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={13} />
                        </Link>

                        {/* Copy URL */}
                        <button
                          onClick={() => handleCopyUrl(p)}
                          className={`p-2 rounded-lg transition-colors text-xs font-bold ${
                            copied === p.id
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-500"
                          }`}
                          title="Copy product URL"
                        >
                          {copied === p.id ? "✓" : <FiShare2 size={13} />}
                        </button>

                        {/* Share on WhatsApp */}
                        <button
                          onClick={() => handleShareWhatsApp(p)}
                          className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                          title="Share on WhatsApp"
                        >
                          <FaWhatsapp size={13} />
                        </button>

                        {/* View live */}
                        <a
                          href={getProductUrl(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors"
                          title="View live product page"
                        >
                          <FiExternalLink size={13} />
                        </a>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deleting === p.id}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer summary */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
              <span>Showing {filtered.length} of {products.length} products</span>
              <span>Total value: ₹{products.reduce((sum, p) => sum + p.price, 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
