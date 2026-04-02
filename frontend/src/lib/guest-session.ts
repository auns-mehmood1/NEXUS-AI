'use client';

const GUEST_KEY = 'nexus_guest_id';
const GUEST_EXPIRY_KEY = 'nexus_guest_expiry';
const GUEST_HISTORY_KEY = 'nexus_guest_history';
const GUEST_SESSION_ID_KEY = 'nexus_guest_session_id';
const GUEST_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

export interface GuestMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: { type: string; url: string; name: string }[];
}

export interface GuestSession {
  guestId: string;
  sessionId: string;
  modelId: string;
  messages: GuestMessage[];
  expiresAt: number;
  createdAt: number;
}

function generateId() {
  return 'guest_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getOrCreateGuestSession(modelId: string): GuestSession {
  if (typeof window === 'undefined') throw new Error('Client only');

  const existing = loadGuestSession();
  if (existing && !isExpired(existing)) return existing;

  // Create fresh
  const now = Date.now();
  const session: GuestSession = {
    guestId: generateId(),
    sessionId: generateId(),
    modelId,
    messages: [],
    expiresAt: now + GUEST_TTL_MS,
    createdAt: now,
  };
  saveGuestSession(session);
  return session;
}

export function loadGuestSession(): GuestSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GUEST_HISTORY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestSession;
  } catch {
    return null;
  }
}

export function saveGuestSession(session: GuestSession) {
  if (typeof window === 'undefined') return;
  // Strip base64 attachment data before persisting — only keep metadata.
  // Large data URIs (images, audio, video, PDFs) quickly exceed the localStorage quota.
  const stripped: GuestSession = {
    ...session,
    messages: session.messages.map((msg) => ({
      ...msg,
      attachments: msg.attachments?.map(({ type, name }) => ({
        type,
        name,
        url: '', // data URL is not persisted
      })),
    })),
  };
  try {
    localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(stripped));
  } catch {
    // If still over quota (e.g. huge message history), silently skip persistence
  }
}

export function isExpired(session: GuestSession): boolean {
  return Date.now() > session.expiresAt;
}

export function getRemainingTime(session: GuestSession): string {
  const ms = session.expiresAt - Date.now();
  if (ms <= 0) return 'Expired';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function clearGuestSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_HISTORY_KEY);
  localStorage.removeItem(GUEST_KEY);
  localStorage.removeItem(GUEST_EXPIRY_KEY);
  localStorage.removeItem(GUEST_SESSION_ID_KEY);
}

export function addGuestMessage(session: GuestSession, msg: GuestMessage): GuestSession {
  const updated = { ...session, messages: [...session.messages, msg] };
  saveGuestSession(updated);
  return updated;
}
