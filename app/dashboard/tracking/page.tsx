"use client";
import { useEffect, useState } from "react";

type TrackingOrder = {
  id: string;
  orderNumber: string;
  status: string;
  shoeType: { name: string };
  tracking: { status: string; note: string | null; createdAt: string }[];
};

const steps = ["BOOKED", "PICKUP", "WASHING", "DRYING", "DELIVERY", "DONE"];
const stepLabel: Record<string, string> = {
  BOOKED: "Dipesan",
  PICKUP: "Pickup",
  WASHING: "Dicuci",
  DRYING: "Dikeringkan",
  DELIVERY: "Diantar",
  DONE: "Selesai",
};

export default function TrackingPage() {
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [selected, setSelected] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders?withTracking=true")
      .then((r) => r.json())
      .then((data) => {
        const active = (data.orders ?? []).filter(
          (o: TrackingOrder) => o.status !== "DONE" && o.status !== "CANCELLED"
        );
        setOrders(active);
        if (active.length > 0) setSelected(active[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const currentStep = selected ? steps.indexOf(selected.status) : -1;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
        Tracking Order
      </h1>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
        Pantau status pesanan aktif kamu
      </p>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Memuat data...</p>
      ) : orders.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
          padding: "48px 24px", textAlign: "center",
        }}>
          <p style={{ color: "#94a3b8", fontSize: 15 }}>Tidak ada order aktif</p>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 20 }}>
          {/* List order */}
          <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 8 }}>
            {orders.map((o) => (
              <button key={o.id} onClick={() => setSelected(o)} style={{
                background: selected?.id === o.id ? "#dcfce7" : "#fff",
                border: `1px solid ${selected?.id === o.id ? "#16a34a" : "#e2e8f0"}`,
                borderRadius: 10, padding: "12px 14px", textAlign: "left",
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{o.orderNumber}</p>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{o.shoeType.name}</p>
              </button>
            ))}
          </div>

          {/* Detail tracking */}
          {selected && (
            <div style={{
              flex: 1, background: "#fff", borderRadius: 12,
              border: "1px solid #e2e8f0", padding: 24,
            }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 20 }}>
                {selected.orderNumber} · {selected.shoeType.name}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {steps.map((step, i) => {
                  const done = i <= currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: done ? "#16a34a" : "#e2e8f0",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {done && (
                            <svg width="14" height="14" fill="none" stroke="#fff" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {i < steps.length - 1 && (
                          <div style={{
                            width: 2, height: 32,
                            background: i < currentStep ? "#16a34a" : "#e2e8f0",
                          }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: 16 }}>
                        <p style={{
                          fontSize: 13, fontWeight: active ? 700 : 500,
                          color: done ? "#0f172a" : "#94a3b8",
                        }}>
                          {stepLabel[step]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}