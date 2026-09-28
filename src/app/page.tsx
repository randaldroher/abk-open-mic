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
          backgroundImage: "var(--abk-hero-gradient)",
          border: 1,
          borderColor: "divider",
          position: "relative",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.25)",
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
        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Chip
            label="May 2026 historical preview"
            sx={{
              alignSelf: "flex-start",
              color: "primary.light",
            }}
          />
          <Box>
            <Typography variant="overline" sx={{ color: "primary.main" }}>
              A night of live music from ABK colleagues
            </Typography>
            <Typography variant="h1" sx={{ mt: 1, mb: 2 }}>
              {program.title}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, color: "text.secondary", maxWidth: 600 }}>
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
            color: "primary.main",
          },
          { label: "Songs", value: `${program.songs.length} performed songs`, color: "secondary.main" },
          {
            label: "Performers",
            value: `${performerCount} participants`,
            color: "info.main",
          },
          { label: "Equipment", value: `${program.gear.length} recorded items`, color: "primary.main" },
        ].map(({ label, value, color }) => (
          <Paper key={label} variant="outlined" sx={{ p: 3, borderTop: 2, borderTopColor: color }}>
            <Typography color={color} variant="overline">
              {label}
            </Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              {value}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper component="section" variant="outlined" sx={{ p: { xs: 3, sm: 4 }, backgroundImage: "var(--abk-section-gradient)" }}>
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
