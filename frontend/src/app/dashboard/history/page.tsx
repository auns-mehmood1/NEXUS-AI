'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chatApi } from '@/lib/api';
import { useModels } from '@/lib/catalog';

interface Session {
  _id: string;
  modelId: string;
  messages: { role: string; content: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { data: models = [] } = useModels();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const modelMap = useMemo(() => new Map(models.map((model) => [model.id, model])), [models]);

  useEffect(() => {
    chatApi.history()
      .then((response) => setSessions(response.data || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  async function deleteSession(id: string) {
    await chatApi.deleteSession(id);
    setSessions((prev) => prev.filter((session) => session._id !== id));
  }

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text2)' }}>Loading history...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 700 }}>Chat History</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{sessions.length} conversations saved</p>
        </div>
        <button onClick={() => router.push('/chat')} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.55rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          + New Chat
        </button>
      </div>

      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>CH</div>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '0.5rem' }}>No conversations yet</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Start chatting to see your history here.</p>
          <button onClick={() => router.push('/chat')} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.65rem 1.5rem', cursor: 'pointer', fontFamily: 'inherit' }}>Start Chatting</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessions.map((session) => {
            const model = modelMap.get(session.modelId);
            const lastMsg = session.messages[session.messages.length - 1];
            return (
              <div key={session._id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', display: 'flex', gap: 12, alignItems: 'center', boxShadow: 'var(--shadow)' }}>
                <div style={{ width: 40, height: 40, background: model?.bg || 'var(--bg2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{model?.icon || 'CH'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{model?.name || session.modelId}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lastMsg?.content?.slice(0, 80) || 'No messages'}
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                  {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => router.push(`/chat?session=${session._id}&model=${session.modelId}`)} style={{ background: 'var(--accent-lt)', color: 'var(--accent)', border: '1px solid var(--accent-border)', borderRadius: '2rem', padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>Continue</button>
                  <button onClick={() => deleteSession(session._id)} style={{ background: 'none', color: 'var(--text3)', border: '1px solid var(--border2)', borderRadius: '2rem', padding: '0.3rem 0.65rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
