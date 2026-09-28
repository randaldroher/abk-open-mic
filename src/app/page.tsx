import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { getHistoricalProgram } from "@/lib/historical-program-data";

export default async function Home() {
  const program = await getHistoricalProgram();
  const performerCount = new Set(
    program.schedule.flatMap((entry) => entry.performers.flatMap(({ performers }) => performers)),
  ).size;

  return (
    <Stack spacing={4}>
      <Paper
        component="section"
        sx={{
          background:
            "linear-gradient(125deg, #082f49 0%, #0f766e 52%, #ff3dbb 112%)",
          color: "common.white",
          overflow: "hidden",
          p: { xs: 3, sm: 5, md: 7 },
        }}
      >
        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Chip
            label="May 2026 historical preview"
            sx={{
              alignSelf: "flex-start",
              bgcolor: "rgba(255,255,255,0.14)",
              color: "common.white",
            }}
          />
          <Box>
            <Typography variant="overline" sx={{ color: "info.light" }}>
              A night of live music from ABK colleagues
            </Typography>
            <Typography variant="h1" sx={{ mt: 1, mb: 2 }}>
              {program.title}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.88 }}>
              A look back at songs, running order, and equipment from the May 2026 performance.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              href="/schedule"
              variant="contained"
              color="secondary"
            >
              View the schedule
            </Button>
            <Button
              href="/songs"
              variant="outlined"
              sx={{ borderColor: "rgba(255,255,255,0.65)", color: "white" }}
            >
              Browse songs
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
          },
          { label: "Songs", value: `${program.songs.length} performed songs` },
          {
            label: "Performers",
            value: `${performerCount} participants`,
          },
          { label: "Equipment", value: `${program.gear.length} recorded items` },
        ].map(({ label, value }) => (
          <Paper key={label} variant="outlined" sx={{ p: 3 }}>
            <Typography color="text.secondary" variant="overline">
              {label}
            </Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              {value}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper component="section" variant="outlined" sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h2" gutterBottom>
          Historical preview
        </Typography>
        <Typography color="text.secondary">
          This public, read-only view is based on the May 2026 timetable and gear records.
          It omits contact details, spreadsheet calculations, and private planning notes.
        </Typography>
      </Paper>
    </Stack>
  );
}
