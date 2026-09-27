import { Box, Paper, Stack, Typography } from "@mui/material";
import { getPublicProgram } from "@/lib/program-data";

export default async function SchedulePage() {
  const { event, schedule } = await getPublicProgram();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="secondary">
          The running order
        </Typography>
        <Typography variant="h1">Schedule</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          All times are shown in {event?.timeZone ?? "the event's local time"}.
        </Typography>
      </Box>
      {schedule.length === 0 ? (
        <Typography color="text.secondary">
          No schedule has been published yet.
        </Typography>
      ) : (
        <Stack component="ol" spacing={1.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
          {schedule.map((slot) => (
            <Paper
              component="li"
              key={slot.order}
              variant="outlined"
              sx={{
                alignItems: "center",
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "120px 1fr" },
                p: { xs: 2.5, sm: 3 },
              }}
            >
              <Typography color="secondary" variant="h6">
                {event
                  ? new Intl.DateTimeFormat("en", {
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: event.timeZone,
                    }).format(new Date(slot.startsAt))
                  : ""}
              </Typography>
              <Box>
                <Typography variant="h3">{slot.displayName}</Typography>
                <Typography color="text.secondary">
                  {slot.durationMinutes} minutes · {slot.description}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
