import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { getMay2026Program } from "@/lib/may-2026-program-data";
import { getJuly2025Songs, getDecember2025Songs } from "@/lib/past-event-song-data";
import ProgramUnavailable from "@/components/program-unavailable";

type Props = { params: Promise<{ event: string }> };

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

  const eventData = event === "may-2026"
    ? await getMay2026Program()
    : event === "july-2025"
      ? await getJuly2025Songs()
      : await getDecember2025Songs();
  if (!eventData) {
    return <ProgramUnavailable />;
  }
  const songs = eventData.songs;
  const eventLabel = event === "may-2026" ? "May 2026"
    : event === "july-2025" ? "July 2025" : "December 2025";

  return (
    <Stack spacing={3}>
      <Box sx={{ p: { xs: 3, sm: 4 }, borderRadius: 1, backgroundImage: "var(--abk-section-gradient)" }}>
        <Typography variant="overline" color="secondary">
          {eventLabel} archive
        </Typography>
        <Typography variant="h1">Songs</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          The songs performed by the ABK Open Mic musicians.
        </Typography>
      </Box>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" } }}>
        {songs.map((song, index) => (
          <Card key={`${song.title}-${index}`} variant="outlined" sx={{ minWidth: 0, borderTop: 2, borderTopColor: "primary.main" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h3">{song.title}</Typography>
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
    </Stack>
  );
}
