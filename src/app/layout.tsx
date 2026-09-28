import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Bebas_Neue } from 'next/font/google';
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Box } from "@mui/material";
import SiteNavigation from "@/components/site-navigation";
import ThemeProvider from "./theme-provider";
import "./globals.css";

const wordmarkFont = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-wordmark',
});

export const metadata: Metadata = {
  title: {
    default: "ABK Open Mic",
    template: "%s | ABK Open Mic",
  },
  description: "Sign up for the next ABK Open Mic or explore past event archives.",
};

export const viewport: Viewport = {
  themeColor: "#0d091b",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={wordmarkFont.variable}>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <Box
              sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <SiteNavigation />
              {children}
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
