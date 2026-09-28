import { Box, Card, CardContent, Skeleton, Stack, Typography } from "@mui/material";

export default function SongCardsSkeleton({ showReferences }: { showReferences: boolean }) {
  return (
    <Box role="status" aria-label="Loading songs" sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" } }}>
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} variant="outlined" aria-hidden="true" sx={{ minWidth: 0 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h3"><Skeleton width="75%" /></Typography>
                <Typography><Skeleton width="55%" /></Typography>
              </Box>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                {[120, 140, 110].map((width) => (
                  <Skeleton key={width} variant="rounded" width={width} height={32} />
                ))}
              </Stack>
              {showReferences && (
                <>
                  <Typography variant="body2"><Skeleton width={140} /></Typography>
                  <Skeleton variant="rounded" width="100%" sx={{ height: "auto", aspectRatio: "16 / 9", borderRadius: 0.5 }} />
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
