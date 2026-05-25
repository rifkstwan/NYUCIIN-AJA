"use client";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth-client";

type LoyaltyPoint = {
  id: string;
  points: number;
  description: string | null;
  createdAt: string;
};

export default function LoyaltyPage() {
  const [points, setPoints] = useState<LoyaltyPoint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/loyalty", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setPoints(data.points ?? []);
        setTotal(data.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
        Loyalty Points
      </h1>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
        Kumpulkan poin dari setiap order
      </p>

      <div style={{
        background: "linear-gradient(135deg, #16a34a, #15803d)",
        borderRadius: 14, padding: "24px 28px", marginBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <p style={{ color: "#bbf7d0", fontSize: 13, marginBottom: 4 }}>Total Poin Kamu</p>
          <p style={{ color: "#fff", fontSize: 36, fontWeight: 800 }}>
            {loading ? "..." : total.toLocaleString("id-ID")}
          </p>
          <p style={{ color: "#bbf7d0", fontSize: 12, marginTop: 4 }}>poin</p>
        </div>
        <svg width="48" height="48" fill="none" stroke="#bbf7d0" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>
        Riwayat Poin
      </h2>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Memuat data...</p>
      ) : points.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
          padding: "32px 24px", textAlign: "center",
        }}>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Belum ada riwayat poin</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {points.map((p) => (
            <div key={p.id} style={{
              background: "#fff", borderRadius: 10,
              border: "1px solid #e2e8f0", padding: "14px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>
                  {p.description ?? "Poin"}
                </p>
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  {new Date(p.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
              <span style={{
                fontWeight: 700, fontSize: 15,
                color: p.points >= 0 ? "#16a34a" : "#ef4444",
              }}>
                {p.points >= 0 ? "+" : ""}{p.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}