"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getUser } from "@/lib/auth-client";
import { ArrowLeft, Plus, Minus, Loader2 } from "lucide-react";

interface ShoeType {
  id: string;
  name: string;
  basePrice: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [shoeTypes, setShoeTypes] = useState<ShoeType[]>([]);
  const [selectedShoeTypeId, setSelectedShoeTypeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingShoes, setLoadingShoes] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    const user = getUser();
    if (user?.address) setAddress(user.address);
    fetchShoeTypes(token);
  }, []);

  const fetchShoeTypes = async (token: string) => {
    try {
      const res = await fetch("/api/shoe-types", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setShoeTypes(data);
    } catch {
      // fallback langsung dari data tadi
      setShoeTypes([
        { id: "8703fd88-1d1b-4ecd-bba7-16bc35b84b43", name: "Sneakers", basePrice: 25000 },
        { id: "53a04105-6dab-4f0f-ab17-c48728647af5", name: "Boots", basePrice: 35000 },
        { id: "c8177372-5b06-429e-b2dd-9b272cb7cb52", name: "Heels", basePrice: 30000 },
        { id: "87b7ff38-ffcf-4089-8c11-a7e384444fcb", name: "Sandal", basePrice: 15000 },
        { id: "cd1f5256-b9ea-48d4-9abb-6a12d8626c54", name: "Sepatu Anak", basePrice: 20000 },
        { id: "033e9e00-33d3-45b9-8ebd-fc230e6215fd", name: "Sepatu Kulit", basePrice: 40000 },
      ]);
    } finally {
      setLoadingShoes(false);
    }
  };

  const selectedShoe = shoeTypes.find(s => s.id === selectedShoeTypeId);
  const total = selectedShoe ? selectedShoe.basePrice * quantity : 0;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shoeTypeId: selectedShoeTypeId,
          quantity,
          surcharge: 0,
          notes: note || undefined,
          pickupAddress: address || undefined,
          deliveryAddress: address || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal membuat order");
        return;
      }
      router.push(`/dashboard/orders/${data.id}`);
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-primary-600 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary-900">Order Baru</h1>
            <p className="text-gray-400 text-sm">Pilih jenis sepatu yang ingin dicuci</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {["Jenis Sepatu", "Detail", "Konfirmasi"].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step > i + 1 ? "bg-green-500 text-white" :
                step === i + 1 ? "bg-primary-600 text-white" :
                "bg-gray-200 text-gray-400"
              }`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${step === i + 1 ? "font-medium text-primary-900" : "text-gray-400"}`}>
                {s}
              </span>
              {i < 2 && <div className="w-8 h-0.5 bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 1 — Pilih Jenis Sepatu */}
        {step === 1 && (
          <div className="space-y-4">
            {loadingShoes ? (
              <div className="py-16 text-center text-gray-400">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Memuat jenis sepatu...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {shoeTypes.map((shoe) => (
                    <button
                      key={shoe.id}
                      onClick={() => setSelectedShoeTypeId(shoe.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition ${
                        selectedShoeTypeId === shoe.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-100 bg-white hover:border-primary-200"
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {shoe.name === "Sneakers" ? "👟" :
                         shoe.name === "Boots" ? "🥾" :
                         shoe.name === "Heels" ? "👠" :
                         shoe.name === "Sandal" ? "👡" :
                         shoe.name === "Sepatu Anak" ? "👶" : "👞"}
                      </div>
                      <div className="font-bold text-primary-900 text-sm">{shoe.name}</div>
                      <div className="text-primary-600 text-sm font-medium">
                        Rp {shoe.basePrice.toLocaleString("id-ID")}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedShoe && (
                  <div className="bg-white rounded-2xl p-5 border-2 border-primary-500 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-primary-900">{selectedShoe.name}</span>
                      <span className="text-primary-600 font-bold">
                        Rp {selectedShoe.basePrice.toLocaleString("id-ID")}/pasang
                      </span>
                    </div>
                    {/* Quantity */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Jumlah pasang:</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-primary-900 w-4 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(q => Math.min(10, q + 1))}
                          className="w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedShoe && (
                  <div className="bg-primary-600 text-white rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span>Total</span>
                      <span className="font-bold text-xl">Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="w-full bg-yellow-400 text-primary-900 py-3 rounded-xl font-bold hover:bg-yellow-300 transition"
                    >
                      Lanjutkan →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 2 — Detail Pickup */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-primary-900 mb-4">Detail Pickup</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Pickup <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Semarang"
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan (opsional)
                  </label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Contoh: noda membandel di bagian sol"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border-2 border-gray-200 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
                ← Kembali
              </button>
              <button
                onClick={() => {
                  if (!address.trim()) { setError("Alamat wajib diisi"); return; }
                  setError(""); setStep(3);
                }}
                className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition"
              >
                Lanjutkan →
              </button>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>
        )}

        {/* Step 3 — Konfirmasi */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-primary-900 mb-4">Ringkasan Order</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{selectedShoe?.name} × {quantity} pasang</span>
                  <span className="font-medium">Rp {total.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total Pembayaran</span>
                  <span className="text-primary-600 text-lg">Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2">
                <div><span className="font-medium">📍 Alamat:</span> {address}</div>
                {note && <div><span className="font-medium">📝 Catatan:</span> {note}</div>}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border-2 border-gray-200 py-3 rounded-xl font-medium hover:bg-gray-50 transition">
                ← Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Memproses..." : "💳 Bayar Sekarang"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}