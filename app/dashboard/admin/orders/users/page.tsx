'use client'
import { useEffect, useState } from 'react'
import { getToken } from '@/lib/auth-client'

type User = {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: string
  _count: { orders: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
        Manajemen Pelanggan
      </h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
        Daftar semua pelanggan terdaftar
      </p>

      <input
        placeholder="Cari nama atau email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%', maxWidth: 360, padding: '10px 14px',
          borderRadius: 8, border: '1px solid #e2e8f0',
          fontSize: 14, marginBottom: 16, boxSizing: 'border-box', outline: 'none',
        }}
      />

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Memuat data...</p>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 12,
          border: '1px solid #e2e8f0', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Nama', 'Email', 'No. HP', 'Total Order', 'Bergabung'].map((h) => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: 12, fontWeight: 600, color: '#64748b',
                    borderBottom: '1px solid #e2e8f0',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                    Tidak ada pelanggan
                  </td>
                </tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, color: '#0f172a' }}>
                    {u.name}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{u.phone ?? '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#0f172a', fontWeight: 600 }}>
                    {u._count.orders}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>
                    {new Date(u.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}