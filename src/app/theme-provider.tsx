"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#070b14", paper: "#111827" },
    primary: { main: "#2dd4bf", contrastText: "#04110f" },
    secondary: { main: "#ff00ff", contrastText: "#180018" },
    info: { main: "#38bdf8" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
    h1: { fontSize: "clamp(2.5rem, 6vw, 4.25rem)", fontWeight: 700, lineHeight: 1.08 },
    h2: { fontSize: "clamp(1.65rem, 4vw, 2.5rem)", fontWeight: 650 },
    h3: { fontSize: "1.35rem", fontWeight: 650 },
    button: { fontWeight: 600, textTransform: "none" },
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
