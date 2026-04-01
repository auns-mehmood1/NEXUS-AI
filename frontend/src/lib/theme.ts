import { createTheme } from '@mui/material/styles';

export const nexusTheme = createTheme({
  palette: {
    mode: 'light',
    primary:   { main: '#5B4FE9', light: '#EDECFD', dark: '#3D31CC' },
    secondary: { main: '#2563EB', light: '#EFF6FF' },
    background:{ default: '#F5F7FF', paper: '#FFFFFF' },
    text:      { primary: '#0F1033', secondary: '#3D4270', disabled: '#8B90B8' },
    success:   { main: '#16A34A' },
    error:     { main: '#DC2626' },
    warning:   { main: '#B45309' },
    info:      { main: '#0D9488' },
  },
  typography: {
    fontFamily: "'Instrument Sans', sans-serif",
    h1: { fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '-0.04em' },
    h2: { fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '-0.03em' },
    h3: { fontFamily: "'Syne', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Syne', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Syne', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Syne', sans-serif", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '2rem',
          fontFamily: "'Instrument Sans', sans-serif",
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontFamily: "'Instrument Sans', sans-serif" } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.08)',
        },
      },
    },
  },
});
