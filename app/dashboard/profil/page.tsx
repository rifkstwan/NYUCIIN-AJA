"use client";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth-client";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
};

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/user/me", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setForm({
          name: data.user?.name ?? "",
          phone: data.user?.phone ?? "",
          address: data.user?.address ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    await fetch("/api/user/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const field = (label: string, key: keyof typeof form, type = "text") => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      {key === "address" ? (
        <textarea
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          rows={3}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 8,
            border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a",
            resize: "vertical", outline: "none", boxSizing: "border-box",
          }}
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 8,
            border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a",
            outline: "none", boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
        Profil Saya
      </h1>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
        Kelola informasi akun kamu
      </p>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Memuat data...</p>
      ) : (
        <div style={{
          background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0",
          padding: 28, maxWidth: 480,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "#dcfce7", display: "flex", alignItems: "center",
            justifyContent: "center", marginBottom: 20,
          }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: "#16a34a" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                border: "1px solid #e2e8f0", fontSize: 14,
                background: "#f8fafc", color: "#94a3b8", boxSizing: "border-box",
              }}
            />
          </div>

          {field("Nama Lengkap", "name")}
          {field("Nomor HP", "phone", "tel")}
          {field("Alamat", "address")}

          {success && (
            <p style={{ color: "#16a34a", fontSize: 13, marginBottom: 12 }}>
              Profil berhasil disimpan
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: "#16a34a", color: "#fff",
              border: "none", borderRadius: 8,
              padding: "11px 24px", fontSize: 14, fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      )}
    </div>
  );
}