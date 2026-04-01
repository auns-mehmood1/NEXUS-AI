'use client';
import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { nexusTheme } from '@/lib/theme';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';
import ThemeRegistry from '@/components/ThemeRegistry';

export default function Providers({ children }: { children: React.ReactNode }) {
  const { setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('nexus_access_token');
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(r => {
        const refresh = localStorage.getItem('nexus_refresh_token') || '';
        setAuth(r.data, token, refresh);
      })
      .catch(() => {
        localStorage.removeItem('nexus_access_token');
        localStorage.removeItem('nexus_refresh_token');
      })
      .finally(() => setLoading(false));
  }, [setAuth, setLoading]);

  return (
    <ThemeRegistry options={{ key: 'mui' }}>
      <ThemeProvider theme={nexusTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeRegistry>
  );
}
