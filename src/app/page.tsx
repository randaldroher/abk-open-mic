import type { Metadata } from "next";
import { Box, Button, Card, CardActions, CardContent, Paper, Stack, Typography } from "@mui/material";
import { PAST_EVENTS } from "@/lib/past-events";

const SIGNUP_URL = "https://docs.google.com/spreadsheets/d/17jHvnjnWp5x6lne5SrOMFQBtISrYMeo7o0jethdRKHA/edit#gid=1747009845";
const SLACK_URL = "https://abk.slack.com/archives/C091Y02RLJC";

export const metadata: Metadata = {
  title: "Join the next ABK Open Mic",
  description: "Sign up to perform at the next ABK Open Mic and connect with the community.",
};

export default function Home() {
  return (
    <Stack spacing={5}>
      <Paper
        component="section"
        sx={{
          backgroundImage: "var(--abk-hero-gradient)",
          border: 1,
          borderColor: "divider",
          position: "relative",
          boxShadow: "var(--abk-neon-glow)",
          overflow: "hidden",
          p: { xs: 3, sm: 5, md: 7 },
          "&::before": {
            content: '""',
            position: "absolute",
            inset: "0 0 auto",
            height: 4,
            backgroundImage: "var(--abk-accent-gradient)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            pointerEvents: "none",
            inset: "35% -20% -45% 25%",
            backgroundImage: "var(--abk-grid)",
            backgroundSize: "48px 48px",
            transform: "perspective(400px) rotateX(55deg) rotateZ(-12deg)",
            maskImage: "linear-gradient(110deg, transparent 20%, black)",
          },
        }}
      >
        <Stack spacing={3} sx={{ maxWidth: 760, position: "relative", zIndex: 1 }}>
          <Typography variant="overline" sx={{ color: "primary.main" }}>
            Activision · Blizzard · King
          </Typography>
          <Box>
            <Typography variant="h1">Join the next ABK Open Mic</Typography>
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 400, color: "text.secondary", maxWidth: 680 }}>
              Sign up to play a song, sing along, or join the conversation with fellow music makers.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              component="a"
              href={SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="secondary"
              size="large"
            >
              Sign up in the spreadsheet
            </Button>
            <Button
              component="a"
              href={SLACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="large"
            >
              Join ABK Open Mic on Slack
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box component="section" aria-labelledby="past-events-heading">
        <Stack spacing={2}>
          <Box>
            <Typography id="past-events-heading" variant="h2">Past events</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Explore past ABK Open Mic song lineups and event details.
            </Typography>
          </Box>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" } }}>
            {PAST_EVENTS.map(({ slug, label }) => (
              <Card key={slug} variant="outlined" sx={{ display: "flex", flexDirection: "column", borderTop: 2, borderTopColor: "primary.main" }}>
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h3">ABK Open Mic — {label}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Browse the archived song lineup.
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button href={`/past-events/${slug}`}>View event</Button>
                </CardActions>
              </Card>
            ))}
          </Box>
          <Button href="/past-events" variant="text" sx={{ alignSelf: "flex-start" }}>
            Browse all past events
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
