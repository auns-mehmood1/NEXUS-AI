'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePublicContent, type LanguageOption } from '@/lib/catalog';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState({ code: 'EN', label: 'English' });
  const [mobileOpen, setMobileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { data: content } = usePublicContent();
  const languages = content?.languages ?? [];

  const navLinks = [
    { href: '/chat', label: 'Chat Hub' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/discover', label: 'Discover New' },
    { href: '/agents', label: 'Agents' },
  ];

  function setLang(lang: LanguageOption) {
    setActiveLang(lang);
    setLangOpen(false);
    const rtl = ['AR', 'UR'];
    document.documentElement.dir = rtl.includes(lang.code) ? 'rtl' : 'ltr';
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAuth();
    router.push('/');
  }

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.875rem 2.5rem',
      background: 'rgba(244,242,238,0.92)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 200,
    }}>
      {/* Logo */}
      <Link href="/" style={{
        fontFamily: "'Syne', sans-serif", fontSize: '1.35rem', fontWeight: 700,
        letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 8,
        color: 'var(--text)',
      }}>
        <span style={{
          width: 26, height: 26, background: 'var(--accent)', borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
            <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z"/>
          </svg>
        </span>
        NexusAI
      </Link>

      {/* Nav links */}
      <ul style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', listStyle: 'none' }}>
        {navLinks.map(l => (
          <li key={l.href}>
            <Link href={l.href} style={{
              fontSize: '0.85rem',
              color: pathname.startsWith(l.href) ? 'var(--text)' : 'var(--text2)',
              fontWeight: pathname.startsWith(l.href) ? 600 : 400,
              transition: 'color 0.2s',
              borderBottom: pathname.startsWith(l.href) ? '2px solid var(--accent)' : '2px solid transparent',
              paddingBottom: 2,
            }}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Language selector */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setLangOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: '1px solid var(--border2)',
              borderRadius: '2rem', padding: '0.45rem 0.85rem',
              fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text2)',
              fontFamily: "'Instrument Sans', sans-serif",
            }}
          >
            🌐 {activeLang.code}
            <span style={{ fontSize: '0.6rem', marginLeft: 2 }}>▼</span>
          </button>
          {langOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'var(--white)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
              minWidth: 160, zIndex: 300, overflow: 'hidden',
            }}>
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '0.55rem 1rem', fontSize: '0.83rem',
                    background: activeLang.code === l.code ? 'var(--accent-lt)' : 'none',
                    color: activeLang.code === l.code ? 'var(--accent)' : 'var(--text2)',
                    border: 'none', cursor: 'pointer',
                    fontFamily: "'Instrument Sans', sans-serif",
                  }}
                >
                  {l.code} — {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <>
            <Link href="/dashboard">
              <button style={{
                background: 'none', border: '1px solid var(--border2)', borderRadius: '2rem',
                padding: '0.5rem 1.1rem', fontSize: '0.85rem', cursor: 'pointer',
                color: 'var(--text)', fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500,
              }}>
                Dashboard
              </button>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: 'var(--accent)', color: 'white', border: 'none',
                borderRadius: '2rem', padding: '0.5rem 1.25rem',
                fontSize: '0.85rem', cursor: 'pointer',
                fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500,
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login">
              <button style={{
                background: 'none', border: '1px solid var(--border2)', borderRadius: '2rem',
                padding: '0.5rem 1.1rem', fontSize: '0.85rem', cursor: 'pointer',
                color: 'var(--text)', fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500,
              }}>
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button style={{
                background: 'var(--accent)', color: 'white', border: 'none',
                borderRadius: '2rem', padding: '0.5rem 1.25rem',
                fontSize: '0.85rem', cursor: 'pointer',
                fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500,
              }}>
                Get Started
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
