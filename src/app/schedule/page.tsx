import { Box, Paper, Stack, Typography } from "@mui/material";
import { getHistoricalProgram } from "@/lib/historical-program-data";
import ProgramUnavailable from "@/components/program-unavailable";

export default async function SchedulePage() {
  const program = await getHistoricalProgram();
  if (!program) {
    return <ProgramUnavailable />;
  }
  const { schedule, timeZone } = program;

  return (
    <Stack spacing={3}>
      <Box sx={{ p: { xs: 3, sm: 4 }, borderRadius: 1, backgroundImage: "var(--abk-section-gradient)" }}>
        <Typography variant="overline" color="secondary">
          May 2026 historical preview
        </Typography>
        <Typography variant="h1">Schedule</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          All times are shown in {timeZone}. Operational entries are included alongside songs.
        </Typography>
      </Box>
      {schedule.length === 0 ? (
        <Typography color="text.secondary">
          No historical schedule is available.
        </Typography>
      ) : (
        <Stack component="ol" spacing={1.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
          {schedule.map((slot) => (
            <Paper
              component="li"
              key={`${slot.startsAt}-${slot.title}`}
              variant="outlined"
              sx={{
                alignItems: "center",
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "120px 1fr" },
                p: { xs: 2.5, sm: 3 },
                borderLeft: 3,
                borderLeftColor: slot.originalArtist ? "secondary.main" : "info.main",
              }}
            >
              <Typography color="secondary" variant="h6" sx={{ fontVariantNumeric: "tabular-nums" }}>
                {slot.startsAt}
              </Typography>
              <Box>
                <Typography variant="h3">{slot.title}</Typography>
                <Typography color="text.secondary">
                  {slot.originalArtist ? `Originally by ${slot.originalArtist} · ` : ""}{slot.durationMinutes} minutes
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
