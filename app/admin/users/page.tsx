"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth-client";
import { User } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  _count?: { orders: number };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (!token || user?.role !== "ADMIN") { router.push("/auth/login"); return; }
    fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setUsers(d.users ?? d))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Pelanggan</h1>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>{users.length} total pelanggan</p>
      </div>

      <div style={{
        background: "#fff", borderRadius: 16, padding: 16,
        border: "1px solid #e2e8f0", marginBottom: 20,
      }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama, email, atau nomor HP..."
          style={{
            width: "100%", padding: "10px 14px",
            border: "1px solid #e2e8f0", borderRadius: 10,
            fontSize: 13, outline: "none", boxSizing: "border-box",
          }}
        />
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
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            Tidak ada pelanggan ditemukan
          </div>
        ) : (
          filtered.map((u, i) => (
            <div key={u.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 24px",
              borderTop: i === 0 ? "none" : "1px solid #f1f5f9",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  background: "#dcfce7", padding: 10, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <User style={{ width: 16, height: 16, color: "#16a34a" }} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{u.email}</div>
                  <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 1 }}>{u.phone}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                {u._count?.orders ?? 0} order · Bergabung {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}