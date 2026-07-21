"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FiGrid, FiPackage, FiPlusCircle, FiLogOut, FiHome, FiStar, FiSettings, FiUsers, FiDollarSign, FiActivity } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const navItems = [
  { label: "Dashboard",          href: "/sabs-controller/dashboard",                          icon: <FiGrid /> },
  { label: "All Products",       href: "/sabs-controller/dashboard/products",                  icon: <FiPackage /> },
  { label: "Add Product",        href: "/sabs-controller/dashboard/products/add",              icon: <FiPlusCircle /> },
  { label: "Price Manager",      href: "/sabs-controller/dashboard/price-manager",             icon: <FiDollarSign /> },
  { label: "Customer Reviews",   href: "/sabs-controller/dashboard/reviews",                   icon: <FiStar /> },
  { label: "WhatsApp Analytics", href: "/sabs-controller/dashboard/whatsapp-analytics",        icon: <FaWhatsapp /> },
  { label: "Visitor Analytics",  href: "/sabs-controller/dashboard/visitors",                  icon: <FiActivity /> },
  { label: "Customers",          href: "/sabs-controller/dashboard/customers",                 icon: <FiUsers /> },
  { label: "Settings",           href: "/sabs-controller/dashboard/settings",                  icon: <FiSettings /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/sabs-controller");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col fixed h-full z-40">
        {/* Brand */}
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">SA</span>
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-tight">Shree Ambika</p>
              <p className="text-[10px] text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-brand-primary text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <FiHome className="text-base" /> View Website
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
          >
            <FiLogOut className="text-base" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 p-6 min-h-screen">{children}</main>
    </div>
  );
}
