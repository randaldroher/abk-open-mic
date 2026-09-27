import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { getPublicProgram } from "@/lib/program-data";

export default async function ActsPage() {
  const { acts } = await getPublicProgram();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="secondary">
          The lineup
        </Typography>
        <Typography variant="h1">Meet the acts</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          A little bit of everything, brought to you live.
        </Typography>
      </Box>
      {acts.length === 0 ? (
        <Typography color="text.secondary">
          No acts have been published yet.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          }}
        >
          {acts.map((act) => (
            <Card key={act.actId} variant="outlined">
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
                  >
                    <Typography variant="h3">{act.displayName}</Typography>
                    <Chip label={`${act.durationMinutes} min`} size="small" />
                  </Stack>
                  <Typography color="text.secondary">
                    {act.description}
                  </Typography>
                  <Typography variant="overline" color="secondary">
                    {act.instruments}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Stack>
  );
}
