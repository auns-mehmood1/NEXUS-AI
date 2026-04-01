'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useModels, usePublicContent, type Model } from '@/lib/catalog';

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { data: models = [] } = useModels();
  const { data: content } = usePublicContent();

  const stats = content?.homeStats ?? [];
  const featured = models.filter((model) => model.badge === 'hot').slice(0, 6);
  const heroModels = (content?.homeHeroModelIds ?? [])
    .map((modelId) => models.find((model) => model.id === modelId))
    .filter((model): model is Model => Boolean(model));

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/chat?q=${encodeURIComponent(query)}`);
    else router.push('/chat');
  }

  return (
    <div>
      {/* Hero */}
      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '5rem 2rem 4rem',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(91,79,233,0.07) 0%, transparent 70%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px', opacity: 0.35, pointerEvents: 'none',
        }} />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'white', border: '1px solid var(--border2)',
          borderRadius: '2rem', padding: '0.35rem 1rem',
          fontSize: '0.78rem', color: 'var(--text2)',
          marginBottom: '2rem', boxShadow: 'var(--shadow)', position: 'relative',
        }}>
          <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          400+ AI models · Live & ready to use
        </div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 'clamp(3rem, 6.5vw, 5.5rem)',
          fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.04em',
          maxWidth: 800, marginBottom: '1.25rem', position: 'relative',
        }}>
          One Hub for<br /><span style={{ color: 'var(--accent)' }}>Every AI Model</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text2)', maxWidth: 500, marginBottom: '3rem', position: 'relative' }}>
          Discover, compare, and deploy 400+ AI models in one unified platform. No switching tabs, no API juggling.
        </p>
        <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 640, position: 'relative', marginBottom: '1.5rem' }}>
          <div style={{ background: 'white', border: '1.5px solid var(--border2)', borderRadius: 28, boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', minHeight: 58 }}>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Ask anything, or search for a model..."
              style={{ flex: 1, padding: '1rem 0 1rem 1.5rem', fontSize: '0.98rem', border: 'none', background: 'transparent', outline: 'none', fontFamily: "'Instrument Sans', sans-serif", color: 'var(--text)' }}
            />
            <button type="submit" style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.6rem 1.4rem', borderRadius: 22, fontFamily: "'Instrument Sans', sans-serif", fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', margin: '0 6px' }}>
              Start Chat →
            </button>
          </div>
        </form>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
          {heroModels.map((model) => (
            <Link key={model.id} href={`/chat?model=${encodeURIComponent(model.id)}`}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'white', border: '1px solid var(--border2)', borderRadius: '2rem', padding: '0.22rem 0.75rem', fontSize: '0.78rem', color: 'var(--text2)', boxShadow: 'var(--shadow)', cursor: 'pointer' }}>
                {model.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--white)', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Featured Models */}
      <section style={{ padding: '4rem 2.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.75rem', fontWeight: 700 }}>Trending Models</h2>
            <Link href="/marketplace" style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500 }}>View all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {featured.map(m => <ModelCard key={m.id} model={m} />)}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section style={{ padding: '4rem 2.5rem', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Everything in One Place</h2>
          <p style={{ color: 'var(--text2)', maxWidth: 500, margin: '0 auto 3rem' }}>Switch models mid-conversation, compare outputs, build agents — all without leaving NexusAI.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { icon: '💬', title: 'Chat Hub', desc: '3-column chat with 400+ models. Switch anytime.', href: '/chat' },
              { icon: '🛒', title: 'Marketplace', desc: 'Filter, compare, and find the perfect model.', href: '/marketplace' },
              { icon: '🔭', title: 'Discover New', desc: 'Explore cutting-edge models as they drop.', href: '/discover' },
              { icon: '🤖', title: 'Agents', desc: 'Build, configure, and deploy AI agents.', href: '/agents' },
            ].map(f => (
              <Link key={f.href} href={f.href}>
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.75rem 1.5rem', textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.83rem', color: 'var(--text2)' }}>{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Start for free. No card required.</h2>
        <p style={{ color: 'var(--text2)', marginBottom: '2rem' }}>Guest sessions give you 3 hours to explore. Sign up to save your history permanently.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/chat">
            <button style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif" }}>Try for Free</button>
          </Link>
          <Link href="/auth/signup">
            <button style={{ background: 'none', color: 'var(--text)', border: '1px solid var(--border2)', borderRadius: '2rem', padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif" }}>Create Account</button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function ModelCard({ model }: { model: Model }) {
  const router = useRouter();
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '0.75rem' }}>
        <div style={{ width: 40, height: 40, background: model.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{model.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', fontFamily: "'Syne', sans-serif" }}>{model.name}</span>
            {model.badge && <span className={model.badgeClass}>{model.badge}</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>by {model.org}</div>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text2)', whiteSpace: 'nowrap' }}>⭐ {model.rating}</div>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{model.desc.length > 90 ? model.desc.slice(0, 90) + '...' : model.desc}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
        {model.tags.slice(0, 3).map(t => (
          <span key={t} style={{ background: 'var(--bg2)', borderRadius: '2rem', padding: '0.15rem 0.6rem', fontSize: '0.7rem', color: 'var(--text2)' }}>{t}</span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>{model.price}</span>
        <button onClick={() => router.push(`/chat?model=${model.id}`)} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.35rem 0.9rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif" }}>
          Use in Chat
        </button>
      </div>
    </div>
  );
}
