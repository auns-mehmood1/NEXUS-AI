'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModels, usePublicContent } from '@/lib/catalog';

export default function DiscoverPage() {
  const router = useRouter();
  const { data: models = [], isLoading: modelsLoading } = useModels();
  const { data: content, isLoading: contentLoading } = usePublicContent();
  const [cat, setCat] = useState('All');

  const categories = content?.discoverCategories ?? [];
  const newModels = useMemo(() => models.filter((model) => model.badge === 'new').slice(0, 20), [models]);

  const filtered = useMemo(() => {
    if (cat === 'All') return newModels;
    return newModels.filter((model) => model.tags.some((tag) => tag.toLowerCase().includes(cat.toLowerCase())) || model.types.includes(cat.toLowerCase()));
  }, [cat, newModels]);

  const trending = useMemo(() => models.filter((model) => model.badge === 'hot').slice(0, 6), [models]);

  if (modelsLoading || contentLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>Loading discoveries...</div>;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--teal-lt) 0%, var(--white) 100%)', borderBottom: '1px solid var(--border)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--teal-lt)', border: '1px solid rgba(10,94,73,0.2)', borderRadius: '2rem', padding: '0.3rem 0.9rem', fontSize: '0.78rem', color: 'var(--teal)', marginBottom: '1rem' }}>
            <span style={{ width: 5, height: 5, background: 'var(--teal)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            Updated daily | Latest AI releases
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Discover <span style={{ color: 'var(--teal)' }}>New Models</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
            Stay ahead with the latest AI model releases. From frontier reasoning to specialized tools.
          </p>
        </div>
      </div>

      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '0.75rem 2rem', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {categories.map((category) => (
          <button key={category} onClick={() => setCat(category)} style={{ padding: '0.38rem 0.9rem', border: '1.5px solid', borderColor: cat === category ? 'var(--teal)' : 'var(--border2)', borderRadius: '2rem', fontSize: '0.78rem', fontWeight: 600, background: cat === category ? 'var(--teal)' : 'var(--bg)', color: cat === category ? 'white' : 'var(--text2)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
            {category}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
          Newly Released | {filtered.length} models
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map((model) => (
            <div key={model.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '0.75rem' }}>
                <div style={{ width: 44, height: 44, background: model.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{model.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem' }}>{model.name}</span>
                    <span className="badge-new">new</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{model.org}</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>Rating {model.rating}</div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{model.desc}</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: '1rem' }}>
                {model.tags.slice(0, 4).map((tag) => <span key={tag} style={{ background: 'var(--bg2)', borderRadius: '2rem', padding: '0.12rem 0.5rem', fontSize: '0.7rem', color: 'var(--text2)' }}>{tag}</span>)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>{model.price}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => router.push(`/marketplace?model=${model.id}`)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '2rem', padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>Details</button>
                  <button onClick={() => router.push(`/chat?model=${model.id}`)} style={{ background: 'var(--teal)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>Try Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>Trending This Week</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {trending.map((model) => (
              <div key={model.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', boxShadow: 'var(--shadow)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, background: model.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{model.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{model.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{model.price} | Rating {model.rating}</div>
                </div>
                <button onClick={() => router.push(`/chat?model=${model.id}`)} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.3rem 0.7rem', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>Try</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
