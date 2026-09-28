"use client";

import { Button, Paper, Stack, Typography } from "@mui/material";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Paper component="section" variant="outlined" sx={{ p: { xs: 3, sm: 5 } }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h2">Event information is unavailable</Typography>
        <Typography color="textSecondary">
          Please try again in a little while.
        </Typography>
        <Button onClick={reset} variant="contained">
          Try again
        </Button>
      </Stack>
    </Paper>
  );
}
