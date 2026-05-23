"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth-client";
import { ArrowLeft, Loader2, MapPin, Clock, Package, Phone, User } from "lucide-react";

const STATUS_FLOW = ["BOOKED", "PICKUP", "WASHING", "DRYING", "DELIVERY", "DONE"];

const statusConfig: Record<string, { label: string; color: string; emoji: string }> = {
  BOOKED:    { label: "Diterima",    color: "bg-blue-100 text-blue-700",    emoji: "📋" },
  PICKUP:    { label: "Pickup",      color: "bg-purple-100 text-purple-700", emoji: "🚗" },
  WASHING:   { label: "Dicuci",      color: "bg-orange-100 text-orange-700", emoji: "🧼" },
  DRYING:    { label: "Dikeringkan", color: "bg-yellow-100 text-yellow-700", emoji: "☀️" },
  DELIVERY:  { label: "Dikirim",     color: "bg-cyan-100 text-cyan-700",    emoji: "🚚" },
  DONE:      { label: "Selesai",     color: "bg-green-100 text-green-700",  emoji: "🎉" },
  CANCELLED: { label: "Dibatalkan",  color: "bg-red-100 text-red-700",      emoji: "❌" },
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    fetchOrder(token);
  }, []);

  const fetchOrder = async (token: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrder(data.order ?? data);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    setMessage("");
    try {
      const token = getToken();
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, note }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrder((prev: any) => ({ ...prev, status: newStatus }));
        setMessage("✅ Status berhasil diupdate!");
        setNote("");
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch {
      setMessage("❌ Gagal update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Order tidak ditemukan
    </div>
  );

  const s = statusConfig[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600", emoji: "📦" };
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentIndex + 1];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary-900 text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="font-bold">
            CuciSepatu<span className="text-primary-500">.id</span>
            <span className="bg-yellow-400 text-primary-900 text-xs font-bold px-2 py-0.5 rounded-full ml-2">ADMIN</span>
          </span>
          <div className="flex gap-6">
            <Link href="/admin/dashboard" className="text-sm text-blue-200 hover:text-white">Dashboard</Link>
            <Link href="/admin/orders" className="text-sm text-blue-200 hover:text-white">Orders</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/admin/orders" className="flex items-center gap-2 text-gray-400 hover:text-primary-600 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Orders
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left — Order Info */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-gradient-to-br from-primary-900 to-primary-600 text-white rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">{s.emoji}</div>
              <div className="text-lg font-bold">{s.label}</div>
              <div className="text-blue-200 text-sm mt-1">{order.orderNumber}</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-primary-900 mb-4">Detail Order</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Jenis Sepatu</span>
                  <span className="font-medium">{order.shoeType?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jumlah</span>
                  <span className="font-medium">{order.quantity} pasang</span>
                </div>
                {order.surcharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Biaya tambahan</span>
                    <span className="font-medium">Rp {order.surcharge?.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-3 font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">Rp {order.totalPrice?.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-primary-900 mb-4">Info Pelanggan</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <User className="w-4 h-4 text-primary-500" />
                  <span>{order.user?.name}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <span>{order.user?.phone}</span>
                </div>
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin className="w-4 h-4 text-primary-500 mt-0.5" />
                  <span>{order.pickupAddress || "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span>{new Date(order.createdAt).toLocaleDateString("id-ID", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric"
                  })}</span>
                </div>
                {order.notes && (
                  <div className="flex items-start gap-3 text-gray-600">
                    <Package className="w-4 h-4 text-primary-500 mt-0.5" />
                    <span>Catatan: {order.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — Update Status */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-primary-900 mb-4">Update Status</h3>

              {message && (
                <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${
                  message.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                }`}>
                  {message}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan (opsional)
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Sepatu sudah dijemput"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {nextStatus && order.status !== "CANCELLED" && (
                <button
                  onClick={() => updateStatus(nextStatus)}
                  disabled={updating}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-60 mb-3"
                >
                  {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {statusConfig[nextStatus]?.emoji} {statusConfig[nextStatus]?.label}
                </button>
              )}

              {!["DONE", "CANCELLED"].includes(order.status) && (
                <button
                  onClick={() => updateStatus("CANCELLED")}
                  disabled={updating}
                  className="w-full border-2 border-red-200 text-red-500 py-2.5 rounded-xl font-medium hover:bg-red-50 transition text-sm disabled:opacity-60"
                >
                  Batalkan Order
                </button>
              )}

              {order.status === "DONE" && (
                <div className="text-center text-green-600 font-medium text-sm py-2">
                  🎉 Order sudah selesai!
                </div>
              )}
              {order.status === "CANCELLED" && (
                <div className="text-center text-red-500 font-medium text-sm py-2">
                  Order dibatalkan
                </div>
              )}
            </div>

            {/* Status Flow */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-primary-900 mb-4">Alur Status</h3>
              <div className="space-y-2">
                {STATUS_FLOW.map((st, i) => {
                  const done = i <= currentIndex;
                  const active = st === order.status;
                  return (
                    <div key={st} className={`flex items-center gap-2 text-sm ${
                      active ? "font-bold text-primary-900" :
                      done ? "text-gray-500" : "text-gray-300"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        active ? "bg-primary-600" :
                        done ? "bg-green-400" : "bg-gray-200"
                      }`} />
                      {statusConfig[st]?.emoji} {statusConfig[st]?.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
