import { Suspense } from "react";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { getMay2026Program } from "@/lib/may-2026-program-data";
import { getJuly2025Songs, getDecember2025Songs } from "@/lib/past-event-song-data";
import type { Song as HistoricalSong } from "@/lib/historical-program";
import type { PastEventSong } from "@/lib/past-event-songs";
import ProgramUnavailable from "@/components/program-unavailable";
import SongCardsSkeleton from "@/components/song-cards-skeleton";

type Props = { params: Promise<{ event: string }> };
type EventSong = HistoricalSong | (PastEventSong & { videoEmbedUrl?: string | null });

export async function generateMetadata({ params }: Props) {
  const { event } = await params;
  const eventLabel = event === "may-2026" ? "May 2026"
    : event === "july-2025" ? "July 2025"
      : event === "december-2025" ? "December 2025"
        : null;
  if (!eventLabel) {
    return { title: "Songs", description: "Archived ABK Open Mic song lineups." };
  }

  return {
    title: `${eventLabel} songs`,
    description: `Songs and performers from the ${eventLabel} ABK Open Mic.`,
  };
}

export default async function SongsPage({ params }: Props) {
  const { event } = await params;
  if (!["may-2026", "july-2025", "december-2025"].includes(event)) {
    notFound();
  }

  return (
    <Stack role="tabpanel" id="event-songs-panel" aria-labelledby="event-songs-tab" spacing={3}>
      <Typography variant="h2">
        {event === "may-2026" ? "Performance order" : "Song lineup"}
      </Typography>
      <Suspense fallback={<SongCardsSkeleton showReferences={event === "may-2026"} />}>
        <SongCards event={event} />
      </Suspense>
    </Stack>
  );
}

async function SongCards({ event }: { event: string }) {
  const eventData = event === "may-2026"
    ? await getMay2026Program()
    : event === "july-2025"
      ? await getJuly2025Songs()
      : await getDecember2025Songs();
  if (!eventData) {
    return <ProgramUnavailable />;
  }
  const songs: EventSong[] = eventData.songs;

  return (
      <Box component="ol" sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, listStyle: "none", p: 0, m: 0 }}>
        {songs.map((song, index) => (
          <Card component="li" key={`${song.title}-${index}`} variant="outlined" sx={{ minWidth: 0 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h3">
                    <Box component="span" sx={{ color: "primary.main", mr: 1 }}>{index + 1}.</Box>
                    {song.title}
                  </Typography>
                  {song.originalArtist && (
                    <Typography color="text.secondary">Originally by {song.originalArtist}</Typography>
                  )}
                </Box>
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                  {song.performers.flatMap((performerRole) =>
                    "performers" in performerRole
                      ? performerRole.performers.map((performer) => (
                          <Chip key={`${performerRole.role}-${performer}`} label={`${performerRole.role}: ${performer}`} size="small" />
                        ))
                      : [(
                          <Chip
                            key={`${performerRole.role}-${performerRole.name}`}
                            label={`${performerRole.role}: ${performerRole.name}`}
                            size="small"
                          />
                        )],
                  )}
                </Stack>
                {"videoEmbedUrl" in song && song.videoEmbedUrl && (
                  <>
                    <Typography color="text.secondary" variant="body2">
                      Song reference video
                    </Typography>
                    <Box sx={{ aspectRatio: "16 / 9", borderRadius: 0.5, overflow: "hidden", bgcolor: "background.default" }}>
                      <iframe
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        src={song.videoEmbedUrl}
                        style={{ border: 0, height: "100%", width: "100%" }}
                        title={`${song.title} song reference on YouTube`}
                      />
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
  );
}
