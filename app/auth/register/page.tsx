"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Tracking Real-time",
    desc: "Pantau status cuci sepatumu setiap saat melalui dashboard",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: "Bayar Mudah",
    desc: "GoPay, OVO, Virtual Account, dan metode lainnya via Midtrans",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
    title: "Loyalty Points",
    desc: "Kumpul poin setiap transaksi, tukarkan dengan diskon menarik",
  },
];

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

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.firstName || !form.email || !form.password) {
      setError("Nama depan, email, dan password wajib diisi.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Pendaftaran gagal, coba lagi.");
        return;
      }

      router.push("/auth/login?registered=1");
    } catch (err) {
      setError("Terjadi kesalahan. Periksa koneksi internet kamu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>

      {/* LEFT */}
      <div style={{
        background: "#16a34a",
        padding: 64,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: "#fff",
      }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 22,
          marginBottom: 44,
          letterSpacing: "-0.5px",
        }}>
          Nyuciin<span style={{ color: "#86efac" }}>Aja</span>
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: 40,
          fontWeight: 800,
          marginBottom: 14,
          letterSpacing: "-1px",
          lineHeight: 1.1,
        }}>
          Sepatu Bersih,<br />Hidup Lebih Keren
        </h1>

        <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.7, marginBottom: 44 }}>
          Bergabunglah dengan ribuan pelanggan yang sudah mempercayakan
          sepatu mereka kepada kami.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {features.map((f) => (
            <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 9,
                background: "rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, color: "#fff",
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 12.5, opacity: 0.78, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        overflowY: "auto",
      }}>
        <div style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 28,
          padding: 40,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)",
        }}>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: 24, fontWeight: 800,
            marginBottom: 5, letterSpacing: "-0.4px", color: "#0f172a",
          }}>
            Buat Akun Baru
          </h2>
          <p style={{ fontSize: 14, color: "#475569", marginBottom: 28 }}>
            Daftar dan dapatkan diskon 20% pesanan pertama
          </p>

          {/* Error */}
          {error && (
            <div style={{
              background: "#fee2e2", border: "1px solid #fecaca",
              borderRadius: 8, padding: "10px 14px",
              fontSize: 13, color: "#dc2626", marginBottom: 18,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Nama */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div>
                <label style={labelStyle}>Nama Depan</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Andi"
                  value={form.firstName}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
              <div>
                <label style={labelStyle}>Nama Belakang</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Rahmadan"
                  value={form.lastName}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="email@kamu.com"
                value={form.email}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {/* No HP */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>No. HP / WhatsApp</label>
              <input
                type="tel"
                name="phone"
                placeholder="08xxxxxxxxxx"
                value={form.phone}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 26 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={handleChange}
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    cursor: "pointer", color: "#94a3b8", padding: 0,
                  }}
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: 12, borderRadius: 9,
                fontSize: 14.5, fontWeight: 600,
                background: loading ? "#86efac" : "#16a34a",
                color: "#fff",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)",
                transition: "background 0.15s",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid #fff",
                    borderTopColor: "transparent",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }} />
                  Mendaftarkan...
                </>
              ) : "Daftar Sekarang"}
            </button>
          </form>

          <p style={{ marginTop: 14, fontSize: 12, color: "#94a3b8", textAlign: "center", lineHeight: 1.6 }}>
            Dengan mendaftar, kamu menyetujui{" "}
            <Link href="#" style={{ color: "#16a34a", fontWeight: 600 }}>Syarat & Ketentuan</Link>
            {" "}dan{" "}
            <Link href="#" style={{ color: "#16a34a", fontWeight: 600 }}>Kebijakan Privasi</Link>
          </p>

          <p style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "#475569" }}>
            Sudah punya akun?{" "}
            <Link href="/auth/login" style={{ color: "#16a34a", fontWeight: 600 }}>
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}