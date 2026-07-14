"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiPackage, FiPlusCircle, FiTrendingUp, FiStar } from "react-icons/fi";

interface StatsType {
  total: number;
  inStock: number;
  featured: number;
  trending: number;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<StatsType>({ total: 0, inStock: 0, featured: 0, trending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) {
          setStats({
            total: data.length,
            inStock: data.filter((p: { in_stock: boolean }) => p.in_stock).length,
            featured: data.filter((p: { featured: boolean }) => p.featured).length,
            trending: data.filter((p: { trending: boolean }) => p.trending).length,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Products", value: stats.total, icon: <FiPackage size={24} />, color: "bg-blue-500", href: "/sabs-controller/dashboard/products" },
    { label: "In Stock", value: stats.inStock, icon: <FiTrendingUp size={24} />, color: "bg-green-500", href: "/sabs-controller/dashboard/products" },
    { label: "Featured", value: stats.featured, icon: <FiStar size={24} />, color: "bg-yellow-500", href: "/sabs-controller/dashboard/products" },
    { label: "Trending", value: stats.trending, icon: <FiTrendingUp size={24} />, color: "bg-brand-primary", href: "/sabs-controller/dashboard/products" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Manage your products here.</p>
        </div>
        <Link
          href="/sabs-controller/dashboard/products/add"
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <FiPlusCircle /> Add New Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4`}>
              {card.icon}
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {loading ? "..." : card.value}
            </p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/sabs-controller/dashboard/products/add"
            className="flex items-center gap-3 p-4 bg-brand-light rounded-xl hover:bg-pink-100 transition-colors"
          >
            <FiPlusCircle className="text-brand-primary text-xl" />
            <span className="font-medium text-sm text-gray-700">Add New Product</span>
          </Link>
          <Link
            href="/sabs-controller/dashboard/products"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <FiPackage className="text-blue-600 text-xl" />
            <span className="font-medium text-sm text-gray-700">Manage Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
