import type { ReactNode } from "react";
import { Box, Container, Typography } from "@mui/material";

export default function SiteFrame({
  children,
  top,
  freshness,
}: {
  children: ReactNode;
  top?: ReactNode;
  freshness?: ReactNode;
}) {
  return (
    <>
      {top}
      <Container
        component="main"
        maxWidth="xl"
        sx={{ flex: 1, py: { xs: 4, md: 7 } }}
      >
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: '#0d091b',
          color: 'text.secondary',
          py: 3,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="xl">
          <Typography component="div">ABK Open Mic</Typography>
          {freshness && (
            <Typography component="div" variant="body2" sx={{ mt: 1 }}>
              {freshness}
            </Typography>
          )}
        </Container>
      </Box>
    </>
  );
}
