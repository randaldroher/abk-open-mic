import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { getHistoricalProgram } from "@/lib/historical-program-data";

export default async function SongsPage() {
  const { songs } = await getHistoricalProgram();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="secondary">
          May 2026 historical preview
        </Typography>
        <Typography variant="h1">Songs</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          The songs performed by the ABK Open Mic musicians.
        </Typography>
      </Box>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" } }}>
        {songs.map((song) => (
          <Card key={song.title} variant="outlined">
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h3">{song.title}</Typography>
                  <Typography color="text.secondary">Originally by {song.originalArtist}</Typography>
                </Box>
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                  {song.performers.flatMap(({ role, performers }) =>
                    performers.map((performer) => (
                      <Chip key={`${role}-${performer}`} label={`${role}: ${performer}`} size="small" />
                    )),
                  )}
                </Stack>
                {song.videoEmbedUrl && (
                  <Box sx={{ aspectRatio: "16 / 9" }}>
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      src={song.videoEmbedUrl}
                      style={{ border: 0, height: "100%", width: "100%" }}
                      title={`${song.title} on YouTube`}
                    />
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
