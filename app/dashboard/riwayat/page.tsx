"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth-client";
import { Package, Printer, CreditCard } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  quantity: number;
  createdAt: string;
  shoeType: { name: string };
  payment?: {
    status: string;
    paymentMethod?: string;
    amount?: number;
    paidAt?: string;
    updatedAt?: string;
    createdAt?: string;
  } | null;
};

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  BOOKED:     { label: "Dipesan",     bg: "#dbeafe", color: "#1e40af" },
  PICKUP:     { label: "Dijemput",    bg: "#ede9fe", color: "#6d28d9" },
  PROCESSING: { label: "Diproses",    bg: "#ffedd5", color: "#c2410c" },
  DELIVERY:   { label: "Diantar",     bg: "#cffafe", color: "#0e7490" },
  DONE:       { label: "Selesai",     bg: "#dcfce7", color: "#166534" },
  CANCELLED:  { label: "Dibatalkan",  bg: "#fee2e2", color: "#991b1b" },
};

const paymentConfig: Record<string, { label: string; bg: string; color: string }> = {
  PENDING: { label: "Belum Dibayar", bg: "#fef9c3", color: "#854d0e" },
  PAID:    { label: "Lunas",         bg: "#dcfce7", color: "#166534" },
  FAILED:  { label: "Gagal",         bg: "#fee2e2", color: "#991b1b" },
};

export default function RiwayatPage() {
  const router = useRouter();
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notaOpen, setNotaOpen] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => setOrders(data.orders ?? data))
      .finally(() => setLoading(false));
  }, []);

  const selectedOrder = orders.find(o => o.id === notaOpen);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Riwayat Order</h1>
        <p style={{ color: "#64748b", fontSize: 14 }}>Semua pesanan kamu</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 64, textAlign: "center", color: "#94a3b8" }}>
            <div style={{
              width: 32, height: 32, border: "2px solid #16a34a",
              borderTopColor: "transparent", borderRadius: "50%",
              animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
            }} />
            Memuat data...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: 64, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            Belum ada order
          </div>
        ) : (
          orders.map((order, i) => {
            const s         = statusConfig[order.status] ?? { label: order.status, bg: "#f1f5f9", color: "#475569" };
            const p         = order.payment ? (paymentConfig[order.payment.status] ?? { label: order.payment.status, bg: "#f1f5f9", color: "#475569" }) : null;
            const isPaid    = order.payment?.status === "PAID";
            const isPending = order.payment?.status === "PENDING";

            return (
              <div key={order.id} style={{ borderTop: i === 0 ? "none" : "1px solid #f1f5f9" }}>
                <div
                  onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: (isPending || isPaid) ? "16px 24px 8px" : "16px 24px",
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ background: "#dcfce7", padding: 10, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Package style={{ width: 16, height: 16, color: "#16a34a" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>{order.orderNumber}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        {order.shoeType?.name} x {order.quantity}
                      </div>
                      <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 1 }}>
                        {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>
                      Rp {order.totalPrice?.toLocaleString("id-ID")}
                    </span>
                    {p && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: p.bg, color: p.color, whiteSpace: "nowrap" }}>
                        {p.label}
                      </span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
                      {s.label}
                    </span>
                  </div>
                </div>

                {(isPending || isPaid) && (
                  <div style={{ padding: "0 24px 16px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    {isPaid && (
                      <button
                        onClick={e => { e.stopPropagation(); setNotaOpen(order.id); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          background: "#f8fafc", border: "1.5px solid #e2e8f0",
                          color: "#475569", borderRadius: 8,
                          padding: "7px 16px", fontSize: 12,
                          fontWeight: 600, cursor: "pointer",
                        }}
                      >
                        <Printer style={{ width: 13, height: 13 }} />
                        Lihat Nota
                      </button>
                    )}
                    {isPending && (
                      <button
                        onClick={e => { e.stopPropagation(); router.push(`/dashboard/orders/${order.id}/payment`); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          background: "#16a34a", color: "#fff",
                          border: "none", borderRadius: 8,
                          padding: "7px 16px", fontSize: 12,
                          fontWeight: 600, cursor: "pointer",
                        }}
                      >
                        <CreditCard style={{ width: 13, height: 13 }} />
                        Bayar Sekarang
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nota Struk */}
      {notaOpen && selectedOrder && (
        <div
          onClick={() => setNotaOpen(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: 16,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 360 }}>

            {/* Struk */}
            <div
              id="nota-print"
              style={{
                background: "#fff",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
                fontFamily: "'Courier New', Courier, monospace",
              }}
            >
              {/* Header */}
              <div style={{ background: "#16a34a", padding: "24px 24px 20px", textAlign: "center", color: "#fff" }}>
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1, marginBottom: 2 }}>NyuciinAja</div>
                <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: 0.5 }}>Laundry Sepatu Online</div>
                <div style={{ fontSize: 10, opacity: 0.65, marginTop: 2 }}>nyuciinaja.com</div>
              </div>

              {/* Label bukti */}
              <div style={{ background: "#f0fdf4", borderBottom: "1px dashed #86efac", padding: "10px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#16a34a", textTransform: "uppercase" }}>
                  Bukti Pembayaran
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "20px 24px" }}>

                {/* No order & tanggal */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 16 }}>
                  <span>{selectedOrder.orderNumber}</span>
                  <span>
                    {new Date(
                      selectedOrder.payment?.paidAt ??
                      selectedOrder.payment?.updatedAt ??
                      selectedOrder.createdAt
                    ).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>

                <div style={{ borderTop: "1px dashed #e2e8f0", marginBottom: 16 }} />

                {/* Item */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: "#0f172a", fontWeight: 600 }}>{selectedOrder.shoeType?.name}</span>
                    <span style={{ color: "#0f172a" }}>
                      Rp {selectedOrder.totalPrice?.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {selectedOrder.quantity} pasang x Rp {Math.round(selectedOrder.totalPrice / selectedOrder.quantity).toLocaleString("id-ID")}
                  </div>
                </div>

                <div style={{ borderTop: "1px dashed #e2e8f0", marginBottom: 16 }} />

                {/* Subtotal */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
                    <span>Subtotal</span>
                    <span>Rp {selectedOrder.totalPrice?.toLocaleString("id-ID")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
                    <span>Biaya layanan</span>
                    <span>Rp 0</span>
                  </div>
                </div>

                <div style={{ borderTop: "2px solid #0f172a", marginBottom: 12 }} />

                {/* Total */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>TOTAL</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#16a34a" }}>
                    Rp {(selectedOrder.payment?.amount ?? selectedOrder.totalPrice)?.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Metode */}
                {selectedOrder.payment?.paymentMethod && (
                  <div style={{
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    borderRadius: 8, padding: "8px 12px",
                    display: "flex", justifyContent: "space-between",
                    fontSize: 12, marginBottom: 16,
                  }}>
                    <span style={{ color: "#64748b" }}>Metode Bayar</span>
                    <span style={{ fontWeight: 700, color: "#166534", textTransform: "capitalize" }}>
                      {selectedOrder.payment.paymentMethod}
                    </span>
                  </div>
                )}

                {/* Badge lunas */}
                <div style={{
                  background: "#16a34a", borderRadius: 8, padding: "10px",
                  textAlign: "center", color: "#fff", fontSize: 13, fontWeight: 700,
                  letterSpacing: 2, marginBottom: 16, textTransform: "uppercase",
                }}>
                  LUNAS
                </div>

                <div style={{ borderTop: "1px dashed #e2e8f0", marginBottom: 14 }} />

                {/* Footer struk */}
                <div style={{ textAlign: "center", fontSize: 10, color: "#94a3b8", lineHeight: 1.8 }}>
                  <div>Terima kasih telah mempercayakan</div>
                  <div>perawatan sepatu kamu kepada kami!</div>
                  <div style={{ marginTop: 6, color: "#cbd5e1" }}>- NyuciinAja -</div>
                </div>
              </div>
            </div>

            {/* Tombol aksi */}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1, background: "#16a34a", color: "#fff",
                  border: "none", borderRadius: 10, padding: "13px 0",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <Printer style={{ width: 16, height: 16 }} />
                Cetak Nota
              </button>
              <button
                onClick={() => setNotaOpen(null)}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.15)", color: "#fff",
                  border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "13px 0",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          body * { visibility: hidden; }
          #nota-print, #nota-print * { visibility: visible; }
          #nota-print {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 360px;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}