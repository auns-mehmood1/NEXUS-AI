'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModels, usePublicContent, type Model } from '@/lib/catalog';

export default function MarketplacePage() {
  const router = useRouter();
  const { data: models = [], isLoading: modelsLoading } = useModels();
  const { data: content, isLoading: contentLoading } = usePublicContent();
  const [typeFilter, setTypeFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('All');
  const [ratingMin, setRatingMin] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'reviews'>('rating');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  const typeChips = content?.marketplaceTypeChips ?? [];
  const providers = useMemo(
    () => ['All', ...Array.from(new Set(models.map((model) => model.lab))).sort((a, b) => a.localeCompare(b))],
    [models],
  );

  const filtered = useMemo(() => {
    let result = models.filter((model) => {
      if (typeFilter !== 'all' && !model.types.includes(typeFilter)) return false;
      if (providerFilter !== 'All' && model.lab !== providerFilter) return false;
      if (model.rating < ratingMin) return false;
      if (model.price_start > 0 && model.price_start > maxPrice) return false;
      if (
        searchText &&
        !model.name.toLowerCase().includes(searchText.toLowerCase()) &&
        !model.desc.toLowerCase().includes(searchText.toLowerCase()) &&
        !model.org.toLowerCase().includes(searchText.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'price') result = [...result].sort((a, b) => a.price_start - b.price_start);
    else result = [...result].sort((a, b) => b.reviews - a.reviews);

    return result;
  }, [maxPrice, models, providerFilter, ratingMin, searchText, sortBy, typeFilter]);

  if (modelsLoading || contentLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>Loading marketplace...</div>;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>AI Model Marketplace</h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>Discover and compare {models.length}+ AI models from leading providers</p>
      </div>

      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '0.75rem 2rem', display: 'flex', gap: 8, overflowX: 'auto' }}>
        <span style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text3)', alignSelf: 'center', whiteSpace: 'nowrap', paddingRight: 4 }}>FILTER:</span>
        {typeChips.map((chip) => (
          <button key={chip.key} onClick={() => setTypeFilter(chip.key)} style={{ padding: '0.38rem 0.9rem', border: '1.5px solid', borderColor: typeFilter === chip.key ? 'var(--accent)' : 'var(--border2)', borderRadius: '2rem', fontSize: '0.78rem', fontWeight: 600, background: typeFilter === chip.key ? 'var(--accent)' : 'var(--bg)', color: typeFilter === chip.key ? 'white' : 'var(--text2)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
            {chip.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 0 }}>
        <aside style={{ width: 240, flexShrink: 0, borderRight: '1px solid var(--border)', padding: '1.25rem', background: 'var(--white)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Search</div>
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Model name or keyword..." style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border2)', borderRadius: 8, fontSize: '0.82rem', background: 'var(--bg)', outline: 'none', fontFamily: 'inherit' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Sort By</div>
            {(['rating', 'price', 'reviews'] as const).map((sortOption) => (
              <label key={sortOption} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.3rem 0', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text2)' }}>
                <input type="radio" checked={sortBy === sortOption} onChange={() => setSortBy(sortOption)} style={{ accentColor: 'var(--accent)' }} />
                {sortOption === 'rating' ? 'Top Rated' : sortOption === 'price' ? 'Lowest Price' : 'Most Reviews'}
              </label>
            ))}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Provider</div>
            {providers.map((provider) => (
              <label key={provider} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.3rem 0', cursor: 'pointer', fontSize: '0.82rem', color: providerFilter === provider ? 'var(--accent)' : 'var(--text2)' }}>
                <input type="radio" checked={providerFilter === provider} onChange={() => setProviderFilter(provider)} style={{ accentColor: 'var(--accent)' }} />
                {provider}
              </label>
            ))}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Min Rating: â­ {ratingMin.toFixed(1)}</div>
            <input type="range" min={0} max={5} step={0.1} value={ratingMin} onChange={(e) => setRatingMin(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Max Price: ${maxPrice}/1M tk</div>
            <input type="range" min={0} max={20} step={0.5} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
        </aside>

        <div style={{ flex: 1, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{filtered.length} models found</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filtered.slice(0, 100).map((model) => (
              <MarketplaceCard key={model.id} model={model} onView={() => setSelectedModel(model)} onUseInChat={() => router.push(`/chat?model=${model.id}`)} />
            ))}
          </div>
          {filtered.length > 100 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text2)', fontSize: '0.85rem' }}>
              Showing 100 of {filtered.length} models. Use filters to narrow results.
            </div>
          )}
        </div>
      </div>

      {selectedModel && (
        <ModelModal model={selectedModel} onClose={() => setSelectedModel(null)} onUseInChat={() => { router.push(`/chat?model=${selectedModel.id}`); setSelectedModel(null); }} />
      )}
    </div>
  );
}

function MarketplaceCard({ model, onView, onUseInChat }: { model: Model; onView: () => void; onUseInChat: () => void }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '0.6rem' }}>
        <div style={{ width: 38, height: 38, background: model.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{model.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', fontFamily: "'Syne', sans-serif" }}>{model.name}</span>
            {model.badge && <span className={model.badgeClass}>{model.badge}</span>}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{model.org}</div>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 2 }}>â­ {model.rating}</div>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '0.6rem', lineHeight: 1.5, flex: 1 }}>{model.desc.length > 85 ? model.desc.slice(0, 85) + 'â€¦' : model.desc}</p>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {model.tags.slice(0, 3).map((tag) => <span key={tag} style={{ background: 'var(--bg2)', borderRadius: '2rem', padding: '0.12rem 0.5rem', fontSize: '0.68rem', color: 'var(--text2)' }}>{tag}</span>)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.65rem' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>{model.price}</span>
          <div style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{model.reviews.toLocaleString()} reviews</div>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={onView} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '2rem', padding: '0.3rem 0.65rem', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>Details</button>
          <button onClick={onUseInChat} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.3rem 0.7rem', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>Use in Chat</button>
        </div>
      </div>
    </div>
  );
}

function ModelModal({ model, onClose, onUseInChat }: { model: Model; onClose: () => void; onUseInChat: () => void }) {
  const tabs = ['Overview', 'Pricing', 'Reviews', 'How to Use'];
  const [tab, setTab] = useState('Overview');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'var(--white)', borderRadius: 20, maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 52, height: 52, background: model.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>{model.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem' }}>{model.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>by {model.org} Â· {model.context}</div>
            <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
              {model.badge && <span className={model.badgeClass}>{model.badge}</span>}
              {model.tags.slice(0, 4).map((tag) => <span key={tag} style={{ background: 'var(--bg2)', borderRadius: '2rem', padding: '0.12rem 0.5rem', fontSize: '0.7rem', color: 'var(--text2)' }}>{tag}</span>)}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text3)', lineHeight: 1 }}>âœ•</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.5rem' }}>
          {tabs.map((tabLabel) => (
            <button key={tabLabel} onClick={() => setTab(tabLabel)} style={{ padding: '0.75rem 1rem', border: 'none', background: 'none', fontSize: '0.82rem', fontWeight: tab === tabLabel ? 600 : 400, color: tab === tabLabel ? 'var(--accent)' : 'var(--text2)', borderBottom: tab === tabLabel ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit' }}>{tabLabel}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {tab === 'Overview' && (
            <div>
              <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{model.desc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[{ k: 'Rating', v: `â­ ${model.rating}` }, { k: 'Reviews', v: model.reviews.toLocaleString() }, { k: 'Context', v: model.context }, { k: 'Pricing', v: model.price }, { k: 'Provider', v: model.org }, { k: 'Types', v: model.types.join(', ') }].map((stat) => (
                  <div key={stat.k} style={{ textAlign: 'center', background: 'var(--bg)', borderRadius: 8, padding: '0.75rem', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{stat.v}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase' }}>{stat.k}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'Pricing' && (
            <div>
              <div style={{ background: 'var(--accent-lt)', border: '1px solid var(--accent-border)', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.5rem', color: 'var(--accent)' }}>{model.price}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>per 1M tokens (blended)</div>
              </div>
              <p style={{ color: 'var(--text2)', fontSize: '0.85rem', lineHeight: 1.6 }}>Pricing varies by input/output tokens. Free tier available for testing. Enterprise plans available for high-volume usage.</p>
            </div>
          )}
          {tab === 'Reviews' && (
            <div>
              {[
                { user: 'Developer', rating: 5, text: `${model.name} is exceptional for my use case. Fast, accurate, and cost-effective.` },
                { user: 'Data Scientist', rating: 4, text: 'Great performance on complex tasks. The context window is perfect for long documents.' },
                { user: 'Product Manager', rating: 5, text: 'We integrated this into our workflow and saw immediate improvements in output quality.' },
              ].map((review, index) => (
                <div key={index} style={{ background: 'var(--bg)', borderRadius: 10, padding: '1rem', marginBottom: 10, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{review.user}</span>
                    <span style={{ fontSize: '0.82rem' }}>{'â­'.repeat(review.rating)}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>{review.text}</p>
                </div>
              ))}
            </div>
          )}
          {tab === 'How to Use' && (
            <div>
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '1rem', border: '1px solid var(--border)', marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>Quick Start</div>
                <code style={{ fontSize: '0.78rem', display: 'block', background: 'var(--bg3)', padding: '0.75rem', borderRadius: 6, fontFamily: 'monospace' }}>{`POST /api/chat/send\n{\n  "modelId": "${model.id}",\n  "content": "Your message"\n}`}</code>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6 }}>Click "Use in Chat Hub" below to start immediately with {model.name} in the chat interface.</p>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          <button onClick={onUseInChat} style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.65rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem' }}>Use in Chat Hub â†’</button>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: '2rem', padding: '0.65rem 1.25rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem' }}>Close</button>
        </div>
      </div>
    </div>
  );
}
