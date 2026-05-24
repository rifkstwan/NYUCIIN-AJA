"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth-client";
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, Star } from "lucide-react";

const statusSteps = ["BOOKED", "PICKUP", "PROCESSING", "DELIVERY", "DONE"];

const statusConfig: Record<string, { label: string }> = {
  BOOKED:     { label: "Order Diterima"  },
  CONFIRMED:  { label: "Dikonfirmasi"    },
  PICKUP:     { label: "Sedang Dijemput" },
  PROCESSING: { label: "Sedang Diproses" },
  DELIVERY:   { label: "Sedang Dikirim"  },
  DONE:       { label: "Selesai"         },
  CANCELLED:  { label: "Dibatalkan"      },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    fetchOrder(token);
    fetchPhotos(token);
  }, []);

  const fetchOrder = async (token: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrder(data.order ?? data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async (token: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/photos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPhotos(Array.isArray(data) ? data : []);
      }
    } catch {
      // foto tidak wajib ada
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

  const currentStep = statusSteps.indexOf(order.status);
  const s = statusConfig[order.status] ?? { label: order.status };
  const beforePhotos = photos.filter(p => p.type === "before");
  const afterPhotos = photos.filter(p => p.type === "after");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back */}
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-primary-600 transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>

        {/* Status Card */}
        <div className="bg-gradient-to-br from-primary-900 to-primary-600 text-white rounded-2xl p-6 mb-6 text-center">
          <div className="text-xl font-bold mb-1">{s.label}</div>
          <div className="text-blue-200 text-sm">{order.orderNumber}</div>
        </div>

        {/* Progress Bar */}
        {order.status !== "CANCELLED" && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-primary-900 mb-4">Tracking Order</h3>
            <div className="space-y-3">
              {statusSteps.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                const cfg = statusConfig[step];
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                      done ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400"
                    } ${active ? "ring-4 ring-primary-100" : ""}`}>
                      {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-sm ${
                      active ? "font-bold text-primary-900" :
                      done ? "text-gray-600" : "text-gray-400"
                    }`}>
                      {cfg.label}
                    </span>
                    {active && (
                      <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-medium">
                        Saat ini
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Riwayat Tracking */}
        {order.tracking && order.tracking.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="font-bold text-primary-900 mb-4">Riwayat Status</h3>
            <div className="space-y-4">
              {[...order.tracking].reverse().map((track: any) => {
                const cfg = statusConfig[track.status] ?? { label: track.status };
                return (
                  <div key={track.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary-900">
                          {cfg.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(track.createdAt).toLocaleString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {track.note && (
                        <p className="text-xs text-gray-500 mt-0.5">{track.note}</p>
                      )}
                      {track.updatedBy && (
                        <p className="text-xs text-gray-400 mt-0.5">oleh {track.updatedBy}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Detail */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-primary-900 mb-4">Detail Order</h3>
          <div className="space-y-3">
            {order.shoeType ? (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {order.shoeType.name} x {order.quantity} pasang
                </span>
                <span className="font-medium">
                  Rp {(order.shoeType.basePrice * order.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            ) : order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.serviceName} x {item.quantity}</span>
                <span className="font-medium">
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
            {order.surcharge > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Biaya tambahan</span>
                <span>Rp {order.surcharge.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary-600">
                Rp {order.totalPrice?.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-primary-900 mb-4">Informasi</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="w-4 h-4 text-primary-500 mt-0.5" />
              <span>{order.pickupAddress || "-"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>Dibuat: {new Date(order.createdAt).toLocaleDateString("id-ID", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
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

        {/* Foto Sepatu Before / After */}
        {photos.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="font-bold text-primary-900 mb-4">Foto Sepatu</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Sebelum</p>
                <div className="space-y-2">
                  {beforePhotos.length > 0
                    ? beforePhotos.map(p => (
                        <img
                          key={p.id}
                          src={p.photoUrl}
                          alt="before"
                          className="w-full rounded-xl object-cover aspect-square border border-gray-100"
                        />
                      ))
                    : <div className="aspect-square rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">Belum ada foto</div>
                  }
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Sesudah</p>
                <div className="space-y-2">
                  {afterPhotos.length > 0
                    ? afterPhotos.map(p => (
                        <img
                          key={p.id}
                          src={p.photoUrl}
                          alt="after"
                          className="w-full rounded-xl object-cover aspect-square border border-gray-100"
                        />
                      ))
                    : <div className="aspect-square rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">Belum ada foto</div>
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Pembayaran / Tombol Bayar */}
        {order.payment ? (
          <div className={`p-4 rounded-xl text-center text-sm font-medium mb-6 ${
            order.payment.status === "PAID"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
          }`}>
            <div className="flex items-center justify-center gap-2">
              {order.payment.status === "PAID"
                ? <CheckCircle className="w-4 h-4" />
                : <Clock className="w-4 h-4" />
              }
              {order.payment.status === "PAID" ? "Pembayaran Lunas" : "Menunggu Pembayaran"}
            </div>
            {order.payment.paymentMethod && (
              <div className="text-xs font-normal mt-1 opacity-75">
                via {order.payment.paymentMethod} • Rp {order.payment.amount?.toLocaleString("id-ID")}
              </div>
            )}
          </div>
        ) : order.status === "BOOKED" ? (
          <div className="mb-6">
            <Link
              href={`/dashboard/orders/${order.id}/payment`}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-sm"
            >
              Bayar Sekarang
            </Link>
            <p className="text-center text-xs text-gray-400 mt-2">
              Selesaikan pembayaran untuk memproses order kamu
            </p>
          </div>
        ) : null}

        {/* Tombol Review — hanya jika order DONE dan belum ada review */}
        {order.status === "DONE" && !order.review && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
            <p className="text-sm text-blue-700 font-medium mb-3">
              Bagaimana pengalaman kamu? Berikan review!
            </p>
            <Link
              href={`/dashboard/orders/${id}/review`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
            >
              <Star className="w-4 h-4" /> Beri Review
            </Link>
          </div>
        )}

        {/* Tampilkan review yang sudah ada */}
        {order.review && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-primary-900 mb-3">Review Kamu</h3>
            <div className="flex gap-1 mb-2">
              {[1,2,3,4,5].map(s => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${s <= order.review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            {order.review.comment && (
              <p className="text-sm text-gray-600 italic">"{order.review.comment}"</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}