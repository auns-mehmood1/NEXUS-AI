'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MODELS_DATA } from '@/lib/models-data';

const NEW_MODELS = MODELS_DATA.filter(m => m.badge === 'new').slice(0, 20);
const CATEGORIES = ['All', 'Language', 'Vision', 'Code', 'Reasoning', 'Multimodal', 'Audio', 'Video', 'Open Source'];

export default function DiscoverPage() {
  const router = useRouter();
  const [cat, setCat] = useState('All');

  const filtered = cat === 'All'
    ? NEW_MODELS
    : NEW_MODELS.filter(m => m.tags.some(t => t.toLowerCase().includes(cat.toLowerCase())) || m.types.includes(cat.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--teal-lt) 0%, var(--white) 100%)', borderBottom: '1px solid var(--border)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--teal-lt)', border: '1px solid rgba(10,94,73,0.2)', borderRadius: '2rem', padding: '0.3rem 0.9rem', fontSize: '0.78rem', color: 'var(--teal)', marginBottom: '1rem' }}>
            <span style={{ width: 5, height: 5, background: 'var(--teal)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            Updated daily · Latest AI releases
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Discover <span style={{ color: 'var(--teal)' }}>New Models</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
            Stay ahead with the latest AI model releases. From frontier reasoning to specialized tools.
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '0.75rem 2rem', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ padding: '0.38rem 0.9rem', border: '1.5px solid', borderColor: cat === c ? 'var(--teal)' : 'var(--border2)', borderRadius: '2rem', fontSize: '0.78rem', fontWeight: 600, background: cat === c ? 'var(--teal)' : 'var(--bg)', color: cat === c ? 'white' : 'var(--text2)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Models */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
          🆕 Recently Released · {filtered.length} models
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(m => (
            <div key={m.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '0.75rem' }}>
                <div style={{ width: 44, height: 44, background: m.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem' }}>{m.name}</span>
                    <span className="badge-new">new</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{m.org}</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>⭐ {m.rating}</div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{m.desc}</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: '1rem' }}>
                {m.tags.slice(0, 4).map(t => <span key={t} style={{ background: 'var(--bg2)', borderRadius: '2rem', padding: '0.12rem 0.5rem', fontSize: '0.7rem', color: 'var(--text2)' }}>{t}</span>)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>{m.price}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => router.push(`/marketplace?model=${m.id}`)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '2rem', padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>Details</button>
                  <button onClick={() => router.push(`/chat?model=${m.id}`)} style={{ background: 'var(--teal)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>Try Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hot models section */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>🔥 Trending This Week</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {MODELS_DATA.filter(m => m.badge === 'hot').slice(0, 6).map(m => (
              <div key={m.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', boxShadow: 'var(--shadow)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, background: m.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{m.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{m.price} · ⭐ {m.rating}</div>
                </div>
                <button onClick={() => router.push(`/chat?model=${m.id}`)} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.3rem 0.7rem', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>Try</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
