import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  maxBodyLength: 50 * 1024 * 1024,  // 50 MB
  maxContentLength: 50 * 1024 * 1024,
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nexus_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('nexus_refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh });
          localStorage.setItem('nexus_access_token', data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem('nexus_access_token');
          localStorage.removeItem('nexus_refresh_token');
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ── Models ────────────────────────────────────────────────────
export const modelsApi = {
  list: (params?: { search?: string; type?: string; lab?: string; maxPrice?: number }) =>
    api.get('/models', { params }),
  get: (id: string) => api.get(`/models/${id}`),
};

export const contentApi = {
  public: () => api.get('/content/public'),
};

// ── Chat ──────────────────────────────────────────────────────
export const chatApi = {
  createSession: (data: { modelId: string; isGuest?: boolean }) =>
    api.post('/chat/session', data),
  send: (data: {
    sessionId?: string;
    guestId?: string;
    modelId: string;
    content: string;
    attachments?: { type: string; url: string; name: string }[];
  }) => api.post('/chat/send', data),
  history: () => api.get('/chat/history'),
  deleteSession: (id: string) => api.delete(`/chat/session/${id}`),
  migrate: (guestId: string) => api.post('/chat/migrate', { guestId }),
};

// ── Upload ────────────────────────────────────────────────────
export const uploadApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  usage: () => api.get('/dashboard/usage'),
};

// ── Forms ─────────────────────────────────────────────────────
export const formsApi = {
  contact: (data: { name: string; email: string; message: string }) =>
    api.post('/forms/contact', data),
  feedback: (data: { rating: number; message: string; email?: string }) =>
    api.post('/forms/feedback', data),
};
