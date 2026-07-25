"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import { FiUser, FiPhone, FiMail, FiMapPin, FiEdit, FiHeart, FiShoppingBag } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

export default function ProfilePage() {
  const { customer, isLoggedIn, triggerLogin, clearCustomer } = useUser();
  const router = useRouter();

  // If not logged in, show login modal and redirect home
  useEffect(() => {
    if (!isLoggedIn) {
      triggerLogin("order");
      router.push("/");
    }
  }, [isLoggedIn, triggerLogin, router]);

  if (!isLoggedIn || !customer) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const initials = customer.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-brand-primary text-white py-12 px-4">
          <div className="max-w-[700px] mx-auto text-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 text-3xl font-black">
              {initials}
            </div>
            <h1 className="text-2xl font-bold mb-1">{customer.full_name}</h1>
            <p className="text-white/70 text-sm">+91 {customer.phone}</p>
            {customer.city && <p className="text-white/60 text-xs mt-1">{customer.city}{customer.state ? `, ${customer.state}` : ""}</p>}
          </div>
        </div>

        <div className="max-w-[700px] mx-auto px-4 py-10 space-y-5">

          {/* Profile details card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-800 text-base mb-2">Your Details</h2>
            {[
              { icon: <FiUser size={14} />, label: "Full Name", value: customer.full_name },
              { icon: <FiPhone size={14} />, label: "Phone / WhatsApp", value: `+91 ${customer.phone}` },
              customer.email ? { icon: <FiMail size={14} />, label: "Email", value: customer.email } : null,
              { icon: <FiMapPin size={14} />, label: "Delivery Address", value: [customer.address, customer.city, customer.state, customer.pincode].filter(Boolean).join(", ") },
            ].filter(Boolean).map((item) => item && (
              <div key={item.label} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-brand-primary mt-0.5 flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
            {/* Edit button */}
            <button
              onClick={() => triggerLogin("order")}
              className="w-full mt-2 flex items-center justify-center gap-2 border-2 border-brand-primary text-brand-primary hover:bg-brand-light font-bold py-2.5 rounded-xl transition-colors text-sm"
            >
              <FiEdit size={14} /> Edit Profile
            </button>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/wishlist"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-2 hover:shadow-md transition-all hover:-translate-y-0.5 text-center">
              <FiHeart size={24} className="text-brand-primary" />
              <p className="font-bold text-gray-800 text-sm">My Wishlist</p>
              <p className="text-xs text-gray-400">Saved products</p>
            </Link>
            <Link href="/products"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-2 hover:shadow-md transition-all hover:-translate-y-0.5 text-center">
              <FiShoppingBag size={24} className="text-green-500" />
              <p className="font-bold text-gray-800 text-sm">Shop Products</p>
              <p className="text-xs text-gray-400">Browse & order</p>
            </Link>
          </div>

          {/* WhatsApp order */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
            <FaWhatsapp size={32} className="text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">Order via WhatsApp</p>
              <p className="text-xs text-gray-500 mt-0.5">Your details auto-fill — no typing needed every time</p>
            </div>
            <a
              href={`https://wa.me/918291455297?text=${encodeURIComponent(`Hi Vinod! I want to place an order.\n\nMy Name: ${customer.full_name}\nPhone: ${customer.phone}\nAddress: ${customer.address}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex-shrink-0"
            >
              Order Now
            </a>
          </div>

          {/* Logout */}
          <button
            onClick={() => { clearCustomer(); router.push("/"); }}
            className="w-full text-red-500 hover:bg-red-50 border border-red-200 font-bold py-3 rounded-xl transition-colors text-sm"
          >
            Logout
          </button>

        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
