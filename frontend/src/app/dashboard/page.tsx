'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { dashboardApi } from '@/lib/api';
import { useModels } from '@/lib/catalog';

interface UsageData {
  totalRequests: number;
  avgLatency: number;
  totalCost: number;
  requests24h: number[];
  topModels: { id: string; name: string; requests: number }[];
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: models = [] } = useModels();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.usage()
      .then((response) => {
        setUsage(response.data);
        setError('');
      })
      .catch(() => {
        setUsage(null);
        setError('Unable to load usage right now.');
      })
      .finally(() => setLoading(false));
  }, []);

  const maxBar = Math.max(...(usage?.requests24h ?? [1]), 1);
  const modelMap = useMemo(() => new Map(models.map((model) => [model.id, model])), [models]);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text2)' }}>Loading dashboard...</div>;
  }

  if (!usage) {
    return <div style={{ padding: '2rem', color: 'var(--text2)' }}>{error || 'No usage data available yet.'}</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 700 }}>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} ðŸ‘‹</h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>Here&apos;s your NexusAI usage overview</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: '2rem' }}>
        {[
          { icon: 'ðŸ“¨', label: 'Total Requests', value: usage.totalRequests.toLocaleString(), sub: 'All time' },
          { icon: 'âš¡', label: 'Avg Latency', value: `${usage.avgLatency}s`, sub: 'Last 24h' },
          { icon: 'ðŸ’°', label: 'Total Cost', value: `$${usage.totalCost.toFixed(2)}`, sub: 'This month' },
          { icon: 'ðŸ¤–', label: 'Models Used', value: usage.topModels.length.toString(), sub: 'Unique models' },
        ].map((card) => (
          <div key={card.label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 700 }}>{card.value}</div>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.1rem' }}>{card.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: '2rem' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Requests â€” Last 24h</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
            {usage.requests24h.map((value, index) => (
              <div key={index} style={{ flex: 1, background: 'var(--accent)', borderRadius: '2px 2px 0 0', height: `${(value / maxBar) * 100}%`, opacity: 0.3 + (index / 24) * 0.7, minHeight: 2 }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text3)', marginTop: '0.5rem' }}>
            <span>24h ago</span><span>Now</span>
          </div>
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Top Models Used</div>
          {usage.topModels.map((modelUsage) => {
            const model = modelMap.get(modelUsage.id);
            const pct = usage.totalRequests > 0 ? Math.round((modelUsage.requests / usage.totalRequests) * 100) : 0;
            return (
              <div key={modelUsage.id} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                  <span>{model?.icon} {modelUsage.name}</span>
                  <span style={{ color: 'var(--text3)' }}>{modelUsage.requests} req</span>
                </div>
                <div style={{ background: 'var(--bg2)', borderRadius: 4, height: 6 }}>
                  <div style={{ background: 'var(--accent)', borderRadius: 4, height: '100%', width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { href: '/chat', icon: 'ðŸ’¬', title: 'Open Chat Hub', desc: 'Start or continue conversations' },
          { href: '/marketplace', icon: 'ðŸ›’', title: 'Browse Models', desc: 'Discover 400+ AI models' },
          { href: '/agents', icon: 'ðŸ¤–', title: 'Build Agent', desc: 'Create your first AI agent' },
          { href: '/dashboard/history', icon: 'ðŸ“œ', title: 'View History', desc: 'See all past conversations' },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: '1.4rem' }}>{link.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{link.title}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text3)' }}>{link.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
