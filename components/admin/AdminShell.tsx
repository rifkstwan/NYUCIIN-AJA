'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getToken, getUser, logout } from '@/lib/auth-client'

const navItems = [
  {
    href: '/admin/dashboard', // ← diubah dari '/admin'
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/admin/orders',
    label: 'Manajemen Order',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'Pelanggan',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/revenue', // ← diubah dari '/admin/dashboard'
    label: 'Revenue & Statistik',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getToken()
    const u = getUser()
    if (!token || u?.role !== 'ADMIN') {
      router.push('/auth/login')
      return
    }
    setUser(u)
    setReady(true)
  }, [])

  if (!ready) return null

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc', fontFamily: 'var(--font-body)' }}>
      <aside style={{
        width: 240, flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800, fontSize: 20,
          letterSpacing: '-0.5px',
          color: '#0f172a', textDecoration: 'none',
          marginBottom: 4, display: 'block', paddingLeft: 8,
        }}>
          Nyuciin<span style={{ color: '#16a34a' }}>Aja</span>
        </Link>
        <p style={{ fontSize: 11, color: '#94a3b8', paddingLeft: 8, marginBottom: 28, fontWeight: 500 }}>
          Admin Panel
        </p>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/') || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8,
                fontSize: 13.5, fontWeight: active ? 600 : 500,
                color: active ? '#16a34a' : '#475569',
                background: active ? '#dcfce7' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s',
              }}>
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginBottom: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', paddingLeft: 12 }}>{user?.name ?? 'Admin'}</p>
          <p style={{ fontSize: 11, color: '#94a3b8', paddingLeft: 12, marginTop: 2 }}>{user?.email}</p>
        </div>

        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 8,
          fontSize: 13.5, fontWeight: 500,
          color: '#ef4444', background: 'transparent',
          border: 'none', cursor: 'pointer',
          width: '100%', textAlign: 'left',
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>
      </aside>

      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}