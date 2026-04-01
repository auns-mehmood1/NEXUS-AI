'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

const NAV = [
  { href: '/dashboard',          icon: '📊', label: 'Overview' },
  { href: '/dashboard/history',  icon: '💬', label: 'Chat History' },
  { href: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
  { href: '/dashboard/billing',  icon: '💳', label: 'Billing' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text2)' }}>Loading...</div>
  );

  if (!user) {
    if (typeof window !== 'undefined') router.push('/auth/login');
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, background: 'var(--white)', borderRight: '1px solid var(--border)', padding: '1.5rem 0' }}>
        <div style={{ padding: '0 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{user.email}</div>
        </div>
        {NAV.map(item => (
          <Link key={item.href} href={item.href}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.7rem 1.25rem', fontSize: '0.85rem', fontWeight: pathname === item.href ? 600 : 400, color: pathname === item.href ? 'var(--accent)' : 'var(--text2)', background: pathname === item.href ? 'var(--accent-lt)' : 'none', borderLeft: `3px solid ${pathname === item.href ? 'var(--accent)' : 'transparent'}`, cursor: 'pointer' }}>
              <span>{item.icon}</span>
              {item.label}
            </div>
          </Link>
        ))}
        <div style={{ padding: '1.25rem', marginTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <Link href="/chat">
            <button style={{ width: '100%', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.6rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Open Chat Hub →
            </button>
          </Link>
        </div>
      </aside>
      {/* Content */}
      <main style={{ flex: 1, background: 'var(--bg)', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
