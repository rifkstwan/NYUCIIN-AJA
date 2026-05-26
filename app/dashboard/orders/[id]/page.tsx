"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth-client";
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, Star, Printer } from "lucide-react";

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
  const { id }         = useParams();
  const router         = useRouter();
  const searchParams   = useSearchParams();
  const [order, setOrder]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos]  = useState<any[]>([]);

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
    } catch {
      // foto tidak wajib ada
    }
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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!order) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      Order tidak ditemukan
    </div>
  );

  const currentStep  = statusSteps.indexOf(order.status);
  const s            = statusConfig[order.status] ?? { label: order.status };
  const beforePhotos = photos.filter(p => p.type === "before");
  const afterPhotos  = photos.filter(p => p.type === "after");

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          aside, nav, button, a[href] { display: none !important; }
          #nota-cetak { border: none !important; box-shadow: none !important; }
        }
      `}</style>

      {/* Kembali */}
      <Link href="/dashboard/riwayat" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 13, marginBottom: 24 }}>
        <ArrowLeft style={{ width: 16, height: 16 }} />
        Kembali ke Riwayat Order
      </Link>

      {/* Banner status */}
      <div style={{
        background: order.status === 'CANCELLED' ? '#ef4444' : '#16a34a',
        color: '#fff',
        borderRadius: 16,
        padding: '20px 22px',
        marginBottom: 24,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.75, marginBottom: 4 }}>
          Status Order
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{s.label}</div>
        <div style={{ fontSize: 13, opacity: 0.82 }}>{order.orderNumber}</div>
      </div>

      {/* Indikator polling */}
      {searchParams.get("paid") === "1" && order.payment?.status !== "PAID" && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#166534' }}>
          <div style={{ width: 16, height: 16, border: '2px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
          Memverifikasi pembayaran, harap tunggu...
        </div>
      )}

      {/* Progress tracking */}
      {order.status !== 'CANCELLED' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 16, fontSize: 14 }}>Tracking Order</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {statusSteps.map((step, i) => {
              const done   = i <= currentStep;
              const active = i === currentStep;
              const cfg    = statusConfig[step];
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                    background: done ? '#16a34a' : '#f1f5f9',
                    color: done ? '#fff' : '#94a3b8',
                    outline: active ? '4px solid #dcfce7' : 'none',
                  }}>
                    {done ? <CheckCircle style={{ width: 16, height: 16 }} /> : i + 1}
                  </div>
                  <span style={{
                    fontSize: 13,
                    fontWeight: active ? 700 : done ? 500 : 400,
                    color: active ? '#0f172a' : done ? '#475569' : '#94a3b8',
                  }}>
                    {cfg.label}
                  </span>
                  {active && (
                    <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 10px', borderRadius: 999, fontWeight: 600 }}>
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
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 16, fontSize: 14 }}>Riwayat Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...order.tracking].reverse().map((track: any) => {
              const cfg = statusConfig[track.status] ?? { label: track.status };
              return (
                <div key={track.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#86efac', marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{cfg.label}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        {new Date(track.createdAt).toLocaleString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {track.note && <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{track.note}</p>}
                    {track.updatedBy && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>oleh {track.updatedBy}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail order */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 16, fontSize: 14 }}>Detail Order</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {order.shoeType ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>{order.shoeType.name} x {order.quantity} pasang</span>
              <span style={{ fontWeight: 600 }}>Rp {(order.shoeType.basePrice * order.quantity).toLocaleString('id-ID')}</span>
            </div>
          ) : order.items?.map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>{item.serviceName} x {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </div>
          ))}
          {order.surcharge > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
              <span>Biaya tambahan</span>
              <span>Rp {order.surcharge.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#16a34a' }}>
              Rp {order.totalPrice?.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Informasi */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 16, fontSize: 14 }}>Informasi</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <MapPin style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0, marginTop: 1 }} />
            <span>{order.pickupAddress || '-'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0 }} />
            <span>Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}</span>
          </div>
          {order.notes && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Package style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0, marginTop: 1 }} />
              <span>Catatan: {order.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Foto sebelum/sesudah */}
      {photos.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 16, fontSize: 14 }}>Foto Sepatu</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {(['before', 'after'] as const).map(type => {
              const list = type === 'before' ? beforePhotos : afterPhotos;
              return (
                <div key={type}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#94a3b8', marginBottom: 8 }}>
                    {type === 'before' ? 'Sebelum' : 'Sesudah'}
                  </div>
                  {list.length > 0 ? list.map(p => (
                    <img key={p.id} src={p.photoUrl} alt={type}
                      style={{ width: '100%', borderRadius: 12, objectFit: 'cover', aspectRatio: '1', border: '1px solid #f1f5f9', marginBottom: 8 }} />
                  )) : (
                    <div style={{ aspectRatio: '1', borderRadius: 12, background: '#f8fafc', border: '1.5px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#cbd5e1' }}>
                      Belum ada foto
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pembayaran */}
      {order.payment ? (
        order.payment.status === 'PAID' ? (
          <div id="nota-cetak" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <div style={{ background: '#16a34a', borderRadius: 12, padding: '16px 20px', color: '#fff', marginBottom: 20, textAlign: 'center' }}>
              <CheckCircle style={{ width: 28, height: 28, margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontSize: 16, fontWeight: 800 }}>Pembayaran Berhasil</div>
              <div style={{ fontSize: 12, opacity: 0.82, marginTop: 2 }}>Terima kasih sudah mempercayai Nyuciin Aja!</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>No. Order</span>
                <span style={{ fontWeight: 700 }}>{order.orderNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Layanan</span>
                <span style={{ fontWeight: 600 }}>{order.shoeType?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Jumlah</span>
                <span style={{ fontWeight: 600 }}>{order.quantity} pasang</span>
              </div>
              {order.payment.paymentMethod && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Metode</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{order.payment.paymentMethod}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tanggal</span>
                <span style={{ fontWeight: 600 }}>
                  {new Date(order.payment.updatedAt ?? order.payment.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Total Dibayar</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: '#16a34a' }}>
                  Rp {(order.payment.amount ?? order.totalPrice)?.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              style={{
                width: '100%', marginTop: 20,
                background: '#f8fafc', border: '1.5px solid #e2e8f0',
                borderRadius: 10, padding: '11px 0',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                color: '#475569', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
              }}
            >
              <Printer style={{ width: 16, height: 16 }} />
              Cetak / Simpan Nota
            </button>
          </div>
        ) : (
          <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#92400e' }}>
            <Clock style={{ width: 16, height: 16 }} />
            Menunggu Pembayaran
            <Link href={`/dashboard/orders/${order.id}/payment`}
              style={{ marginLeft: 8, background: '#16a34a', color: '#fff', borderRadius: 8, padding: '4px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
              Bayar
            </Link>
          </div>
        )
      ) : order.status === 'BOOKED' ? (
        <div style={{ marginBottom: 20 }}>
          <Link href={`/dashboard/orders/${order.id}/payment`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '14px 0', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            Bayar Sekarang
          </Link>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
            Selesaikan pembayaran untuk memproses order kamu
          </p>
        </div>
      ) : null}

      {/* Tombol review */}
      {order.status === 'DONE' && !order.review && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 600, marginBottom: 12 }}>
            Bagaimana pengalaman kamu? Berikan review!
          </p>
          <Link href={`/dashboard/orders/${id}/review`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            <Star style={{ width: 14, height: 14 }} />
            Beri Review
          </Link>
        </div>
      )}

      {/* Review */}
      {order.review && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 12, fontSize: 14 }}>Review Kamu</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {[1,2,3,4,5].map(n => (
              <Star key={n} style={{ width: 20, height: 20, color: n <= order.review.rating ? '#fbbf24' : '#e2e8f0', fill: n <= order.review.rating ? '#fbbf24' : '#e2e8f0' }} />
            ))}
          </div>
          {order.review.comment && (
            <p style={{ fontSize: 13, color: '#475569', fontStyle: 'italic' }}>"{order.review.comment}"</p>
          )}
        </div>
      )}

    </div>
  );
}