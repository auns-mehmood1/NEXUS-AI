import { createTheme } from '@mui/material/styles';

export const nexusTheme = createTheme({
  palette: {
    mode: 'light',
    primary:   { main: '#C8622A', light: '#FDF1EB', dark: '#A34D1E' },
    secondary: { main: '#1E4DA8', light: '#EBF0FC' },
    background:{ default: '#F4F2EE', paper: '#FFFFFF' },
    text:      { primary: '#1C1A16', secondary: '#5A5750', disabled: '#9E9B93' },
    success:   { main: '#2E9E5B' },
    error:     { main: '#9B2042' },
    warning:   { main: '#8A5A00' },
    info:      { main: '#0A5E49' },
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
