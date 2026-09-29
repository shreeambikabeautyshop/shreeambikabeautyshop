"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useUser } from "@/app/context/UserContext";
import { createClient } from "@supabase/supabase-js";
import { FiPackage, FiTruck, FiCheck, FiClock, FiExternalLink, FiShoppingBag, FiStar } from "react-icons/fi";
import { cldImg } from "@/app/lib/cloudinary-img";

type OrderItem = { id: string; name: string; brand: string; price: number; qty: number; images?: string[]; slug?: string; };
type Order = {
  id: string;
  sabs_order_id: string;
  receipt_no: string;
  razorpay_payment_id: string;
  product_name: string;
  grand_total: number;
  product_price?: number;
  items: OrderItem[];
  status: string;
  source: string;
  delivery_address: string;
  delivery_city: string;
  awb_code: string;
  tracking_url: string;
  courier_name: string;
  estimated_delivery: string;
  created_at: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new:           { label: "Order Placed",    color: "bg-blue-100 text-blue-700",    icon: <FiClock size={12} /> },
  ready_to_ship: { label: "Ready to Ship",  color: "bg-orange-100 text-orange-700", icon: <FiPackage size={12} /> },
  in_transit:    { label: "In Transit",     color: "bg-purple-100 text-purple-700", icon: <FiTruck size={12} /> },
  delivered:     { label: "Delivered",      color: "bg-green-100 text-green-700",   icon: <FiCheck size={12} /> },
  store_pickup:  { label: "Store Pickup",   color: "bg-teal-100 text-teal-700",     icon: <FiCheck size={12} /> },
};

export default function MyOrdersPage() {
  const { customer, isLoggedIn, triggerLogin } = useUser();
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !customer?.phone) {
      setLoading(false);
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase
      .from("sabs_orders")
      .select("*")
      .eq("customer_phone", customer.phone)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(data || []);
        setLoading(false);
      });
  }, [isLoggedIn, customer]);

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">📦</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">View Your Orders</h1>
            <p className="text-gray-500 text-sm mb-6">Login with your phone number to see your order history</p>
            <button onClick={() => triggerLogin("order")}
              className="bg-brand-primary text-white font-bold px-8 py-3 rounded-full hover:bg-brand-dark transition-colors">
              Login to View Orders
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-[800px] mx-auto px-4 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-400">
                Hello {customer?.full_name?.split(" ")[0]}! — {orders.length} order{orders.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link href="/products"
              className="flex items-center gap-1.5 text-sm text-brand-primary font-semibold border border-brand-primary px-4 py-2 rounded-full hover:bg-brand-light transition-colors">
              <FiShoppingBag size={13} /> Shop More
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-32" />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && orders.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="text-6xl mb-4">📭</div>
              <p className="font-semibold text-gray-700 mb-2">No orders yet</p>
              <p className="text-sm text-gray-400 mb-6">Your orders will appear here after you shop</p>
              <Link href="/products"
                className="inline-flex items-center gap-2 bg-brand-primary text-white font-bold px-6 py-3 rounded-full hover:bg-brand-dark transition-colors text-sm">
                <FiShoppingBag size={14} /> Start Shopping
              </Link>
            </div>
          )}

          {/* Orders list */}
          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = STATUS_MAP[order.status] || STATUS_MAP.new;
                const orderItems: OrderItem[] = Array.isArray(order.items) ? order.items : [];
                const date = new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                });

                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Order header */}
                    <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400">Order ID</p>
                        <p className="font-bold text-gray-800 text-sm">{order.receipt_no || order.sabs_order_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{date}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="px-5 py-4">
                      {orderItems.length > 0 ? (
                        <div className="space-y-3">
                          {orderItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-brand-light flex-shrink-0 border border-gray-100">
                                {item.images?.[0] ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={cldImg(item.images[0], 56)} alt={item.name}
                                    className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl">💄</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-bold text-brand-primary uppercase">{item.brand}</p>
                                <p className="text-xs font-semibold text-gray-800 line-clamp-2">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.qty} × ₹{item.price}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-sm text-gray-900">₹{item.price * item.qty}</p>
                                {item.slug && (
                                  <Link href={`/products/${item.slug}`}
                                    className="text-[10px] text-brand-primary hover:underline flex items-center gap-0.5 justify-end mt-0.5">
                                    View <FiExternalLink size={9} />
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">{order.product_name}</p>
                      )}
                    </div>

                    {/* Order footer */}
                    <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
                      <div>
                        {order.awb_code && (
                          <p className="text-xs text-gray-500">
                            AWB: <span className="font-semibold text-gray-700">{order.awb_code}</span>
                          </p>
                        )}
                        {order.courier_name && (
                          <p className="text-xs text-gray-400">{order.courier_name}</p>
                        )}
                        {!order.awb_code && (
                          <p className="text-xs text-gray-400">
                            {order.source === "store_pickup" ? "Store Pickup" : "Delivery details will be updated"}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-brand-primary">₹{order.grand_total?.toLocaleString("en-IN") || order.product_price}</span>
                        {order.tracking_url && (
                          <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-brand-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-brand-dark transition-colors">
                            <FiTruck size={10} /> Track
                          </a>
                        )}
                        {order.status === "delivered" && (
                          <Link href={`/reviews?order=${order.sabs_order_id}`}
                            className="flex items-center gap-1 bg-yellow-400 text-white text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-yellow-500 transition-colors">
                            <FiStar size={10} /> Review
                          </Link>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
