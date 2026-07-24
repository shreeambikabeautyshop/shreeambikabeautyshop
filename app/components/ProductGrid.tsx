"use client";
import { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import ProductCard, { ProductCardData } from "./ProductCard";
import { useWhatsAppOrder } from "@/app/hooks/useWhatsAppOrder";

interface Props {
  products: ProductCardData[];
  source?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyWhatsAppMsg?: string;
  columns?: 4 | 5; // default 4
  rowsPerPage?: number; // default 5 → 20 per page
}

export default function ProductGrid({
  products,
  source = "product_grid",
  emptyTitle = "Products Coming Soon!",
  emptyMessage = "WhatsApp Vinod to check availability.",
  emptyWhatsAppMsg = "Hi Vinod! I am looking for beauty products. Can you help?",
  columns = 4,
  rowsPerPage = 5,
}: Props) {
  const { openWhatsApp } = useWhatsAppOrder();
  const [page, setPage] = useState(1);

  const perPage = columns * rowsPerPage; // 4×5=20 or 5×5=25

  const totalPages = Math.max(1, Math.ceil(products.length / perPage));
  const paged = useMemo(
    () => products.slice((page - 1) * perPage, page * perPage),
    [products, page, perPage]
  );

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">💄</p>
        <h3 className="text-lg font-bold text-gray-600 mb-2">{emptyTitle}</h3>
        <p className="text-gray-400 text-sm mb-6">{emptyMessage}</p>
        <button
          onClick={() => openWhatsApp({ source, customMessage: emptyWhatsAppMsg })}
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-full transition-colors"
        >
          <FaWhatsapp size={16} /> WhatsApp Vinod
        </button>
      </div>
    );
  }

  const gridCols =
    columns === 5
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div>
      {/* Product grid */}
      <div className={`grid ${gridCols} gap-4`}>
        {paged.map((p) => (
          <ProductCard key={p.id} product={p} source={source} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <strong className="text-gray-800">
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, products.length)}
            </strong>{" "}
            of <strong className="text-gray-800">{products.length}</strong> products
          </p>

          <div className="flex items-center gap-1.5">
            {/* First */}
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
            >«</button>

            {/* Prev */}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all flex items-center justify-center"
            ><FiChevronLeft size={14} /></button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pg = start + i;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    pg === page
                      ? "bg-brand-primary text-white shadow-md"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >{pg}</button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all flex items-center justify-center"
            ><FiChevronRight size={14} /></button>

            {/* Last */}
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
            >»</button>
          </div>
        </div>
      )}
    </div>
  );
}
