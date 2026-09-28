"use client";

import { Button, Paper, Stack, Typography } from "@mui/material";

export default function ProgramUnavailable() {
  return (
    <Paper component="section" variant="outlined" sx={{ p: { xs: 3, sm: 5 } }}>
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography component="h2" variant="h2">
          Event information is unavailable
        </Typography>
        <Typography color="textSecondary">
          We could not load a valid program. Please try again in a little while.
        </Typography>
        <Button onClick={() => window.location.reload()} variant="contained">
          Try again
        </Button>
      </Stack>
    </Paper>
  );
}
