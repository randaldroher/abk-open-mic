import type { Metadata } from "next";
import { Box, Button, Card, CardActions, CardContent, Stack, Typography } from "@mui/material";
import { PAST_EVENTS } from "@/lib/past-events";

export const metadata: Metadata = {
  title: "Past events",
  description: "Browse archived ABK Open Mic events and song lineups.",
};

export default function PastEventsPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="secondary">ABK Open Mic archive</Typography>
        <Typography variant="h1">Past events</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Browse event overviews and the songs performed.
        </Typography>
      </Box>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" } }}>
        {PAST_EVENTS.map(({ slug, label }) => (
          <Card key={slug} variant="outlined" sx={{ display: "flex", flexDirection: "column", borderTop: 2, borderTopColor: "primary.main" }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h3">ABK Open Mic — {label}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Explore the archived song lineup and event information.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button href={`/past-events/${slug}`}>View event</Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
