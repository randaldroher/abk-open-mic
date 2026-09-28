import type { ReactNode } from "react";
import { Box, Container } from "@mui/material";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <Container component="main" maxWidth="lg" sx={{ flex: 1, py: { xs: 4, md: 7 } }}>
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          borderTop: 1,
          borderColor: "divider",
          backgroundColor: "#0d091b",
          color: "text.secondary",
          py: 3,
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          ABK Open Mic Night
        </Container>
      </Box>
    </>
  );
}
