import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import PageBreadcrumbs from "@/components/page-breadcrumbs";
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

function EventVideos() {
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

function EventArchive({
  title,
  description,
  songs,
  eventLabel,
  note,
}: {
  title: string;
  description: string;
  songs: Array<{ title: string; originalArtist: string | null }>;
  eventLabel: string;
  note?: ReactNode;
}) {
  return (
    <Stack spacing={4}>
      <Box>
        <PageBreadcrumbs items={[
          { label: "Past events", href: "/past-events" },
          { label: eventLabel },
        ]} />
        <Typography variant="h1">{title}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      </Box>
      <EventVideos />
      <EventSongs songs={songs} />
      {note}
    </Stack>
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
    return (
      <EventArchive
        title={program.title}
        description="Songs, running order, and equipment from the May 2026 performance."
        songs={program.songs}
        eventLabel={pastEvent.label}
        note={(
          <Paper component="section" variant="outlined" sx={{ p: { xs: 3, sm: 4 }, backgroundImage: "var(--abk-section-gradient)" }}>
            <Typography variant="h2" gutterBottom>Historical archive</Typography>
            <Typography color="text.secondary">
              This public, read-only view is based on the May 2026 timetable and gear records.
              It omits contact details, spreadsheet calculations, and private planning notes.
            </Typography>
          </Paper>
        )}
      />
    );
  }

  const eventData = event === "july-2025"
    ? await getJuly2025Songs()
    : await getDecember2025Songs();
  if (!eventData) {
    return <ProgramUnavailable />;
  }

  return (
    <EventArchive
      title={eventData.eventTitle}
      description="Explore the songs and musicians from this past event."
      songs={eventData.songs}
      eventLabel={pastEvent.label}
    />
  );
}
