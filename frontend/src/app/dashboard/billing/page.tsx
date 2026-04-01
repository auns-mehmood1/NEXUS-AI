'use client';
import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { usePublicContent } from '@/lib/catalog';

interface UsageData {
  totalRequests: number;
  totalCost: number;
  topModels: { id: string; name: string; requests: number }[];
}

export default function BillingPage() {
  const { data: content, isLoading: contentLoading } = usePublicContent();
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    dashboardApi.usage()
      .then((response) => setUsage(response.data))
      .catch(() => setUsage(null));
  }, []);

  if (contentLoading) {
    return <div style={{ padding: '2rem', color: 'var(--text2)' }}>Loading billing...</div>;
  }

  const billingPlans = content?.billingPlans ?? [];
  const usageCards = [
    { label: 'API Requests', value: usage ? usage.totalRequests.toLocaleString() : '--', sub: 'all time' },
    { label: 'Models Used', value: usage ? usage.topModels.length.toString() : '--', sub: 'this month' },
    { label: 'Cost', value: usage ? `$${usage.totalCost.toFixed(2)}` : '--', sub: 'current month' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Billing & Plans</h1>
      <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '2rem' }}>Choose the plan that fits your needs</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: '2rem' }}>
        {billingPlans.map((plan) => (
          <div key={plan.name} style={{ background: 'var(--white)', border: `2px solid ${plan.current ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: plan.current ? '0 0 0 1px var(--accent)' : 'var(--shadow)', position: 'relative' }}>
            {plan.current && (
              <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '2rem' }}>CURRENT</div>
            )}
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{plan.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '2rem' }}>{plan.price}</span>
              <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{plan.period}</span>
            </div>
            <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
              {plan.features.map((feature) => (
                <li key={feature} style={{ fontSize: '0.82rem', color: 'var(--text2)', padding: '0.3rem 0', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: 'var(--green)' }}>âœ“</span>{feature}
                </li>
              ))}
            </ul>
            <button disabled={plan.current} style={{ width: '100%', background: plan.current ? 'var(--bg2)' : 'var(--accent)', color: plan.current ? 'var(--text3)' : 'white', border: 'none', borderRadius: '2rem', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 600, cursor: plan.current ? 'default' : 'pointer', fontFamily: 'inherit' }}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Usage This Month</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {usageCards.map((card) => (
            <div key={card.label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{card.label}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.3rem' }}>{card.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{card.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
