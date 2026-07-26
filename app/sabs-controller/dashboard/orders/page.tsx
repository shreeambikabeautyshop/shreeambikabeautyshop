"use client";
import { useEffect, useState, useCallback } from "react";
import {
  FiTruck, FiRefreshCw, FiPackage, FiCheckCircle, FiClock,
  FiMapPin, FiPhone, FiCalendar, FiExternalLink, FiAlertCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

type OrderStatus = "new" | "ready_to_ship" | "in_transit" | "delivered" | "rto";

interface Order {
  id: string;
  sabs_order_id: string;
  shiprocket_order_id: string;
  shipment_id: string;
  awb: string | null;
  courier_name: string | null;
  estimated_delivery: string | null;
  customer_name: string;
  customer_phone: string;
  product_name: string;
  product_price: number;
  delivery_address: string | null;
  delivery_pincode: string | null;
  delivery_city: string | null;
  delivery_state: string | null;
  status: OrderStatus;
  source: string;
  manifest_url: string | null;
  label_url: string | null;
  created_at: string;
  updated_at: string | null;
}

const STATUS_TABS: { key: OrderStatus | "all"; label: string; color: string }[] = [
  { key: "all",           label: "All",            color: "bg-gray-500" },
  { key: "new",           label: "New",            color: "bg-blue-500" },
  { key: "ready_to_ship", label: "Ready to Ship",  color: "bg-orange-500" },
  { key: "in_transit",    label: "In Transit",     color: "bg-purple-500" },
  { key: "delivered",     label: "Delivered",      color: "bg-green-500" },
  { key: "rto",           label: "RTO",            color: "bg-red-500" },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  new:           "bg-blue-100 text-blue-700",
  ready_to_ship: "bg-orange-100 text-orange-700",
  in_transit:    "bg-purple-100 text-purple-700",
  delivered:     "bg-green-100 text-green-700",
  rto:           "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  new:           "New",
  ready_to_ship: "Ready to Ship",
  in_transit:    "In Transit",
  delivered:     "Delivered",
  rto:           "RTO",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function OrdersPage() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<OrderStatus | "all">("all");
  const [rtsLoading, setRtsLoading] = useState<Record<string, boolean>>({});
  const [toast, setToast]       = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${tab}`);
      const json = await res.json();
      setOrders(json.data || []);
    } catch { setOrders([]); }
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  // ── Mark Ready to Ship ───────────────────────────────────────────────────
  const markReadyToShip = async (order: Order) => {
    if (!order.shipment_id) {
      // Try to fetch shipment_id from Shiprocket using the order_id
      showToast("Fetching shipment details from Shiprocket...", "success");
      setRtsLoading(prev => ({ ...prev, [order.id]: true }));
      try {
        const syncRes = await fetch(`/api/admin/shiprocket/track?order_id=${order.shiprocket_order_id}`);
        const syncData = await syncRes.json();
        const fetchedShipmentId = syncData?.details?.shipment_id || syncData?.shipment_id || null;
        if (fetchedShipmentId) {
          // Update in DB
          await fetch("/api/admin/orders", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: order.id, shipment_id: String(fetchedShipmentId), awb: syncData?.details?.awb_code || order.awb }),
          });
          setOrders(prev => prev.map(o => o.id === order.id ? { ...o, shipment_id: String(fetchedShipmentId) } : o));
          order = { ...order, shipment_id: String(fetchedShipmentId) };
        } else {
          showToast(`No shipment ID found. Go to Shiprocket → Orders to check order ${order.shiprocket_order_id}`, "error");
          setRtsLoading(prev => ({ ...prev, [order.id]: false }));
          return;
        }
      } catch {
        showToast("Could not fetch shipment details. Check Shiprocket manually.", "error");
        setRtsLoading(prev => ({ ...prev, [order.id]: false }));
        return;
      }
    }
    setRtsLoading(prev => ({ ...prev, [order.id]: true }));
    try {
      const res = await fetch("/api/admin/shiprocket/ready-to-ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_db_id:  order.id,
          shipment_id:  order.shipment_id,
          awb:          order.awb,
        }),
      });
      let data: { success?: boolean; message?: string; error?: string; manifest_url?: string; label_url?: string } = {};
      try { data = await res.json(); } catch { data = { error: `Server error ${res.status}` }; }

      if (data.success) {
        showToast(data.message || "Pickup scheduled!");
        // Update local state
        setOrders(prev => prev.map(o =>
          o.id === order.id
            ? { ...o, status: "ready_to_ship", manifest_url: data.manifest_url, label_url: data.label_url }
            : o
        ));
      } else {
        showToast(data.error || "Failed to schedule pickup", "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Network error", "error");
    }
    setRtsLoading(prev => ({ ...prev, [order.id]: false }));
  };

  // ── Manual status update ─────────────────────────────────────────────────
  const updateStatus = async (order: Order, newStatus: OrderStatus) => {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: newStatus }),
    });
    let data: { success?: boolean; error?: string } = {};
    try { data = await res.json(); } catch { data = { error: `Server error ${res.status}` }; }
    if (data.success) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
      showToast(`Status updated to ${STATUS_LABELS[newStatus]}`);
    } else {
      showToast(data.error || "Failed to update status", "error");
    }
  };

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-xl transition-all ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "success" ? "✅" : "⚠️"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FiTruck size={22} className="text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
            <p className="text-gray-500 text-sm mt-0.5">All WhatsApp orders — ship, track, manage</p>
          </div>
        </div>
        <button onClick={load} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200">
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {STATUS_TABS.filter(t => t.key !== "all").map(t => (
          <div key={t.key} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-black text-gray-800">{counts[t.key] || 0}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === t.key ? `${t.color} text-white` : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t.label}
            {t.key !== "all" && counts[t.key] > 0 && (
              <span className="ml-1.5 bg-white/30 px-1.5 py-0.5 rounded-full text-[9px]">{counts[t.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <FiPackage size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm font-semibold">No orders yet</p>
          <p className="text-gray-300 text-xs mt-1">Orders will appear here after clicking Ship on WhatsApp Analytics</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 flex flex-wrap gap-4">
                {/* Order ID + Status */}
                <div className="flex-shrink-0 min-w-[140px]">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Order ID</p>
                  <p className="text-xs font-black text-gray-800 font-mono">{order.sabs_order_id}</p>
                  <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* Customer */}
                <div className="flex-1 min-w-[140px]">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase flex items-center gap-1"><FiPhone size={9}/> Customer</p>
                  <p className="text-sm font-bold text-gray-800">{order.customer_name}</p>
                  {order.customer_phone && (
                    <a href={`https://wa.me/91${order.customer_phone}`} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-green-600 hover:underline flex items-center gap-1 mt-0.5">
                      <FaWhatsapp size={10}/> {order.customer_phone}
                    </a>
                  )}
                  {order.delivery_city && (
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <FiMapPin size={9}/> {order.delivery_city}, {order.delivery_state} — {order.delivery_pincode}
                    </p>
                  )}
                </div>

                {/* Product */}
                <div className="flex-1 min-w-[140px]">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase flex items-center gap-1"><FiPackage size={9}/> Product</p>
                  <p className="text-xs font-bold text-gray-800 line-clamp-2">{order.product_name}</p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">₹{order.product_price}</p>
                </div>

                {/* Courier / AWB */}
                <div className="flex-1 min-w-[140px]">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase flex items-center gap-1"><FiTruck size={9}/> Courier</p>
                  {order.courier_name ? (
                    <>
                      <p className="text-xs font-bold text-gray-800">{order.courier_name}</p>
                      {order.awb && (
                        <p className="text-[10px] font-mono text-gray-600 mt-0.5">AWB: {order.awb}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-[10px] text-gray-400">Not assigned yet</p>
                  )}
                  {order.estimated_delivery && (
                    <p className="text-[10px] text-green-600 font-bold mt-0.5 flex items-center gap-1">
                      <FiCalendar size={9}/> EDD: {order.estimated_delivery}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="flex-shrink-0 text-right min-w-[90px]">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Ordered</p>
                  <p className="text-[10px] font-semibold text-gray-700">{fmtDate(order.created_at)}</p>
                  <p className="text-[10px] text-gray-500">{fmtTime(order.created_at)}</p>
                </div>
              </div>

              {/* Action bar */}
              <div className="bg-gray-50 border-t border-gray-100 px-4 py-2.5 flex items-center gap-2 flex-wrap">
                {/* Ready to Ship button — only for "new" orders */}
                {order.status === "new" && (
                  <button
                    onClick={() => markReadyToShip(order)}
                    disabled={rtsLoading[order.id]}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                      rtsLoading[order.id]
                        ? "bg-orange-100 text-orange-400 animate-pulse cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
                    <FiTruck size={11}/>
                    {rtsLoading[order.id] ? "Scheduling..." : "Ready to Ship"}
                  </button>
                )}

                {/* In Transit — for ready_to_ship */}
                {order.status === "ready_to_ship" && (
                  <button onClick={() => updateStatus(order, "in_transit")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-colors">
                    <FiClock size={11}/> Mark In Transit
                  </button>
                )}

                {/* Delivered — for in_transit */}
                {order.status === "in_transit" && (
                  <button onClick={() => updateStatus(order, "delivered")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors">
                    <FiCheckCircle size={11}/> Mark Delivered
                  </button>
                )}

                {/* Shiprocket link */}
                {order.shiprocket_order_id && (
                  <a href="https://app.shiprocket.in/seller/orders" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                    <FiExternalLink size={10}/> View in Shiprocket
                  </a>
                )}

                {/* AWB tracking link */}
                {order.awb && (
                  <a href={`https://shiprocket.co/tracking/${order.awb}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors">
                    <FiTruck size={10}/> Track AWB
                  </a>
                )}

                {/* Label PDF */}
                {order.label_url && (
                  <a href={order.label_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 transition-colors">
                    🏷️ Print Label
                  </a>
                )}

                {/* Manifest PDF */}
                {order.manifest_url && (
                  <a href={order.manifest_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-700 transition-colors">
                    📋 Manifest
                  </a>
                )}

                {/* WhatsApp customer with AWB */}
                {order.awb && order.customer_phone && (
                  <a href={`https://wa.me/91${order.customer_phone}?text=${encodeURIComponent(
                    `Hi ${order.customer_name}! 😊\n\nYour order *${order.product_name}* has been shipped! 🚀\n\nCourier: *${order.courier_name || "—"}*\nAWB: *${order.awb}*\n${order.estimated_delivery ? `Expected Delivery: *${order.estimated_delivery}*\n` : ""}Track here: https://shiprocket.co/tracking/${order.awb}\n\nThank you for shopping at Shree Ambika Beauty Shop! 💄\n+918291455297`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors">
                    <FaWhatsapp size={11}/> Send Tracking to Customer
                  </a>
                )}

                {/* RTO */}
                {(order.status === "in_transit" || order.status === "ready_to_ship") && (
                  <button onClick={() => updateStatus(order, "rto")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition-colors ml-auto">
                    <FiAlertCircle size={10}/> Mark RTO
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supabase SQL note — hidden once table is working */}
    </div>
  );
}

const SQL_CREATE_TABLE = `create table if not exists sabs_orders (
  id                  uuid default gen_random_uuid() primary key,
  sabs_order_id       text not null,
  shiprocket_order_id text,
  shipment_id         text,
  awb                 text,
  courier_name        text,
  estimated_delivery  text,
  customer_name       text not null,
  customer_phone      text,
  product_name        text,
  product_price       numeric,
  delivery_address    text,
  delivery_pincode    text,
  delivery_city       text,
  delivery_state      text,
  status              text default 'new',
  source              text default 'whatsapp',
  manifest_url        text,
  label_url           text,
  created_at          timestamptz default now(),
  updated_at          timestamptz
);`;
