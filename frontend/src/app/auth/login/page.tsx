'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, chatApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { loadGuestSession, clearGuestSession } from '@/lib/guest-session';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      setAuth(data.user, data.accessToken, data.refreshToken);

      // Migrate guest session if exists
      const guestSess = loadGuestSession();
      if (guestSess?.guestId) {
        try { await chatApi.migrate(guestSess.guestId); } catch { /* non-critical */ }
        clearGuestSession();
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(91,79,233,0.06) 0%, transparent 70%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 44, height: 44, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="20" height="20" viewBox="0 0 14 14" fill="white"><path d="M7 1L13 4V10L7 13L1 10V4L7 1Z"/></svg>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Welcome back</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginTop: '0.35rem' }}>Sign in to continue to NexusAI</p>
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid var(--border2)', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', color: 'var(--text)' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text)' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid var(--border2)', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', color: 'var(--text)' }} />
            </div>
            {error && (
              <div style={{ background: 'var(--rose-lt)', border: '1px solid rgba(155,32,66,0.2)', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.82rem', color: 'var(--rose)', marginBottom: '1rem' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? 'var(--border2)' : 'var(--accent)', color: loading ? 'var(--text3)' : 'white', border: 'none', borderRadius: '2rem', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text2)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one free</Link>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <Link href="/chat" style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>
              Continue as guest (3h session)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
