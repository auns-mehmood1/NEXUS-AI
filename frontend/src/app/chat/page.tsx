'use client';
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { chatApi } from '@/lib/api';
import {
  addGuestMessage,
  getOrCreateGuestSession,
  getRemainingTime,
  isExpired,
  saveGuestSession,
  type GuestSession,
} from '@/lib/guest-session';
import { useModels, usePublicContent, type Model } from '@/lib/catalog';
import { useAuthStore } from '@/store/auth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: { type: string; url: string; name: string }[];
}

const DEFAULT_MODEL_ID = 'claude-sonnet46';

function isPersistedSessionId(value?: string) {
  return Boolean(value && /^[a-fA-F0-9]{24}$/.test(value));
}

function ChatPageInner() {
  const sp = useSearchParams();
  const { user } = useAuthStore();
  const { data: models = [], isLoading: modelsLoading } = useModels();
  const { data: content, isLoading: contentLoading } = usePublicContent();

  const initModelId = sp.get('model') || DEFAULT_MODEL_ID;
  const initQuery = sp.get('q') || '';

  const [activeModelId, setActiveModelId] = useState(initModelId);
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

  const activeModel = useMemo(() => {
    if (models.length === 0) return null;
    return (
      models.find((model) => model.id === activeModelId) ||
      models.find((model) => model.id === initModelId || model.name === initModelId) ||
      models.find((model) => model.id === DEFAULT_MODEL_ID) ||
      models[0]
    );
  }, [activeModelId, initModelId, models]);

  const filteredModels = useMemo(
    () =>
      models
        .filter(
          (model) =>
            !modelSearch ||
            model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
            model.lab.toLowerCase().includes(modelSearch.toLowerCase()),
        )
        .slice(0, 200),
    [modelSearch, models],
  );

  const usageBars = useMemo(() => {
    const now = Date.now();
    const buckets = Array.from({ length: 24 }, () => 0);

    for (const message of messages) {
      const diffHours = Math.floor((now - message.timestamp) / 3600000);
      if (diffHours >= 0 && diffHours < 24) {
        buckets[23 - diffHours] += 1;
      }
    }

    return buckets;
  }, [messages]);

  const usageMax = Math.max(...usageBars, 1);
  const requestCount = messages.filter((message) => message.role === 'user').length;
  const replyCount = messages.filter((message) => message.role === 'assistant').length;
  const attachmentCount = messages.reduce((count, message) => count + (message.attachments?.length ?? 0), 0);
  const chatPanel = content?.chatPanel;
  const promptTabs = chatPanel?.tabs ?? [];
  const promptSuggestions = chatPanel?.prompts?.[cpanelTab] ?? [];
  const quickActions = chatPanel?.quickActions ?? [];

  useEffect(() => {
    if (models.length === 0) return;

    const resolved =
      models.find((model) => model.id === initModelId || model.name === initModelId) ||
      models.find((model) => model.id === DEFAULT_MODEL_ID) ||
      models[0];

    setActiveModelId((current) =>
      models.some((model) => model.id === current) ? current : resolved.id,
    );
  }, [initModelId, models]);

  useEffect(() => {
    if (promptTabs.length === 0) return;
    if (!promptTabs.some((tab) => tab.key === cpanelTab)) {
      setCpanelTab(promptTabs[0].key);
    }
  }, [cpanelTab, promptTabs]);

  useEffect(() => {
    if (!user && activeModel) {
      const session = getOrCreateGuestSession(activeModel.id);
      const syncedSession =
        session.modelId === activeModel.id ? session : { ...session, modelId: activeModel.id };
      if (syncedSession !== session) {
        saveGuestSession(syncedSession);
      }
      setGuestSession(syncedSession);
      if (syncedSession.messages.length > 0) setMessages(syncedSession.messages);
    }
  }, [activeModel, user]);

  useEffect(() => {
    if (initQuery && messages.length === 0 && activeModel) {
      const timeout = setTimeout(() => {
        void sendMessage(initQuery);
      }, 500);

      return () => clearTimeout(timeout);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModel, initQuery, messages.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    if (!activeModel) return;

    const contentToSend = (text || input).trim();
    if (!contentToSend && attachments.length === 0) return;

    if (guestSession && isExpired(guestSession) && !user) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Guest session expired (3 hours limit). Please sign up to continue chatting.',
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    const userMsg: Message = {
      role: 'user',
      content: contentToSend,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setLoading(true);
    setCpanelOpen(false);

    let nextGuestSession = guestSession;
    if (!user && guestSession) {
      nextGuestSession = addGuestMessage(
        { ...guestSession, modelId: activeModel.id },
        { ...userMsg },
      );
      setGuestSession(nextGuestSession);
    }

    try {
      const { data } = await chatApi.send({
        sessionId: isPersistedSessionId(nextGuestSession?.sessionId)
          ? nextGuestSession?.sessionId
          : undefined,
        guestId: nextGuestSession?.guestId,
        modelId: activeModel.id,
        content: contentToSend,
        attachments: userMsg.attachments,
      });

      const aiMsg: Message = {
        role: 'assistant',
        content: data.message?.content || 'The chat service returned an empty response.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (!user && nextGuestSession) {
        const syncedSession = {
          ...nextGuestSession,
          sessionId:
            typeof data.sessionId === 'string'
              ? data.sessionId
              : nextGuestSession.sessionId,
          modelId: activeModel.id,
        };
        saveGuestSession(syncedSession);
        const updated = addGuestMessage(syncedSession, { ...aiMsg });
        setGuestSession(updated);
      }
    } catch {
      const failureMsg: Message = {
        role: 'assistant',
        content: 'I could not reach the chat service. Please try again.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, failureMsg]);

      if (!user && nextGuestSession) {
        const updated = addGuestMessage(nextGuestSession, failureMsg);
        setGuestSession(updated);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as any[])
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(transcript);
    };
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  }

  function speakLastMessage() {
    const last = messages.filter((message) => message.role === 'assistant').pop();
    if (!last) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(last.content.slice(0, 500));
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  async function openCamera() {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraOpen(false);
      alert('Camera access denied.');
    }
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const url = canvas.toDataURL('image/jpeg');
    setAttachments((prev) => [...prev, { type: 'image', url, name: 'camera-capture.jpg' }]);
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    setCameraOpen(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments((prev) => [
          ...prev,
          {
            type: file.type.startsWith('image/') ? 'image' : 'file',
            url: ev.target?.result as string,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }

  const remainingTime = guestSession ? getRemainingTime(guestSession) : null;

  if (modelsLoading || contentLoading || !activeModel) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text2)' }}>
        Loading Chat Hub...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', background: 'var(--bg)' }}>
      <aside style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--white)' }}>
        <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          <input
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
            placeholder="Search 400+ models..."
            style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid var(--border2)', borderRadius: 8, fontSize: '0.8rem', background: 'var(--bg)', outline: 'none', fontFamily: 'inherit', color: 'var(--text)' }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredModels.map((model) => (
            <button
              key={model.id}
              onClick={() => setActiveModelId(model.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '0.65rem 0.75rem',
                border: 'none',
                textAlign: 'left',
                background: activeModel.id === model.id ? 'var(--accent-lt)' : 'none',
                borderLeft:
                  activeModel.id === model.id
                    ? '3px solid var(--accent)'
                    : '3px solid transparent',
                cursor: 'pointer',
              }}
            >
              <span style={{ width: 28, height: 28, background: model.bg, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{model.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: activeModel.id === model.id ? 600 : 400, color: activeModel.id === model.id ? 'var(--accent)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{model.name}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>{model.lab}</div>
              </div>
              {model.badge && <span className={model.badgeClass} style={{ fontSize: '0.58rem' }}>{model.badge}</span>}
            </button>
          ))}
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!user && guestSession && (
          <div style={{ background: 'linear-gradient(90deg, var(--accent-lt), rgba(91,79,233,0.04))', borderBottom: '1px solid var(--accent-border)', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: 'var(--accent)' }}>
            <span>Guest session - {remainingTime} remaining</span>
            <Link href="/auth/signup" style={{ marginLeft: 'auto' }}>
              <button style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.2rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                Save permanently -&gt;
              </button>
            </Link>
          </div>
        )}

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

          {messages.map((message, index) => (
            <div key={index} style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexDirection: message.role === 'user' ? 'row-reverse' : 'row', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: message.role === 'user' ? 'var(--accent)' : activeModel.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: message.role === 'user' ? '0.75rem' : '1rem', color: message.role === 'user' ? 'white' : 'inherit', fontWeight: 700 }}>
                {message.role === 'user' ? 'U' : activeModel.icon}
              </div>
              <div style={{ maxWidth: '70%' }}>
                <div style={{ background: message.role === 'user' ? 'var(--accent)' : 'var(--white)', color: message.role === 'user' ? 'white' : 'var(--text)', borderRadius: message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '0.75rem 1rem', fontSize: '0.88rem', lineHeight: 1.6, border: message.role === 'user' ? 'none' : '1px solid var(--border)', boxShadow: 'var(--shadow)', whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </div>
                {message.attachments?.map((attachment, attachmentIndex) => (
                  <div key={attachmentIndex} style={{ marginTop: 6 }}>
                    {attachment.type === 'image' ? <img src={attachment.url} alt={attachment.name} style={{ maxWidth: 200, borderRadius: 8, border: '1px solid var(--border)' }} /> : <span style={{ fontSize: '0.75rem', color: 'var(--text2)', background: 'var(--bg2)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>File: {attachment.name}</span>}
                  </div>
                ))}
                <div style={{ fontSize: '0.68rem', color: 'var(--text3)', marginTop: 4, textAlign: message.role === 'user' ? 'right' : 'left' }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: activeModel.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{activeModel.icon}</div>
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px', padding: '0.75rem 1rem', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map((dot) => <span key={dot} style={{ width: 6, height: 6, background: 'var(--text3)', borderRadius: '50%', display: 'inline-block', animation: `typingDot 1.4s ${dot * 0.2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {cpanelOpen && (
          <div style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: '0.6rem' }}>
              {promptTabs.map((tab) => (
                <button key={tab.key} onClick={() => setCpanelTab(tab.key)} style={{ padding: '0.3rem 0.75rem', border: '1.5px solid', borderColor: cpanelTab === tab.key ? 'var(--accent)' : 'var(--border2)', borderRadius: '2rem', fontSize: '0.75rem', background: cpanelTab === tab.key ? 'var(--accent-lt)' : 'none', color: cpanelTab === tab.key ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', fontWeight: 500 }}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {promptSuggestions.map((prompt, index) => (
                <button key={index} onClick={() => { void sendMessage(prompt); setCpanelOpen(false); }} style={{ padding: '0.35rem 0.85rem', border: '1px solid var(--border2)', borderRadius: '2rem', fontSize: '0.78rem', background: 'var(--bg)', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {cameraOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', maxWidth: 400, width: '90%' }}>
              <video ref={videoRef} autoPlay style={{ width: '100%', borderRadius: 8, marginBottom: '1rem' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={capturePhoto} style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '2rem', padding: '0.6rem', cursor: 'pointer', fontFamily: 'inherit' }}>Capture</button>
                <button onClick={() => setCameraOpen(false)} style={{ flex: 1, background: 'none', border: '1px solid var(--border2)', borderRadius: '2rem', padding: '0.6rem', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--white)' }}>
          {attachments.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {attachments.map((attachment, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--bg2)', borderRadius: 6, padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                  {attachment.type === 'image' ? 'Image:' : 'File:'} {attachment.name}
                  <button onClick={() => setAttachments((prev) => prev.filter((_, attachmentIndex) => attachmentIndex !== index))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: '0.7rem' }}>x</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, background: 'var(--bg)', border: '1.5px solid var(--border2)', borderRadius: 16, padding: '0.5rem 0.75rem' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${activeModel.name}...`}
              rows={1}
              style={{ flex: 1, border: 'none', background: 'transparent', resize: 'none', fontSize: '0.9rem', fontFamily: "'Instrument Sans', sans-serif", color: 'var(--text)', outline: 'none', maxHeight: 120, overflowY: 'auto', lineHeight: 1.5 }}
            />
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text3)', background: 'var(--bg3)', borderRadius: 6, padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }}>{activeModel.name}</span>
              <button onClick={() => setCpanelOpen((open) => !open)} title="Prompt suggestions" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: cpanelOpen ? 'var(--accent-lt)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cpanelOpen ? 'var(--accent)' : 'var(--text3)' }}>
                AI
              </button>
              <button onClick={startVoiceInput} title="Voice input" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: isListening ? 'rgba(220,38,38,0.07)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isListening ? '#dc2626' : 'var(--text3)', animation: isListening ? 'micPulse 0.9s ease-in-out infinite' : 'none' }}>
                Mic
              </button>
              <button onClick={speakLastMessage} title="Read aloud" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSpeaking ? 'var(--accent)' : 'var(--text3)' }}>
                Audio
              </button>
              <button onClick={openCamera} title="Camera" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
                Cam
              </button>
              <button onClick={() => fileRef.current?.click()} title="Attach file" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
                File
              </button>
              <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
              <button
                onClick={() => void sendMessage()}
                disabled={!input.trim() && attachments.length === 0}
                style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: input.trim() || attachments.length > 0 ? 'var(--accent)' : 'var(--border2)', color: 'white', cursor: input.trim() || attachments.length > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside style={{ width: 280, flexShrink: 0, borderLeft: '1px solid var(--border)', background: 'var(--white)', overflowY: 'auto' }}>
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
            {activeModel.tags.slice(0, 2).map((tag) => <span key={tag} style={{ background: 'var(--bg2)', borderRadius: '2rem', padding: '0.12rem 0.5rem', fontSize: '0.68rem', color: 'var(--text2)' }}>{tag}</span>)}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text2)', lineHeight: 1.5, marginBottom: '0.75rem' }}>{activeModel.desc}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{activeModel.context}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Context</div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Rating {activeModel.rating}</div>
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

        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)' }}>Usage Overview</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: '0.75rem', alignItems: 'flex-end' }}>
            {usageBars.map((value, index) => (
              <div key={index} style={{ flex: 1, background: 'var(--accent)', borderRadius: 2, height: `${Math.max(4, (value / usageMax) * 40)}px`, opacity: 0.3 + (index / 24) * 0.7 }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[
              { label: 'Requests', value: `${requestCount}` },
              { label: 'Replies', value: `${replyCount}` },
              { label: 'Files', value: `${attachmentCount}` },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{stat.value}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text3)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '1rem' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)' }}>Quick Actions</div>
          {quickActions.map((group) => (
            <div key={group.group} style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text3)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{group.group}</div>
              {group.items.map((item) => (
                <button key={item} onClick={() => void sendMessage(item)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 0.6rem', marginBottom: 3, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit' }}>
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
