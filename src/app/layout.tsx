import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Box, Container } from "@mui/material";
import SiteNavigation from "@/components/site-navigation";
import ThemeProvider from "./theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ABK Open Mic Night",
    template: "%s | ABK Open Mic Night",
  },
  description: "An evening of live music performed by ABK colleagues.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
              <SiteNavigation />
              <Container
                component="main"
                maxWidth="lg"
                sx={{ flex: 1, py: { xs: 4, md: 7 } }}
              >
                {children}
              </Container>
              <Box
                component="footer"
                sx={{
                  borderTop: 1,
                  borderColor: "divider",
                  color: "text.secondary",
                  py: 3,
                  textAlign: "center",
                }}
              >
                <Container maxWidth="lg">
                  ABK Open Mic Night · Sample website content
                </Container>
              </Box>
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
