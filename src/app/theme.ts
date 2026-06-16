import { createTheme, alpha } from '@mui/material/styles'

/**
 * MUI theme derived from the Google Stitch "Lumina Creative" design system.
 * Source tokens: docs/design/lumina-creative.designMd.md
 * Dark-mode first, glassmorphism, high-contrast purple/cyan accents.
 */

const PRIMARY = '#7c4dff'
const PRIMARY_LIGHT = '#cdbdff'
const SECONDARY = '#00c2ff'
const SECONDARY_LIGHT = '#8fd8ff'
const BACKGROUND = '#0f1419'
const SURFACE = '#181c24'
const SURFACE_HIGH = '#262a30'

export const GENERATE_GRADIENT = `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: PRIMARY, light: PRIMARY_LIGHT, contrastText: '#ffffff' },
    secondary: { main: SECONDARY, light: SECONDARY_LIGHT, contrastText: '#003548' },
    error: { main: '#ffb4ab', contrastText: '#690005' },
    background: { default: BACKGROUND, paper: SURFACE },
    text: { primary: '#dfe2ea', secondary: '#cac3d8' },
    divider: alpha('#ffffff', 0.1),
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.33, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43 },
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    overline: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.33, letterSpacing: '0.04em', textTransform: 'uppercase' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: BACKGROUND,
          backgroundImage: `radial-gradient(circle at 50% 0%, ${alpha(PRIMARY, 0.12)} 0%, transparent 60%)`,
          backgroundAttachment: 'fixed',
          overscrollBehavior: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 16, minHeight: 56, fontSize: '1rem', fontWeight: 600 },
        containedPrimary: {
          background: GENERATE_GRADIENT,
          boxShadow: `0 8px 28px ${alpha(PRIMARY, 0.35)}`,
          '&:hover': { boxShadow: `0 10px 32px ${alpha(PRIMARY, 0.45)}` },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${alpha('#ffffff', 0.1)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: SURFACE,
          borderRadius: 24,
          border: `1px solid ${alpha('#ffffff', 0.1)}`,
          boxShadow: `0 12px 40px ${alpha(PRIMARY, 0.1)}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: alpha(SURFACE_HIGH, 0.8),
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 8, borderRadius: 8, backgroundColor: alpha('#ffffff', 0.08) },
        bar: { borderRadius: 8, background: GENERATE_GRADIENT },
      },
    },
  },
})

export default theme
