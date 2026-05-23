"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth-client";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";

declare global {
  interface Window { snap: any; }
}

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load Midtrans Snap script
    const script = document.createElement("script");
    script.src = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!);
    document.head.appendChild(script);

    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    fetchOrder(token);

    return () => { document.head.removeChild(script); };
  }, []);

  const fetchOrder = async (token: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const order = data.order ?? data;

      // Jika sudah bayar, redirect ke detail
      if (order.payment?.status === "PAID") {
        router.push(`/dashboard/orders/${id}`);
        return;
      }

      setOrder(order);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: id }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.message); setPaying(false); return; }

      // Buka Midtrans Snap popup
      window.snap.pay(data.snapToken, {
        onSuccess: () => {
          router.push(`/dashboard/orders/${id}?payment=success`);
        },
        onPending: () => {
          router.push(`/dashboard/orders/${id}?payment=pending`);
        },
        onError: () => {
          setError("Pembayaran gagal. Silakan coba lagi.");
          setPaying(false);
        },
        onClose: () => {
          setPaying(false);
        },
      });
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">

        <Link href={`/dashboard/orders/${id}`} className="flex items-center gap-2 text-gray-400 hover:text-primary-600 transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Detail Order
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-xl font-bold text-primary-900">Pembayaran</h1>
            <p className="text-gray-400 text-sm mt-1">{order?.orderNumber}</p>
          </div>

          {/* Ringkasan */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{order?.shoeType?.name} × {order?.quantity} pasang</span>
              <span>Rp {(order?.shoeType?.basePrice * order?.quantity).toLocaleString("id-ID")}</span>
            </div>
            {order?.surcharge > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Biaya tambahan</span>
                <span>Rp {order.surcharge.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-primary-900">
              <span>Total Pembayaran</span>
              <span>Rp {order?.totalPrice?.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4 text-center">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={paying}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {paying ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
            ) : (
              <><CreditCard className="w-4 h-4" /> Bayar Sekarang</>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Pembayaran aman diproses oleh Midtrans
          </p>
        </div>
      </div>
    </div>
  );
}