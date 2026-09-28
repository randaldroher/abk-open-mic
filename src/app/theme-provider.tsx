"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { alpha, createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#090d1b", paper: "#141b30" },
    primary: { main: "#5eead4", contrastText: "#092621" },
    secondary: { main: "#f9a8d4", contrastText: "#351127" },
    info: { main: "#c4b5fd" },
    text: { primary: "#f2f5ff", secondary: "#b5c0d8" },
    divider: "rgba(180, 198, 235, 0.16)",
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
          "--abk-hero-gradient": `radial-gradient(ellipse at 100% 0%, ${alpha(theme.palette.secondary.main, 0.17)}, transparent 55%), linear-gradient(125deg, #123d43, ${theme.palette.background.paper} 65%)`,
          "--abk-section-gradient": `linear-gradient(110deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.info.main, 0.06)} 55%, transparent)`,
        },
        body: {
          backgroundImage: `radial-gradient(ellipse at 0% 0%, ${alpha(theme.palette.primary.main, 0.08)}, transparent 45%), radial-gradient(ellipse at 100% 15%, ${alpha(theme.palette.info.main, 0.09)}, transparent 45%)`,
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
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.04)}, transparent 65%)`,
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0d1325",
          backgroundImage: "var(--abk-section-gradient)",
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
                backgroundImage: `linear-gradient(110deg, ${theme.palette.primary.main}, #a5f3e5)`,
                "&:hover": {
                  backgroundImage: "none",
                  backgroundColor: theme.palette.primary.light,
                },
              },
            },
            {
              props: { variant: "contained", color: "secondary", disabled: false },
              style: {
                backgroundImage: `linear-gradient(110deg, ${theme.palette.secondary.main}, ${theme.palette.info.main})`,
                "&:hover": {
                  backgroundImage: "none",
                  backgroundColor: theme.palette.secondary.light,
                },
              },
            },
          ],
        }),
        outlined: ({ theme }) => ({
          borderColor: alpha(theme.palette.primary.main, 0.5),
          "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
        colorDefault: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.light,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
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
