import type { ReactNode } from "react";
import { Box, Container, Typography } from "@mui/material";
import LastUpdated from "@/components/last-updated";
import { getHistoricalProgram } from "@/lib/historical-program-data";

export default async function Template({ children }: { children: ReactNode }) {
  const program = await getHistoricalProgram();

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
          ABK Open Mic Night · May 2026 historical preview
          <Typography variant="body2" sx={{ mt: 1 }}>
            {program ? (
              <LastUpdated fetchedAt={program.fetchedAt} />
            ) : (
              "Last updated: unavailable"
            )}
          </Typography>
        </Container>
      </Box>
    </>
  );
}
