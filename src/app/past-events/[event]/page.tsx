import type { Metadata } from "next";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import ProgramUnavailable from "@/components/program-unavailable";
import { getMay2026Program } from "@/lib/may-2026-program-data";
import { getDecember2025Songs, getJuly2025Songs } from "@/lib/past-event-song-data";
import { getPastEvent } from "@/lib/past-events";

type Props = { params: Promise<{ event: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { event } = await params;
  const pastEvent = getPastEvent(event);
  return pastEvent
    ? {
        title: `${pastEvent.label} archive`,
        description: `Archived ABK Open Mic songs and event details from ${pastEvent.label}.`,
      }
    : { title: "Event not found" };
}

function RecordingPlaceholder() {
  return (
    <Paper component="section" variant="outlined" sx={{ p: { xs: 3, sm: 4 }, backgroundImage: "var(--abk-section-gradient)" }}>
      <Typography variant="h2" gutterBottom>Event videos</Typography>
      <Typography color="text.secondary">
        Videos will be added in a future update.
      </Typography>
    </Paper>
  );
}

function EventSongs({ songs }: { songs: Array<{ title: string; originalArtist: string | null }> }) {
  return (
    <Box component="section" aria-labelledby="song-lineup-heading">
      <Stack spacing={2}>
        <Typography id="song-lineup-heading" variant="h2">Song lineup</Typography>
        <Stack component="ol" spacing={1} sx={{ listStyle: "none", p: 0, m: 0 }}>
          {songs.map((song, index) => (
            <Paper component="li" key={`${song.title}-${index}`} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h3">{song.title}</Typography>
              {song.originalArtist && (
                <Typography color="text.secondary">Originally by {song.originalArtist}</Typography>
              )}
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

export default async function PastEventPage({ params }: Props) {
  const { event } = await params;
  const pastEvent = getPastEvent(event);
  if (!pastEvent) {
    notFound();
  }

  if (event === "may-2026") {
    const program = await getMay2026Program();
    if (!program) {
      return <ProgramUnavailable />;
    }
    const performerCount = new Set(
      program.schedule.flatMap((entry) => entry.performers.flatMap(({ performers }) => performers)),
    ).size;

    return (
      <Stack spacing={4}>
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
          }}
        >
          <Stack spacing={3} sx={{ maxWidth: 720, position: "relative", zIndex: 1 }}>
            <Chip label="May 2026 archive" sx={{ alignSelf: "flex-start", color: "primary.main" }} />
            <Box>
              <Typography variant="overline" sx={{ color: "primary.main" }}>
                A night of live music from ABK colleagues
              </Typography>
              <Typography variant="h1" sx={{ mt: 1, mb: 2 }}>{program.title}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 400, color: "text.secondary", maxWidth: 600 }}>
                Songs, running order, and equipment from the May 2026 performance.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button href="/past-events/may-2026/schedule" variant="contained" color="secondary">
                View the schedule
              </Button>
              <Button href="/past-events/may-2026/songs" variant="outlined">
                Browse songs
              </Button>
              <Button href="/past-events/may-2026/gear" variant="outlined">
                View gear
              </Button>
            </Stack>
          </Stack>
        </Paper>
        <Box
          component="section"
          aria-label="Event details"
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          }}
        >
          {[
            {
              label: "Performance window",
              value: `${program.schedule[0].startsAt}–${program.schedule.at(-1)?.endsAt} ${program.timeZone}`,
              color: "primary.main",
            },
            { label: "Songs", value: `${program.songs.length} performed songs`, color: "secondary.main" },
            { label: "Performers", value: `${performerCount} participants`, color: "info.main" },
            { label: "Equipment", value: `${program.gear.length} recorded items`, color: "primary.main" },
          ].map(({ label, value, color }) => (
            <Paper key={label} variant="outlined" sx={{ p: 3, borderTop: 2, borderTopColor: color }}>
              <Typography color={color} variant="overline">{label}</Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>{value}</Typography>
            </Paper>
          ))}
        </Box>
        <EventSongs songs={program.songs} />
        <RecordingPlaceholder />
        <Paper component="section" variant="outlined" sx={{ p: { xs: 3, sm: 4 }, backgroundImage: "var(--abk-section-gradient)" }}>
          <Typography variant="h2" gutterBottom>Historical archive</Typography>
          <Typography color="text.secondary">
            This public, read-only view is based on the May 2026 timetable and gear records.
            It omits contact details, spreadsheet calculations, and private planning notes.
          </Typography>
        </Paper>
      </Stack>
    );
  }

  const eventData = event === "july-2025"
    ? await getJuly2025Songs()
    : await getDecember2025Songs();
  if (!eventData) {
    return <ProgramUnavailable />;
  }

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" color="secondary">ABK Open Mic archive</Typography>
        <Typography variant="h1">{eventData.eventTitle}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Explore the songs and musicians from this past event.
        </Typography>
      </Box>
      <EventSongs songs={eventData.songs} />
      <RecordingPlaceholder />
    </Stack>
  );
}
