'use client';
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MODELS_DATA, CPANEL_DATA, type Model } from '@/lib/models-data';
import { getOrCreateGuestSession, loadGuestSession, addGuestMessage, isExpired, getRemainingTime, type GuestSession, type GuestMessage } from '@/lib/guest-session';
import { useAuthStore } from '@/store/auth';
import { chatApi } from '@/lib/api';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────
interface Message { role: 'user' | 'assistant'; content: string; timestamp: number; attachments?: { type: string; url: string; name: string }[]; }

const CPANEL_TABS = [
  { key: 'use_cases', label: '✦ Use Cases' },
  { key: 'create',    label: '✍ Create' },
  { key: 'analyze',   label: '📊 Analyze' },
  { key: 'prototype', label: '🧪 Prototype' },
  { key: 'business',  label: '💼 Business' },
  { key: 'monitor',   label: '🔔 Monitor' },
  { key: 'learn',     label: '📚 Learn' },
];

const QUICK_ACTIONS = [
  { group: 'Navigation & Tools', items: ['Go to Marketplace', 'Browse Agents', 'Discover New Models', 'Open Dashboard'] },
  { group: 'Create & Generate', items: ['Write a blog post', 'Generate code snippet', 'Create a template', 'Draft an email'] },
  { group: 'Analyze & Write', items: ['Summarize this', 'Explain step by step', 'Compare options', 'Review and improve'] },
];

// ── Mock AI response ───────────────────────────────────────────────────
function getMockResponse(content: string, modelName: string): string {
  const lc = content.toLowerCase();
  if (lc.includes('hello') || lc.includes('hi')) return `Hello! I'm ${modelName}. How can I help you today? I'm ready to assist with analysis, writing, coding, or any other task.`;
  if (lc.includes('code') || lc.includes('function')) return `Here's an example implementation:\n\n\`\`\`javascript\nfunction example() {\n  // Your code here\n  return 'Hello from ${modelName}';\n}\n\`\`\`\n\nLet me know if you'd like me to modify or explain this further.`;
  if (lc.includes('explain')) return `Great question! Let me break this down for you as ${modelName}:\n\n**Overview:** This involves several key concepts that work together.\n\n**Key Points:**\n1. First, understand the fundamentals\n2. Then apply them practically\n3. Finally, iterate and improve\n\nWould you like me to go deeper on any specific aspect?`;
  return `I'm ${modelName} and I've processed your request: "${content}"\n\nHere's my response based on my analysis and knowledge. I can help you with a wide range of tasks including:\n• Research and analysis\n• Writing and editing\n• Code generation\n• Problem solving\n\nFeel free to ask follow-up questions!`;
}

function ChatPageInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const initModelId = sp.get('model') || 'claude-sonnet46';
  const initQuery = sp.get('q') || '';

  const [activeModel, setActiveModel] = useState<Model>(() => MODELS_DATA.find(m => m.id === initModelId || m.name === initModelId) || MODELS_DATA.find(m => m.id === 'claude-sonnet46')!);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initQuery);
  const [loading, setLoading] = useState(false);
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [modelSearch, setModelSearch] = useState('');
  const [cpanelTab, setCpanelTab] = useState('use_cases');
  const [cpanelOpen, setCpanelOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [attachments, setAttachments] = useState<{ type: string; url: string; name: string }[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize guest session
  useEffect(() => {
    if (!user) {
      const s = getOrCreateGuestSession(activeModel.id);
      setGuestSession(s);
      if (s.messages.length > 0) setMessages(s.messages);
    }
  }, [user, activeModel.id]);

  // Auto-send initial query
  useEffect(() => {
    if (initQuery && messages.length === 0) {
      setTimeout(() => sendMessage(initQuery), 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const filteredModels = MODELS_DATA.filter(m =>
    !modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase()) || m.lab.toLowerCase().includes(modelSearch.toLowerCase())
  ).slice(0, 200);

  async function sendMessage(text?: string) {
    const content = (text || input).trim();
    if (!content && attachments.length === 0) return;

    if (guestSession && isExpired(guestSession) && !user) {
      setMessages(prev => [...prev, {
        role: 'assistant', content: '⏱ Your guest session has expired (3 hours limit). Please sign up to continue chatting.', timestamp: Date.now(),
      }]);
      return;
    }

    const userMsg: Message = { role: 'user', content, timestamp: Date.now(), attachments: attachments.length > 0 ? [...attachments] : undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setLoading(true);
    setCpanelOpen(false);

    // Save to guest session
    if (!user && guestSession) {
      const updated = addGuestMessage(guestSession, { ...userMsg });
      setGuestSession(updated);
    }

    try {
      let assistantContent: string;
      if (user || process.env.NODE_ENV === 'development') {
        try {
          const { data } = await chatApi.send({
            sessionId: guestSession?.sessionId,
            guestId: guestSession?.guestId,
            modelId: activeModel.id,
            content,
            attachments: userMsg.attachments,
          });
          assistantContent = data.message?.content || getMockResponse(content, activeModel.name);
        } catch {
          assistantContent = getMockResponse(content, activeModel.name);
        }
      } else {
        await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
        assistantContent = getMockResponse(content, activeModel.name);
      }

      const aiMsg: Message = { role: 'assistant', content: assistantContent, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);

      if (!user && guestSession) {
        const updated = addGuestMessage({ ...guestSession, messages: [...guestSession.messages, userMsg] }, { ...aiMsg });
        setGuestSession(updated);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser.');
      return;
    }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.continuous = false; rec.interimResults = true;
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as any[]).map((r: any) => r[0].transcript).join('');
      setInput(transcript);
    };
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  }

  function speakLastMessage() {
    const last = messages.filter(m => m.role === 'assistant').pop();
    if (!last) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const utt = new SpeechSynthesisUtterance(last.content.slice(0, 500));
    utt.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
    setIsSpeaking(true);
  }

  async function openCamera() {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { setCameraOpen(false); alert('Camera access denied.'); }
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const url = canvas.toDataURL('image/jpeg');
    setAttachments(prev => [...prev, { type: 'image', url, name: 'camera-capture.jpg' }]);
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
    setCameraOpen(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments(prev => [...prev, {
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url: ev.target?.result as string,
          name: file.name,
        }]);
      };
      reader.readAsDataURL(file);
    });
  }

  const remainingTime = guestSession ? getRemainingTime(guestSession) : null;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* ── LEFT SIDEBAR: Model List ─────────────────────────────── */}
      <aside style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--white)' }}>
        <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          <input
            value={modelSearch} onChange={e => setModelSearch(e.target.value)}
            placeholder="Search 400+ models..."
            style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid var(--border2)', borderRadius: 8, fontSize: '0.8rem', background: 'var(--bg)', outline: 'none', fontFamily: 'inherit', color: 'var(--text)' }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredModels.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveModel(m)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '0.65rem 0.75rem', border: 'none', textAlign: 'left',
                background: activeModel.id === m.id ? 'var(--accent-lt)' : 'none',
                borderLeft: activeModel.id === m.id ? '3px solid var(--accent)' : '3px solid transparent',
                cursor: 'pointer',
              }}
            >
              <span style={{ width: 28, height: 28, background: m.bg, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{m.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: activeModel.id === m.id ? 600 : 400, color: activeModel.id === m.id ? 'var(--accent)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>{m.lab}</div>
              </div>
              {m.badge && <span className={m.badgeClass} style={{ fontSize: '0.58rem' }}>{m.badge}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* ── CENTER: Chat ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Guest banner */}
        {!user && guestSession && (
          <div style={{ background: 'linear-gradient(90deg, var(--accent-lt), rgba(200,98,42,0.04))', borderBottom: '1px solid var(--accent-border)', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: 'var(--accent)' }}>
            <span>⏱ Guest session — {remainingTime} remaining</span>
            <Link href="/auth/signup" style={{ marginLeft: 'auto' }}>
              <button style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.2rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                Save permanently →
              </button>
            </Link>
          </div>
        )}

        {/* Chat area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{activeModel.icon}</div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Chat with {activeModel.name}
              </h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto' }}>{activeModel.desc}</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: msg.role === 'user' ? 'var(--accent)' : activeModel.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: msg.role === 'user' ? '0.75rem' : '1rem', color: msg.role === 'user' ? 'white' : 'inherit', fontWeight: 700 }}>
                {msg.role === 'user' ? 'U' : activeModel.icon}
              </div>
              <div style={{ maxWidth: '70%' }}>
                <div style={{ background: msg.role === 'user' ? 'var(--accent)' : 'var(--white)', color: msg.role === 'user' ? 'white' : 'var(--text)', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '0.75rem 1rem', fontSize: '0.88rem', lineHeight: 1.6, border: msg.role === 'user' ? 'none' : '1px solid var(--border)', boxShadow: 'var(--shadow)', whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
                {msg.attachments?.map((att, ai) => (
                  <div key={ai} style={{ marginTop: 6 }}>
                    {att.type === 'image' ? <img src={att.url} alt={att.name} style={{ maxWidth: 200, borderRadius: 8, border: '1px solid var(--border)' }} /> : <span style={{ fontSize: '0.75rem', color: 'var(--text2)', background: 'var(--bg2)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>📎 {att.name}</span>}
                  </div>
                ))}
                <div style={{ fontSize: '0.68rem', color: 'var(--text3)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: activeModel.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{activeModel.icon}</div>
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px', padding: '0.75rem 1rem', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, background: 'var(--text3)', borderRadius: '50%', display: 'inline-block', animation: `typingDot 1.4s ${i*0.2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* CPanel — prompt suggestions */}
        {cpanelOpen && (
          <div style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: '0.6rem' }}>
              {CPANEL_TABS.map(tab => (
                <button key={tab.key} onClick={() => setCpanelTab(tab.key)} style={{ padding: '0.3rem 0.75rem', border: '1.5px solid', borderColor: cpanelTab === tab.key ? 'var(--accent)' : 'var(--border2)', borderRadius: '2rem', fontSize: '0.75rem', background: cpanelTab === tab.key ? 'var(--accent-lt)' : 'none', color: cpanelTab === tab.key ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', fontWeight: 500 }}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(CPANEL_DATA[cpanelTab] || []).map((p, i) => (
                <button key={i} onClick={() => { sendMessage(p); setCpanelOpen(false); }} style={{ padding: '0.35rem 0.85rem', border: '1px solid var(--border2)', borderRadius: '2rem', fontSize: '0.78rem', background: 'var(--bg)', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Camera modal */}
        {cameraOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', maxWidth: 400, width: '90%' }}>
              <video ref={videoRef} autoPlay style={{ width: '100%', borderRadius: 8, marginBottom: '1rem' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={capturePhoto} style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.6rem', cursor: 'pointer', fontFamily: 'inherit' }}>📸 Capture</button>
                <button onClick={() => setCameraOpen(false)} style={{ flex: 1, background: 'none', border: '1px solid var(--border2)', borderRadius: '2rem', padding: '0.6rem', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Input area */}
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--white)' }}>
          {attachments.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {attachments.map((att, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--bg2)', borderRadius: 6, padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                  {att.type === 'image' ? '🖼' : '📎'} {att.name}
                  <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: '0.7rem' }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, background: 'var(--bg)', border: '1.5px solid var(--border2)', borderRadius: 16, padding: '0.5rem 0.75rem' }}>
            <textarea
              ref={inputRef}
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={`Message ${activeModel.name}...`}
              rows={1}
              style={{ flex: 1, border: 'none', background: 'transparent', resize: 'none', fontSize: '0.9rem', fontFamily: "'Instrument Sans', sans-serif", color: 'var(--text)', outline: 'none', maxHeight: 120, overflowY: 'auto', lineHeight: 1.5 }}
            />
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
              {/* active model label */}
              <span style={{ fontSize: '0.7rem', color: 'var(--text3)', background: 'var(--bg3)', borderRadius: 6, padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }}>{activeModel.name}</span>
              {/* cpanel toggle */}
              <button onClick={() => setCpanelOpen(v => !v)} title="Prompt suggestions" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: cpanelOpen ? 'var(--accent-lt)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cpanelOpen ? 'var(--accent)' : 'var(--text3)' }}>
                ✦
              </button>
              {/* mic */}
              <button onClick={startVoiceInput} title="Voice input" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: isListening ? 'rgba(220,38,38,0.07)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isListening ? '#dc2626' : 'var(--text3)', animation: isListening ? 'micPulse 0.9s ease-in-out infinite' : 'none' }}>
                🎙
              </button>
              {/* tts */}
              <button onClick={speakLastMessage} title="Read aloud" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSpeaking ? 'var(--accent)' : 'var(--text3)' }}>
                🔊
              </button>
              {/* camera */}
              <button onClick={openCamera} title="Camera" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
                📷
              </button>
              {/* file */}
              <button onClick={() => fileRef.current?.click()} title="Attach file" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
                📎
              </button>
              <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
              {/* send */}
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() && attachments.length === 0}
                style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: (input.trim() || attachments.length > 0) ? 'var(--accent)' : 'var(--border2)', color: 'white', cursor: (input.trim() || attachments.length > 0) ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR: Model Info + Usage ───────────────────── */}
      <aside style={{ width: 280, flexShrink: 0, borderLeft: '1px solid var(--border)', background: 'var(--white)', overflowY: 'auto' }}>
        {/* Active model card */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
            <div style={{ width: 42, height: 42, background: activeModel.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{activeModel.icon}</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem' }}>{activeModel.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{activeModel.org}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {activeModel.badge && <span className={activeModel.badgeClass}>{activeModel.badge}</span>}
            {activeModel.tags.slice(0, 2).map(t => <span key={t} style={{ background: 'var(--bg2)', borderRadius: '2rem', padding: '0.12rem 0.5rem', fontSize: '0.68rem', color: 'var(--text2)' }}>{t}</span>)}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text2)', lineHeight: 1.5, marginBottom: '0.75rem' }}>{activeModel.desc}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{activeModel.context}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Context</div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>⭐ {activeModel.rating}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Rating</div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)' }}>{activeModel.price}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Pricing</div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{activeModel.reviews.toLocaleString()}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Reviews</div>
            </div>
          </div>
        </div>

        {/* Usage overview */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)' }}>Usage Overview</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: '0.75rem', alignItems: 'flex-end' }}>
            {Array.from({length: 24}, (_, i) => Math.floor(Math.random() * 100)).map((h, i) => (
              <div key={i} style={{ flex: 1, background: 'var(--accent)', borderRadius: 2, height: `${Math.max(4, h * 0.4)}px`, opacity: 0.3 + (i / 24) * 0.7 }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[
              { label: 'Requests', value: `${messages.filter(m => m.role === 'user').length}` },
              { label: 'Avg Latency', value: '1.2s' },
              { label: 'Est. Cost', value: '$0.00' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ padding: '1rem' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)' }}>Quick Actions</div>
          {QUICK_ACTIONS.map(group => (
            <div key={group.group} style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text3)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{group.group}</div>
              {group.items.map(item => (
                <button key={item} onClick={() => sendMessage(item)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 0.6rem', marginBottom: 3, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {item}
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text2)' }}>Loading Chat Hub...</div>}>
      <ChatPageInner />
    </Suspense>
  );
}
