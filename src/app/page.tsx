import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { getPublicProgram } from "@/lib/program-data";

export default async function Home() {
  const program = await getPublicProgram();

  if (!program.event) {
    return (
      <Paper component="section" variant="outlined" sx={{ p: { xs: 3, sm: 5 } }}>
        <Typography variant="h1" gutterBottom>
          No event published yet
        </Typography>
        <Typography color="text.secondary">
          Check back later for event details and the running order.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={4}>
      <Paper
        component="section"
        sx={{
          background:
            "linear-gradient(125deg, #082f49 0%, #0f766e 52%, #ff00ff 112%)",
          color: "common.white",
          overflow: "hidden",
          p: { xs: 3, sm: 5, md: 7 },
        }}
      >
        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Chip
            label="Sample content — event details and performer consent are not configured"
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
              {program.event.title}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.88 }}>
              A welcoming stage for colleagues to share the music they love making.
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
              href="/acts"
              variant="outlined"
              sx={{ borderColor: "rgba(255,255,255,0.65)", color: "white" }}
            >
              Meet the acts
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
            label: "When",
            value: new Intl.DateTimeFormat("en", {
              dateStyle: "full",
              timeZone: program.event.timeZone,
            }).format(new Date(program.event.startsAt)),
          },
          { label: "Where", value: program.event.venue },
          {
            label: "Updated",
            value: new Intl.DateTimeFormat("en", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: program.event.timeZone,
            }).format(new Date(program.event.updatedAt)),
          },
          {
            label: "On stage",
            value: `${program.schedule.length} acts · about ${program.schedule.reduce((total, slot) => total + slot.durationMinutes, 0)} minutes`,
          },
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
          The evening
        </Typography>
        <Stack spacing={1}>
          {program.event.guidelines.map((guideline) => (
            <Typography key={guideline} color="text.secondary">
              {guideline}
            </Typography>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
