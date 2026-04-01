'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 600 }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Settings</h1>
      <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '2rem' }}>Manage your account preferences</p>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Profile</h2>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid var(--border2)', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Email</label>
            <input value={user?.email || ''} disabled style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', background: 'var(--bg)', color: 'var(--text3)' }} />
          </div>
          <button type="submit" style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Preferences</h2>
        {[
          { label: 'Email notifications', desc: 'Receive updates about new models and features' },
          { label: 'Show usage tips', desc: 'Show contextual tips while using Chat Hub' },
          { label: 'Auto-save conversations', desc: 'Automatically save all chat sessions' },
        ].map(p => (
          <label key={p.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)', marginTop: 3 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{p.desc}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
