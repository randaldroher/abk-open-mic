import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Box } from "@mui/material";
import SiteNavigation from "@/components/site-navigation";
import ThemeProvider from "./theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ABK Open Mic Night",
    template: "%s | ABK Open Mic Night",
  },
  description: "A historical overview of the ABK Open Mic May 2026 performance.",
};

export const viewport: Viewport = {
  themeColor: "#0d091b",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
              <SiteNavigation />
              {children}
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
