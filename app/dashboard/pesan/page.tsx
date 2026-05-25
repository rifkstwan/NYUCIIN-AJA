"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth-client";

interface ShoeType {
  id: string;
  name: string;
  basePrice: number;
  description?: string;
}

const LAYANAN_INFO: Record<string, { features: string[]; badge?: string }> = {
  "Fast Cleaning": {
    features: [
      "Cuci bagian upper",
      "Sikat midsole",
      "Estimasi selesai cepat",
      "Antar-jemput tersedia",
    ],
  },
  "Deep Cleaning": {
    badge: "Terpopuler",
    features: [
      "Cuci upper & insole",
      "Sikat outsole & midsole",
      "Anti-jamur dan anti-bakteri",
      "Foto before dan after",
    ],
  },
  "Unyellowing": {
    features: [
      "Hilangkan yellowing midsole",
      "Tanpa repaint",
      "Treatment khusus anti-kuning",
      "Garansi hasil bersih",
    ],
  },
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "var(--font-body)",
  outline: "none",
  color: "#0f172a",
  background: "#fff",
  boxSizing: "border-box" as const,
  transition: "border-color 0.15s",
};

const labelStyle = {
  fontSize: 12.5,
  fontWeight: 600,
  marginBottom: 7,
  display: "block",
  color: "#0f172a",
  textTransform: "uppercase" as const,
  letterSpacing: "0.3px",
};

export default function PesanPage() {
  const router = useRouter();
  const [shoeTypes, setShoeTypes] = useState<ShoeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    shoeTypeId: "",
    quantity: 1,
    notes: "",
    pickupAddress: "",
    deliveryAddress: "",
    scheduledAt: "",
  });

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    fetchShoeTypes(token);
  }, []);

  const fetchShoeTypes = async (token: string) => {
    try {
      const res = await fetch("/api/shoe-types", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setShoeTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedShoe = shoeTypes.find((s) => s.id === form.shoeTypeId);
  const totalPrice = selectedShoe ? selectedShoe.basePrice * form.quantity : 0;
  const selectedInfo = selectedShoe ? LAYANAN_INFO[selectedShoe.name] : null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "quantity" ? Number(value) : value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.shoeTypeId) {
      setError("Pilih jenis layanan terlebih dahulu.");
      return;
    }
    if (!form.pickupAddress) {
      setError("Alamat pickup wajib diisi.");
      return;
    }

    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shoeTypeId: form.shoeTypeId,
          quantity: form.quantity,
          notes: form.notes || undefined,
          pickupAddress: form.pickupAddress,
          deliveryAddress: form.deliveryAddress || undefined,
          scheduledAt: form.scheduledAt
            ? new Date(form.scheduledAt).toISOString()
            : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal membuat order, coba lagi.");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Terjadi kesalahan. Periksa koneksi internet kamu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 800,
          color: "#0f172a", marginBottom: 4,
          fontFamily: "var(--font-display)",
        }}>
          Order Baru
        </h1>
        <p style={{ fontSize: 14, color: "#64748b" }}>
          Pilih paket layanan dan isi detail pengiriman
        </p>
      </div>

      {/* Pilih Paket */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {shoeTypes.map((s) => {
          const info = LAYANAN_INFO[s.name];
          const active = form.shoeTypeId === s.id;
          return (
            <div
              key={s.id}
              onClick={() => { setForm({ ...form, shoeTypeId: s.id }); setError(""); }}
              style={{
                background: "#fff",
                border: `2px solid ${active ? "#16a34a" : "#e2e8f0"}`,
                borderRadius: 14, padding: 20,
                cursor: "pointer",
                transition: "all 0.15s",
                position: "relative",
                boxShadow: active ? "0 0 0 3px rgba(22,163,74,0.1)" : "none",
              }}
            >
              {info?.badge && (
                <div style={{
                  position: "absolute", top: -10, left: 16,
                  background: "#16a34a", color: "#fff",
                  fontSize: 11, fontWeight: 700,
                  padding: "2px 10px", borderRadius: 99,
                }}>
                  {info.badge}
                </div>
              )}
              {active && (
                <div style={{
                  position: "absolute", top: 12, right: 12,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#16a34a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="11" height="11" fill="none" stroke="#fff" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>
                {s.name}
              </div>
              <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.5, marginBottom: 12 }}>
                {s.description}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
                {info?.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#475569" }}>
                    <svg width="13" height="13" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#16a34a" }}>
                Rp {s.basePrice.toLocaleString("id-ID")}
                <span style={{ fontWeight: 400, fontSize: 12, color: "#94a3b8" }}> / pasang</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 16, padding: 28,
          }}>
            {error && (
              <div style={{
                background: "#fee2e2", border: "1px solid #fecaca",
                borderRadius: 8, padding: "10px 14px",
                fontSize: 13, color: "#dc2626", marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            {/* Jumlah */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Jumlah Pasang</label>
              <input
                type="number"
                name="quantity"
                min={1}
                max={10}
                value={form.quantity}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {/* Alamat Pickup */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Alamat Pickup</label>
              <input
                type="text"
                name="pickupAddress"
                placeholder="Jl. Contoh No. 12, Semarang"
                value={form.pickupAddress}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {/* Alamat Pengiriman */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                Alamat Pengiriman{" "}
                <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none" }}>
                  (opsional, kosongkan jika sama)
                </span>
              </label>
              <input
                type="text"
                name="deliveryAddress"
                placeholder="Sama dengan alamat pickup"
                value={form.deliveryAddress}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {/* Jadwal Pickup */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                Jadwal Pickup{" "}
                <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none" }}>
                  (opsional)
                </span>
              </label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={form.scheduledAt}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {/* Catatan */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>
                Catatan{" "}
                <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none" }}>
                  (opsional)
                </span>
              </label>
              <textarea
                name="notes"
                placeholder="Contoh: Sepatu putih ada noda di bagian kiri"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px",
                borderRadius: 9, fontSize: 14.5, fontWeight: 600,
                background: loading ? "#86efac" : "#16a34a",
                color: "#fff", border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
                transition: "background 0.15s",
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid #fff", borderTopColor: "transparent",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }} />
                  Memproses...
                </>
              ) : "Buat Order Sekarang"}
            </button>
          </div>
        </form>

        {/* RINGKASAN */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 16, padding: 24,
          position: "sticky", top: 24,
        }}>
          <h3 style={{
            fontSize: 13, fontWeight: 700,
            color: "#0f172a", marginBottom: 16,
            textTransform: "uppercase", letterSpacing: "0.3px",
          }}>
            Ringkasan Order
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
              <span style={{ color: "#64748b" }}>Layanan</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>
                {selectedShoe?.name || "-"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
              <span style={{ color: "#64748b" }}>Harga satuan</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>
                {selectedShoe ? `Rp ${selectedShoe.basePrice.toLocaleString("id-ID")}` : "-"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
              <span style={{ color: "#64748b" }}>Jumlah</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>{form.quantity} pasang</span>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12, marginTop: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: "#16a34a" }}>
                  {totalPrice > 0 ? `Rp ${totalPrice.toLocaleString("id-ID")}` : "-"}
                </span>
              </div>
            </div>
          </div>

          {selectedInfo && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                Yang Didapat
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selectedInfo.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#475569" }}>
                    <svg width="13" height="13" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{
            marginTop: 16, padding: "12px 14px",
            background: "#f0fdf4", borderRadius: 8,
            fontSize: 12.5, color: "#16a34a", lineHeight: 1.6,
          }}>
            Pembayaran dilakukan setelah sepatu selesai dicuci dan siap dikirim.
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}