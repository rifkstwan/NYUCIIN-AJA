"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth-client";
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, Star, Printer, Camera } from "lucide-react";

const statusSteps = ["BOOKED", "PICKUP", "PROCESSING", "DELIVERY", "DONE"];

const statusConfig: Record<string, { label: string }> = {
  BOOKED:     { label: "Order Diterima"       },
  CONFIRMED:  { label: "Dikonfirmasi"         },
  PICKUP:     { label: "Sedang Dijemput"      },
  PROCESSING: { label: "Sedang Diproses"      },
  DELIVERY:   { label: "Sedang Dikirim"       },
  DONE:       { label: "Selesai"              },
  CANCELLED:  { label: "Dibatalkan"           },
  WASHING:    { label: "Sedang Dicuci"        },
  DRYING:     { label: "Sedang Dikeringkan"   },
};

const stageOrder = ["BOOKED", "PICKUP", "WASHING", "DRYING", "DELIVERY", "DONE"];

export default function OrderDetailPage() {
  const { id }       = useParams();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos]   = useState<any[]>([]);

  const fetchOrder = async (token: string) => {
    try {
      const res  = await fetch(`/api/orders/${id}`, {
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
    } catch {}
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }

    fetchOrder(token);
    fetchPhotos(token);

    if (searchParams.get("paid") === "1") {
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const res  = await fetch(`/api/orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          const o    = data.order ?? data;
          if (o?.payment?.status === "PAID" || attempts >= 10) {
            setOrder(o);
            clearInterval(interval);
            router.replace(`/dashboard/orders/${id}`);
          }
        } catch {
          clearInterval(interval);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  // ── Print nota saja (tanpa URL/timestamp browser) ──
  const handlePrintNota = () => {
    const content = document.getElementById("nota-cetak")?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=480,height=680");
    win?.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nota ${order?.orderNumber ?? ""}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              padding: 28px 24px;
              font-size: 13px;
              color: #0f172a;
              max-width: 400px;
              margin: 0 auto;
            }
            .nota-header {
              background: #16a34a;
              border-radius: 12px;
              padding: 18px 20px;
              color: #fff;
              text-align: center;
              margin-bottom: 20px;
            }
            .nota-header svg { margin: 0 auto 8px; display: block; }
            .nota-header .title { font-size: 16px; font-weight: 800; }
            .nota-header .sub   { font-size: 12px; opacity: 0.8; margin-top: 4px; }
            .nota-row {
              display: flex;
              justify-content: space-between;
              padding: 9px 0;
              border-bottom: 1px solid #f1f5f9;
              font-size: 13px;
            }
            .nota-row .label { color: #64748b; }
            .nota-row .value { font-weight: 500; color: #0f172a; }
            .nota-row .value.total { font-weight: 700; color: #16a34a; font-size: 14px; }
            .nota-footer {
              margin-top: 20px;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
            }
            @media print {
              @page { margin: 12mm; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win?.document.close();
    win?.focus();
    setTimeout(() => win?.print(), 300);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #16a34a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!order) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
      Order tidak ditemukan
    </div>
  );

  const currentStep = statusSteps.indexOf(order.status);
  const s           = statusConfig[order.status] ?? { label: order.status };

  const photosByStage: Record<string, any[]> = {};
  photos.forEach(p => {
    if (!photosByStage[p.type]) photosByStage[p.type] = [];
    photosByStage[p.type].push(p);
  });
  const stagesWithPhotos = stageOrder.filter(st => photosByStage[st]?.length > 0);

  return (
    <div style={{ width: "100%" }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print { body * { visibility: hidden; } }
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
      `}</style>

      {/* Kembali */}
      <Link href="/dashboard/riwayat" style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", textDecoration: "none", fontSize: 13, marginBottom: 24 }}>
        <ArrowLeft style={{ width: 16, height: 16 }} />
        Kembali ke Riwayat Order
      </Link>

      {/* Banner status */}
      <div style={{
        background: order.status === "CANCELLED" ? "#ef4444" : "#16a34a",
        color: "#fff", borderRadius: 16, padding: "24px 22px", marginBottom: 24, textAlign: "center",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.75, marginBottom: 4 }}>
          Status Order
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{s.label}</div>
        <div style={{ fontSize: 13, opacity: 0.82 }}>{order.orderNumber}</div>
      </div>

      {/* Indikator polling */}
      {searchParams.get("paid") === "1" && order.payment?.status !== "PAID" && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#166534" }}>
          <div style={{ width: 16, height: 16, border: "2px solid #16a34a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
          Memverifikasi pembayaran, harap tunggu...
        </div>
      )}

      {/* ===== GRID 2 KOLOM ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, alignItems: "start" }}>

        {/* ── KOLOM KIRI ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Tracking */}
          {order.status !== "CANCELLED" && (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 16, fontSize: 14 }}>Tracking Order</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {statusSteps.map((step, i) => {
                  const done   = i <= currentStep;
                  const active = i === currentStep;
                  const cfg    = statusConfig[step];
                  return (
                    <div key={step} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, flexShrink: 0,
                        background: done ? "#16a34a" : "#f1f5f9",
                        color: done ? "#fff" : "#94a3b8",
                        outline: active ? "4px solid #dcfce7" : "none",
                      }}>
                        {done ? <CheckCircle style={{ width: 16, height: 16 }} /> : i + 1}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: active ? 700 : done ? 500 : 400, color: active ? "#0f172a" : done ? "#475569" : "#94a3b8" }}>
                        {cfg.label}
                      </span>
                      {active && (
                        <span style={{ fontSize: 11, background: "#dcfce7", color: "#16a34a", padding: "2px 10px", borderRadius: 999, fontWeight: 600 }}>
                          Saat ini
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Riwayat status */}
          {order.tracking && order.tracking.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 16, fontSize: 14 }}>Riwayat Status</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[...order.tracking].reverse().map((track: any) => {
                  const cfg = statusConfig[track.status] ?? { label: track.status };
                  return (
                    <div key={track.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#86efac", marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{cfg.label}</span>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            {new Date(track.createdAt).toLocaleString("id-ID", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {track.note && <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{track.note}</p>}
                        {track.updatedBy && <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>oleh {track.updatedBy}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kondisi Sepatu */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Camera style={{ width: 18, height: 18, color: "#16a34a" }} />
              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>Kondisi Sepatu</div>
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
              Foto kondisi sepatu diunggah oleh admin di setiap tahapan proses
            </p>

            {stagesWithPhotos.length === 0 ? (
              <div style={{
                background: "#f8fafc", border: "1.5px dashed #e2e8f0", borderRadius: 12,
                padding: "32px 16px", textAlign: "center",
              }}>
                <Camera style={{ width: 28, height: 28, color: "#cbd5e1", margin: "0 auto 8px" }} />
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Belum ada foto dari admin</p>
                <p style={{ fontSize: 11, color: "#cbd5e1", margin: "4px 0 0" }}>
                  Foto akan muncul setelah admin menguploadnya
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {stagesWithPhotos.map(stage => (
                  <div key={stage}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        background: "#f0fdf4", color: "#16a34a",
                        border: "1px solid #bbf7d0", borderRadius: 999,
                        padding: "3px 12px", fontSize: 11, fontWeight: 700,
                      }}>
                        <CheckCircle style={{ width: 11, height: 11 }} />
                        {statusConfig[stage]?.label ?? stage}
                      </span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {photosByStage[stage].length} foto
                      </span>
                    </div>
                    <div className="photo-grid">
                      {photosByStage[stage].map((p: any) => (
                        <a key={p.id} href={p.photoUrl} target="_blank" rel="noopener noreferrer"
                          style={{ display: "block", borderRadius: 10, overflow: "hidden", border: "1px solid #f1f5f9", aspectRatio: "1", background: "#f8fafc" }}>
                          <img
                            src={p.photoUrl}
                            alt={`Foto ${statusConfig[stage]?.label ?? stage}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── KOLOM KANAN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Detail order */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 16, fontSize: 14 }}>Detail Order</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {order.shoeType ? (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#64748b" }}>{order.shoeType.name} x {order.quantity} pasang</span>
                  <span style={{ fontWeight: 600 }}>Rp {(order.shoeType.basePrice * order.quantity).toLocaleString("id-ID")}</span>
                </div>
              ) : order.items?.map((item: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#64748b" }}>{item.serviceName} x {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                </div>
              ))}
              {order.surcharge > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b" }}>
                  <span>Biaya tambahan</span>
                  <span>Rp {order.surcharge.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: "#16a34a" }}>
                  Rp {order.totalPrice?.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Informasi */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 16, fontSize: 14 }}>Informasi</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#475569" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <MapPin style={{ width: 16, height: 16, color: "#16a34a", flexShrink: 0, marginTop: 1 }} />
                <span>{order.pickupAddress || "-"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Clock style={{ width: 16, height: 16, color: "#16a34a", flexShrink: 0 }} />
                <span>Dibuat: {new Date(order.createdAt).toLocaleDateString("id-ID", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}</span>
              </div>
              {order.notes && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Package style={{ width: 16, height: 16, color: "#16a34a", flexShrink: 0, marginTop: 1 }} />
                  <span>Catatan: {order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* ===== NOTA PEMBAYARAN ===== */}
          {order.payment?.status === "PAID" && (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
              {/* Konten nota — id ini yang di-print */}
              <div id="nota-cetak">
                <div className="nota-header" style={{
                  background: "#16a34a", borderRadius: 12, padding: "16px 20px",
                  color: "#fff", marginBottom: 20, textAlign: "center",
                }}>
                  <CheckCircle style={{ width: 28, height: 28, margin: "0 auto 8px", display: "block" }} />
                  <div className="title" style={{ fontSize: 16, fontWeight: 800 }}>Pembayaran Berhasil</div>
                  <div className="sub" style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                    Terima kasih sudah mempercayai Nyuciin Aja!
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {[
                    { label: "No. Order",     value: order.orderNumber },
                    { label: "Layanan",       value: order.shoeType?.name ?? order.items?.[0]?.serviceName ?? "-" },
                    { label: "Jumlah",        value: `${order.quantity} pasang` },
                    { label: "Tanggal",       value: new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) },
                    { label: "Total Dibayar", value: `Rp ${order.totalPrice?.toLocaleString("id-ID")}`, bold: true },
                  ].map(row => (
                    <div key={row.label} className="nota-row" style={{
                      display: "flex", justifyContent: "space-between",
                      fontSize: 13, borderBottom: "1px solid #f1f5f9", padding: "9px 0",
                    }}>
                      <span style={{ color: "#64748b" }}>{row.label}</span>
                      <span style={{ fontWeight: row.bold ? 700 : 500, color: row.bold ? "#16a34a" : "#0f172a" }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
                  Nyuciin Aja — Laundry Sepatu Online
                </div>
              </div>

              {/* Tombol print */}
              <button
                onClick={handlePrintNota}
                style={{
                  marginTop: 16, width: "100%",
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  borderRadius: 10, padding: "10px 0", fontSize: 13,
                  fontWeight: 600, color: "#475569", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <Printer style={{ width: 15, height: 15 }} />
                Cetak / Simpan Nota
              </button>
            </div>
          )}

          {order.payment?.status === "PENDING" && (
            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 16, padding: "16px 20px", fontSize: 13, color: "#92400e" }}>
              Menunggu pembayaran...
            </div>
          )}

          {/* Beri review */}
          {order.status === "DONE" && (
            <Link
              href={`/dashboard/orders/${id}/review`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "#fefce8", border: "1.5px solid #fde047", borderRadius: 14,
                padding: "14px 20px", color: "#854d0e", fontWeight: 700, fontSize: 14,
                textDecoration: "none",
              }}
            >
              <Star style={{ width: 18, height: 18, fill: "#facc15", color: "#facc15" }} />
              Bagaimana pengalaman kamu? Berikan review!
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}