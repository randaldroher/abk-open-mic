import type { ReactNode } from "react";
import { Box, Container, Typography } from "@mui/material";
import LastUpdated from "@/components/last-updated";

export default function SiteFrame({
  children,
  fetchedAt,
}: {
  children: ReactNode;
  fetchedAt?: string | null;
}) {
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
          <Typography component="div">ABK Open Mic</Typography>
          {fetchedAt !== undefined && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {fetchedAt ? <LastUpdated fetchedAt={fetchedAt} /> : "Last updated: unavailable"}
            </Typography>
          )}
        </Container>
      </Box>
    </>
  );
}
