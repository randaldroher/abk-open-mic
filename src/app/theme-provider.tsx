"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { alpha, createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#080511", paper: "#151024" },
    primary: { main: "#00e5ff", contrastText: "#080511" },
    secondary: { main: "#ff4dca", contrastText: "#080511" },
    info: { main: "#ac80ff", contrastText: "#080511" },
    text: { primary: "#f2f5ff", secondary: "#b5c0d8" },
    divider: "rgba(172, 128, 255, 0.25)",
  },
  shape: { borderRadius: 20 },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
    h1: { fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.045em" },
    h2: { fontSize: "clamp(1.65rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.03em" },
    h3: { fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.015em" },
    h6: { fontWeight: 600, lineHeight: 1.5 },
    body1: { lineHeight: 1.75 },
    body2: { lineHeight: 1.65 },
    overline: { fontWeight: 700, letterSpacing: "0.13em", lineHeight: 2 },
    button: { fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        ":root": {
          "--abk-accent-gradient": `linear-gradient(110deg, ${theme.palette.primary.main}, ${theme.palette.info.main} 55%, ${theme.palette.secondary.main})`,
          "--abk-hero-gradient": `radial-gradient(ellipse at 100% 20%, ${alpha(theme.palette.secondary.main, 0.28)}, transparent 55%), radial-gradient(ellipse at 0% 100%, ${alpha(theme.palette.primary.main, 0.16)}, transparent 55%), linear-gradient(125deg, #11102b, ${theme.palette.background.paper} 65%)`,
          "--abk-section-gradient": `linear-gradient(110deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.info.main, 0.14)} 55%, ${alpha(theme.palette.secondary.main, 0.08)})`,
          "--abk-grid": `linear-gradient(${alpha(theme.palette.secondary.main, 0.3)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.24)} 1px, transparent 1px)`,
          "--abk-neon-glow": `0 0 28px ${alpha(theme.palette.secondary.main, 0.16)}, 0 0 60px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
        body: {
          backgroundColor: "#0d091b",
          backgroundImage: `radial-gradient(ellipse at 0% 0%, ${alpha(theme.palette.primary.main, 0.12)}, transparent 45%), radial-gradient(ellipse at 100% 15%, ${alpha(theme.palette.secondary.main, 0.13)}, transparent 45%)`,
          backgroundRepeat: "no-repeat",
        },
        "::selection": {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        },
        "a:focus-visible, button:focus-visible, iframe:focus-visible": {
          outline: `3px solid ${theme.palette.primary.main}`,
          outlineOffset: 4,
        },
      }),
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.09)}, transparent 65%)`,
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
          backgroundColor: "#0d091b",
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          minHeight: 44,
          padding: "10px 22px",
          variants: [
            {
              props: { variant: "contained", color: "primary", disabled: false },
              style: {
                backgroundImage: `linear-gradient(110deg, ${theme.palette.primary.main}, #00ffb3)`,
                boxShadow: `0 0 22px ${alpha(theme.palette.primary.main, 0.24)}`,
                "&:hover": {
                  backgroundImage: "none",
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              },
            },
            {
              props: { variant: "contained", color: "secondary", disabled: false },
              style: {
                backgroundImage: `linear-gradient(110deg, ${theme.palette.secondary.main}, ${theme.palette.info.main})`,
                boxShadow: `0 0 22px ${alpha(theme.palette.secondary.main, 0.28)}`,
                "&:hover": {
                  backgroundImage: "none",
                  backgroundColor: theme.palette.secondary.main,
                  boxShadow: `0 0 30px ${alpha(theme.palette.secondary.main, 0.42)}`,
                },
              },
            },
          ],
        }),
        outlined: ({ theme }) => ({
          borderColor: alpha(theme.palette.primary.main, 0.7),
          "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
        }),
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
          whiteSpace: "normal",
          overflowWrap: "anywhere",
        },
        sizeSmall: { height: "auto", minHeight: 26, paddingBlock: 3 },
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
