"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { alpha, createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: true,
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1600 },
  },
  palette: {
    mode: 'dark',
    background: { default: '#080511', paper: '#151024' },
    primary: { main: '#00e5ff', contrastText: '#080511' },
    secondary: { main: '#ff4dca', contrastText: '#080511' },
    info: { main: '#ac80ff', contrastText: '#080511' },
    text: { primary: '#f2f5ff', secondary: '#b5c0d8' },
    divider: 'rgba(172, 128, 255, 0.25)',
  },
  shape: { borderRadius: 20 },
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    h1: {
      fontFamily: 'var(--font-wordmark), Arial, sans-serif',
      fontSize: 'clamp(3rem, 6vw, 4.5rem)',
      fontWeight: 400,
      lineHeight: 1.08,
      letterSpacing: '0.015em',
    },
    h2: {
      fontFamily: 'var(--font-wordmark), Arial, sans-serif',
      fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
      fontWeight: 400,
      letterSpacing: '0.015em',
    },
    h3: { fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.015em' },
    h6: { fontWeight: 600, lineHeight: 1.5 },
    body1: { lineHeight: 1.75 },
    body2: { lineHeight: 1.65 },
    overline: { fontWeight: 700, letterSpacing: '0.13em', lineHeight: 2 },
    button: {
      fontFamily: 'var(--font-wordmark), Arial, sans-serif',
      fontWeight: 400,
      letterSpacing: '0.035em',
      lineHeight: 1.25,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        ':root': {
          '--abk-accent-gradient': `linear-gradient(110deg, ${theme.palette.primary.main}, ${theme.palette.info.main} 55%, ${theme.palette.secondary.main})`,
          '--abk-hero-gradient': `radial-gradient(ellipse at 100% 20%, rgba(${theme.palette.secondary.mainChannel} / 0.09), transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(${theme.palette.primary.mainChannel} / 0.07), transparent 55%), linear-gradient(125deg, rgba(${theme.palette.info.mainChannel} / 0.035), transparent 65%)`,
          '--abk-section-gradient': `linear-gradient(110deg, rgba(${theme.palette.primary.mainChannel} / 0.018), rgba(${theme.palette.info.mainChannel} / 0.02) 55%, rgba(${theme.palette.secondary.mainChannel} / 0.014))`,
          '--abk-grid': `linear-gradient(rgba(${theme.palette.secondary.mainChannel} / 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(${theme.palette.primary.mainChannel} / 0.08) 1px, transparent 1px)`,
          '--abk-neon-glow': `0 0 28px rgba(${theme.palette.secondary.mainChannel} / 0.08), 0 0 60px rgba(${theme.palette.primary.mainChannel} / 0.04)`,
        },
        body: {
          backgroundColor: '#0d091b',
          backgroundImage: `radial-gradient(ellipse at 0% 0%, rgba(${theme.palette.primary.mainChannel} / 0.045), transparent 45%), radial-gradient(ellipse at 100% 15%, rgba(${theme.palette.secondary.mainChannel} / 0.05), transparent 45%)`,
          backgroundRepeat: 'no-repeat',
        },
        '::selection': {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        },
        'a:focus-visible, button:focus-visible, iframe:focus-visible': {
          outline: `3px solid ${theme.palette.primary.main}`,
          outlineOffset: 4,
        },
      }),
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: `linear-gradient(135deg, rgba(${theme.palette.info.mainChannel} / 0.01), transparent 65%)`,
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
          boxShadow: `0 8px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 ${alpha(theme.palette.info.main, 0.1)}`,
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0d091b',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const verticalPadding =
            (ownerState.size === 'small'
              ? 4
              : ownerState.size === 'large'
                ? 8
                : 6) - (ownerState.variant === 'outlined' ? 1 : 0);

          return {
            borderRadius: 12,
            fontSize: '1.125rem',
            // Bebas Neue's visible glyphs sit slightly high in its line box.
            paddingTop: verticalPadding + 1,
            paddingBottom: verticalPadding - 1,
            variants: [
              {
                props: {
                  variant: 'outlined',
                  color: 'secondary',
                },
                style: {
                  color: theme.palette.text.primary,
                  backgroundImage: `linear-gradient(110deg, rgba(${theme.palette.secondary.darkChannel} / 0.3), rgba(${theme.palette.info.darkChannel} / 0.3))`,
                  boxShadow: `0 0 22px ${alpha(theme.palette.secondary.main, 0.2)}`,
                  textShadow: `0 0 22px ${alpha(theme.palette.common.black, 0.8)}`,
                  '&:hover': {
                    backgroundImage: 'none',
                    backgroundColor: `rgba(${theme.palette.secondary.darkChannel} / 0.25)`,
                    boxShadow: `0 0 30px ${alpha(theme.palette.secondary.main, 0.3)}`,
                  },
                },
              },
            ],
          };
        },
        sizeLarge: { fontSize: '1.25rem' },
        sizeSmall: { fontSize: '1rem' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 400,
          letterSpacing: '0.035em',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
        colorDefault: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.main,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        }),
        label: {
          whiteSpace: 'normal',
          overflowWrap: 'anywhere',
        },
        sizeSmall: { height: 'auto', minHeight: 26, paddingBlock: 3 },
      },
    },
  },
});

export default function ThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
