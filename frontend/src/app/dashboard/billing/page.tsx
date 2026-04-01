'use client';
import React from 'react';
import Link from 'next/link';

const PLANS = [
  { name: 'Free', price: '$0', period: '/mo', features: ['50 requests/day', '10 models', 'Community support', '3h guest sessions'], current: true, cta: 'Current Plan' },
  { name: 'Pro', price: '$19', period: '/mo', features: ['Unlimited requests', '400+ models', 'Priority support', 'Permanent history', 'API access'], current: false, cta: 'Upgrade to Pro' },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'Custom integrations', 'SLA guarantee', 'Dedicated support', 'SSO & SAML'], current: false, cta: 'Contact Sales' },
];

export default function BillingPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Billing & Plans</h1>
      <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '2rem' }}>Choose the plan that fits your needs</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: '2rem' }}>
        {PLANS.map(p => (
          <div key={p.name} style={{ background: 'var(--white)', border: `2px solid ${p.current ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: p.current ? '0 0 0 1px var(--accent)' : 'var(--shadow)', position: 'relative' }}>
            {p.current && (
              <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '2rem' }}>CURRENT</div>
            )}
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{p.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '2rem' }}>{p.price}</span>
              <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{p.period}</span>
            </div>
            <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
              {p.features.map(f => (
                <li key={f} style={{ fontSize: '0.82rem', color: 'var(--text2)', padding: '0.3rem 0', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: 'var(--green)' }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button disabled={p.current} style={{ width: '100%', background: p.current ? 'var(--bg2)' : 'var(--accent)', color: p.current ? 'var(--text3)' : 'white', border: 'none', borderRadius: '2rem', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 600, cursor: p.current ? 'default' : 'pointer', fontFamily: 'inherit' }}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Usage This Month</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[{ label: 'API Requests', used: 142, limit: '50/day' }, { label: 'Tokens Used', used: 450000, limit: '500K' }, { label: 'Cost', used: 0, limit: '$0.00' }].map(u => (
            <div key={u.label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{u.label}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.3rem' }}>{typeof u.used === 'number' && u.used > 1000 ? `${(u.used/1000).toFixed(0)}K` : u.used}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>of {u.limit}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
