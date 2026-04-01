'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.signup({ name, email, password });
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,98,42,0.06) 0%, transparent 70%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 44, height: 44, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="20" height="20" viewBox="0 0 14 14" fill="white"><path d="M7 1L13 4V10L7 13L1 10V4L7 1Z"/></svg>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Create your account</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginTop: '0.35rem' }}>Free forever · No credit card needed</p>
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Smith" style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid var(--border2)', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid var(--border2)', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 characters" style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid var(--border2)', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }} />
            </div>
            {error && (
              <div style={{ background: 'var(--rose-lt)', border: '1px solid rgba(155,32,66,0.2)', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.82rem', color: 'var(--rose)', marginBottom: '1rem' }}>{error}</div>
            )}
            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? 'var(--border2)' : 'var(--accent)', color: loading ? 'var(--text3)' : 'white', border: 'none', borderRadius: '2rem', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text2)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </div>
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <Link href="/chat" style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>Continue as guest (3h session)</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
