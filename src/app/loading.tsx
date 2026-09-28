import { Paper, Typography } from "@mui/material";

export default function Loading() {
  return (
    <Paper component="section" variant="outlined" sx={{ p: { xs: 3, sm: 5 } }} role="status">
      <Typography variant="h2">Loading event information…</Typography>
    </Paper>
  );
}
