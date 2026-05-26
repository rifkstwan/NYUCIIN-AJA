"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth-client";
import { ArrowLeft, Loader2, MapPin, Package, Phone, User, Upload, X } from "lucide-react";

const STATUS_FLOW: { key: string; label: string; color: string }[] = [
  { key: "BOOKED",   label: "Diterima",    color: "bg-blue-100 text-blue-700" },
  { key: "PICKUP",   label: "Pickup",      color: "bg-purple-100 text-purple-700" },
  { key: "WASHING",  label: "Dicuci",      color: "bg-orange-100 text-orange-700" },
  { key: "DRYING",   label: "Dikeringkan", color: "bg-yellow-100 text-yellow-700" },
  { key: "DELIVERY", label: "Dikirim",     color: "bg-cyan-100 text-cyan-700" },
  { key: "DONE",     label: "Selesai",     color: "bg-green-100 text-green-700" },
];

const statusMap = Object.fromEntries(STATUS_FLOW.map(s => [s.key, s]));

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router  = useRouter();

  const [order,    setOrder]    = useState<any>(null);
  const [photos,   setPhotos]   = useState<{ id: string; photoUrl: string; type: string }[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note,     setNote]     = useState("");
  const [message,  setMessage]  = useState("");

  const [uploadingStep, setUploadingStep] = useState<string | null>(null);
  const [uploadMsg,     setUploadMsg]     = useState("");
  const fileInputRef       = useRef<HTMLInputElement>(null);
  const uploadingForStep   = useRef<string>("");

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }
    fetchOrder(token);
  }, []);

  const fetchOrder = async (token: string) => {
    try {
      const res  = await fetch(`/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const o    = data.order ?? data;
      setOrder(o);
      setPhotos(o.shoePhotos ?? []);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    setMessage("");
    try {
      const token = getToken();
      const res   = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, note }),
      });
      const data  = await res.json();
      if (res.ok) {
        setOrder((prev: any) => ({ ...prev, status: newStatus }));
        setMessage("Status berhasil diupdate");
        setNote("");
        setUploadMsg("");
      } else {
        setMessage(data.message ?? "Gagal update status");
      }
    } catch {
      setMessage("Gagal update status");
    } finally {
      setUpdating(false);
    }
  };

  const triggerUpload = (stepKey: string) => {
    uploadingForStep.current = stepKey;
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const stepKey = uploadingForStep.current;
    setUploadingStep(stepKey);
    setUploadMsg("");

    try {
      const token = getToken();

      const form = new FormData();
      form.append("file", file);
      const upRes = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!upRes.ok) {
        const d = await upRes.json();
        throw new Error(d.error ?? "Gagal upload foto");
      }
      const { url } = await upRes.json();

      const saveRes = await fetch(`/api/admin/orders/${id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ photoUrl: url, type: stepKey }),
      });
      if (!saveRes.ok) throw new Error("Gagal menyimpan foto");
      const saved = await saveRes.json();

      setPhotos(prev => [...prev, saved]);
      setUploadMsg("Foto berhasil diunggah");
    } catch (err: any) {
      setUploadMsg(err.message ?? "Gagal upload");
    } finally {
      setUploadingStep(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm("Hapus foto ini?")) return;
    try {
      const token = getToken();
      await fetch(`/api/admin/orders/${id}/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ photoId }),
      });
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch {
      alert("Gagal menghapus foto");
    }
  };

  if (loading) return (
    <div className="py-16 text-center text-gray-400">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      Memuat data...
    </div>
  );

  if (!order) return (
    <div className="py-16 text-center text-gray-400 text-sm">Order tidak ditemukan</div>
  );

  const s            = statusMap[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600", key: order.status };
  const currentIndex = STATUS_FLOW.findIndex(st => st.key === order.status);
  const nextStep     = STATUS_FLOW[currentIndex + 1];
  const stepPhotos   = photos.filter(p => p.type === order.status);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/orders" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition mb-4">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">{order.orderNumber}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${s.color}`}>
            {s.label}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Kiri */}
        <div className="md:col-span-2 space-y-5">

          {/* Detail Order */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-primary-900">Detail Order</h2>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Jenis Layanan</span>
                <span className="font-medium text-gray-900">{order.shoeType?.name}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Jumlah</span>
                <span className="font-medium text-gray-900">{order.quantity} pasang</span>
              </div>
              {order.surcharge > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Biaya tambahan</span>
                  <span className="font-medium text-gray-900">Rp {order.surcharge?.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-3 font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-primary-600">Rp {order.totalPrice?.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          {/* Info Pelanggan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-primary-900">Info Pelanggan</h2>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <div className="bg-primary-50 p-2 rounded-lg"><User className="w-4 h-4 text-primary-600" /></div>
                <span>{order.user?.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary-50 p-2 rounded-lg"><Phone className="w-4 h-4 text-primary-600" /></div>
                <span>{order.user?.phone ?? "-"}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary-50 p-2 rounded-lg mt-0.5"><MapPin className="w-4 h-4 text-primary-600" /></div>
                <span>{order.pickupAddress || "-"}</span>
              </div>
              {order.notes && (
                <div className="flex items-start gap-3">
                  <div className="bg-primary-50 p-2 rounded-lg mt-0.5"><Package className="w-4 h-4 text-primary-600" /></div>
                  <span>Catatan: {order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Kondisi Sepatu - Step Aktif */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-primary-900">Kondisi Sepatu</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Foto kondisi sepatu pada tahap{" "}
                <span className="font-medium text-gray-600">{s.label}</span>
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">

              {order.status !== "CANCELLED" && (
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
                    {s.label}
                  </span>
                  <button
                    onClick={() => triggerUpload(order.status)}
                    disabled={uploadingStep === order.status}
                    className="flex items-center gap-1.5 text-xs text-primary-600 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition disabled:opacity-50"
                  >
                    {uploadingStep === order.status
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Upload className="w-3 h-3" />
                    }
                    Upload Foto
                  </button>
                </div>
              )}

              {stepPhotos.length === 0 ? (
                <p className="text-xs text-gray-300 italic">Belum ada foto untuk tahap ini</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {stepPhotos.map(p => (
                    <div key={p.id} className="relative group rounded-xl overflow-hidden border border-gray-100 aspect-square">
                      <img src={p.photoUrl} alt={s.label} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadMsg && (
                <p className={`text-xs ${uploadMsg.includes("berhasil") ? "text-green-600" : "text-red-500"}`}>
                  {uploadMsg}
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Kanan */}
        <div className="space-y-5">

          {/* Update Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-primary-900">Update Status</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              {message && (
                <div className={`rounded-xl px-4 py-3 text-sm ${
                  message.startsWith("Status") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                }`}>
                  {message}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Catatan (opsional)</label>
                <input
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Contoh: Sepatu sudah dijemput"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              {nextStep && order.status !== "CANCELLED" && (
                <button
                  onClick={() => updateStatus(nextStep.key)}
                  disabled={updating}
                  className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Tandai {nextStep.label}
                </button>
              )}
              {!["DONE", "CANCELLED"].includes(order.status) && (
                <button
                  onClick={() => updateStatus("CANCELLED")}
                  disabled={updating}
                  className="w-full border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
                >
                  Batalkan Order
                </button>
              )}
              {order.status === "DONE" && (
                <p className="text-center text-green-600 text-sm font-medium">Order sudah selesai</p>
              )}
              {order.status === "CANCELLED" && (
                <p className="text-center text-red-500 text-sm font-medium">Order dibatalkan</p>
              )}
            </div>
          </div>

          {/* Alur Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-primary-900">Alur Status</h2>
            </div>
            <div className="px-6 py-5 space-y-2.5">
              {STATUS_FLOW.map((step, i) => {
                const done   = i <= currentIndex;
                const active = step.key === order.status;
                return (
                  <div key={step.key} className={`flex items-center gap-2.5 text-sm ${
                    active ? "font-semibold text-primary-900" :
                    done   ? "text-gray-500" : "text-gray-300"
                  }`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      active ? "bg-primary-600" :
                      done   ? "bg-green-400"  : "bg-gray-200"
                    }`} />
                    {step.label}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}