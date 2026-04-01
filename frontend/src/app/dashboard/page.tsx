'use client';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { dashboardApi } from '@/lib/api';
import { MODELS_DATA } from '@/lib/models-data';
import Link from 'next/link';

interface UsageData {
  totalRequests: number;
  avgLatency: number;
  totalCost: number;
  requests24h: number[];
  topModels: { id: string; name: string; requests: number }[];
}

const MOCK_USAGE: UsageData = {
  totalRequests: 142,
  avgLatency: 1.2,
  totalCost: 0.45,
  requests24h: [3,5,2,8,4,6,7,5,9,3,4,8,2,6,5,7,4,3,8,5,6,4,3,2],
  topModels: [
    { id: 'gpt4o', name: 'GPT-4o', requests: 45 },
    { id: 'claude-sonnet46', name: 'Claude Sonnet 4.6', requests: 38 },
    { id: 'gemini25-pro', name: 'Gemini 2.5 Pro', requests: 29 },
    { id: 'llama4-maverick', name: 'Llama 4 Maverick', requests: 18 },
    { id: 'deepseek-v3', name: 'DeepSeek-V3', requests: 12 },
  ],
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [usage, setUsage] = useState<UsageData>(MOCK_USAGE);

  useEffect(() => {
    dashboardApi.usage().then(r => setUsage(r.data)).catch(() => setUsage(MOCK_USAGE));
  }, []);

  const maxBar = Math.max(...usage.requests24h, 1);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 700 }}>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>Here's your NexusAI usage overview</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: '2rem' }}>
        {[
          { icon: '📨', label: 'Total Requests', value: usage.totalRequests.toLocaleString(), sub: 'All time' },
          { icon: '⚡', label: 'Avg Latency', value: `${usage.avgLatency}s`, sub: 'Last 24h' },
          { icon: '💰', label: 'Total Cost', value: `$${usage.totalCost.toFixed(2)}`, sub: 'This month' },
          { icon: '🤖', label: 'Models Used', value: usage.topModels.length.toString(), sub: 'Unique models' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{k.icon}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 700 }}>{k.value}</div>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.1rem' }}>{k.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: '2rem' }}>
        {/* Activity chart */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Requests — Last 24h</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
            {usage.requests24h.map((v, i) => (
              <div key={i} style={{ flex: 1, background: 'var(--accent)', borderRadius: '2px 2px 0 0', height: `${(v / maxBar) * 100}%`, opacity: 0.3 + (i / 24) * 0.7, minHeight: 2 }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text3)', marginTop: '0.5rem' }}>
            <span>24h ago</span><span>Now</span>
          </div>
        </div>

        {/* Top models */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Top Models Used</div>
          {usage.topModels.map(m => {
            const model = MODELS_DATA.find(x => x.id === m.id);
            const pct = Math.round((m.requests / usage.totalRequests) * 100);
            return (
              <div key={m.id} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                  <span>{model?.icon} {m.name}</span>
                  <span style={{ color: 'var(--text3)' }}>{m.requests} req</span>
                </div>
                <div style={{ background: 'var(--bg2)', borderRadius: 4, height: 6 }}>
                  <div style={{ background: 'var(--accent)', borderRadius: 4, height: '100%', width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { href: '/chat', icon: '💬', title: 'Open Chat Hub', desc: 'Start or continue conversations' },
          { href: '/marketplace', icon: '🛒', title: 'Browse Models', desc: 'Discover 400+ AI models' },
          { href: '/agents', icon: '🤖', title: 'Build Agent', desc: 'Create your first AI agent' },
          { href: '/dashboard/history', icon: '📜', title: 'View History', desc: 'See all past conversations' },
        ].map(l => (
          <Link key={l.href} href={l.href}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: '1.4rem' }}>{l.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{l.title}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text3)' }}>{l.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
