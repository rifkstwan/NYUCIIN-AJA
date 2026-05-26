"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth-client";
import { User, Search, Pencil, Trash2, X, Loader2 } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  _count?: { orders: number };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users,   setUsers]   = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  // modal edit
  const [editUser,   setEditUser]   = useState<Customer | null>(null);
  const [editForm,   setEditForm]   = useState({ name: "", email: "", phone: "", address: "" });
  const [saving,     setSaving]     = useState(false);
  const [editMsg,    setEditMsg]    = useState("");

  // delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    const user  = getUser();
    if (!token || user?.role !== "ADMIN") { router.push("/auth/login"); return; }
    fetchUsers(token);
  }, []);

  const fetchUsers = async (token: string) => {
    try {
      const res  = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers(data.users ?? data);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (u: Customer) => {
    setEditUser(u);
    setEditForm({ name: u.name, email: u.email, phone: u.phone ?? "", address: u.address ?? "" });
    setEditMsg("");
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    setEditMsg("");
    try {
      const token = getToken();
      const res   = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const data  = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...data } : u));
        setEditUser(null);
      } else {
        setEditMsg(data.message ?? "Gagal menyimpan");
      }
    } catch {
      setEditMsg("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus pelanggan "${name}"? Semua data terkait akan ikut terhapus.`)) return;
    setDeletingId(id);
    try {
      const token = getToken();
      const res   = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers(prev => prev.filter(u => u.id !== id));
      else alert("Gagal menghapus pelanggan");
    } catch {
      alert("Gagal menghapus pelanggan");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900">Pelanggan</h1>
        <p className="text-gray-400 text-sm mt-1">{users.length} total pelanggan</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau nomor HP..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Memuat data...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">Tidak ada pelanggan ditemukan</div>
        ) : (
          filtered.map((u, i) => (
            <div
              key={u.id}
              className={`flex items-center justify-between px-6 py-4 ${i !== 0 ? "border-t border-gray-50" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary-50 p-2.5 rounded-xl">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{u.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{u.email}</div>
                  <div className="text-xs text-gray-300">{u.phone || "-"}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-gray-400">{u._count?.orders ?? 0} order</div>
                  <div className="text-xs text-gray-300">
                    {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <button
                  onClick={() => openEdit(u)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(u.id, u.name)}
                  disabled={deletingId === u.id}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                >
                  {deletingId === u.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Edit */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-primary-900">Edit Pelanggan</h2>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {editMsg && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{editMsg}</div>
              )}
              {[
                { label: "Nama",         key: "name",    type: "text",  placeholder: "Nama lengkap" },
                { label: "Email",        key: "email",   type: "email", placeholder: "email@contoh.com" },
                { label: "Nomor HP",     key: "phone",   type: "text",  placeholder: "08xx" },
                { label: "Alamat",       key: "address", type: "text",  placeholder: "Alamat lengkap" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    value={editForm[f.key as keyof typeof editForm]}
                    onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}